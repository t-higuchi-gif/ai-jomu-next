'use client'

import { useMemo, useState } from 'react'
import { PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check' | 'analyze' | 'worry'
type CoreLevel = 'low' | 'medium' | 'high'
type CoreKey = 'connection' | 'orientation' | 'research' | 'entrust'

/* ======================
   CORE ユーティリティ
====================== */

function levelToValue(level: CoreLevel) {
  if (level === 'low') return 1
  if (level === 'high') return 3
  return 2
}

function levelLabel(level: CoreLevel) {
  if (level === 'low') return '低'
  if (level === 'high') return '高'
  return '中'
}

/* ======================
   CORE 行
====================== */

function CoreRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: CoreLevel
  onChange: (next: CoreLevel) => void
}) {
  const pct = (levelToValue(value) / 3) * 100

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <div>{label}</div>
        <div style={{ color: '#666' }}>
          {levelLabel(value)}（{value}）
        </div>
      </div>

      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: '#475569',
            borderRadius: 999,
            transition: 'width .25s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['low', 'medium', 'high'] as CoreLevel[]).map((lv) => {
          const active = value === lv
          return (
            <button
              key={lv}
              type="button"
              onClick={() => onChange(lv)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 999,
                border: '1px solid #d1d5db',
                background: active ? '#e5e7eb' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {lv}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ======================
   CORE ダッシュボード
====================== */

function CoreDashboard({
  persona,
  setPersona,
  onReset,
}: {
  persona: PersonaInput
  setPersona: (next: PersonaInput) => void
  onReset: () => void
}) {
  const update = (key: CoreKey, lv: CoreLevel) => {
    setPersona({ ...persona, [key]: lv })
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: '#fafafa',
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 12 }}>AI常務の人格（CORE）</h3>

      <div style={{ display: 'grid', gap: 16 }}>
        <CoreRow label="Connection（共感）" value={persona.connection} onChange={(lv) => update('connection', lv)} />
        <CoreRow label="Orientation（整理）" value={persona.orientation} onChange={(lv) => update('orientation', lv)} />
        <CoreRow label="Research（深掘り）" value={persona.research} onChange={(lv) => update('research', lv)} />
        <CoreRow label="Entrust（委ね）" value={persona.entrust} onChange={(lv) => update('entrust', lv)} />
      </div>

      <button
        type="button"
        onClick={onReset}
        style={{
          marginTop: 12,
          fontSize: 12,
          background: 'none',
          border: 'none',
          color: '#555',
          cursor: 'pointer',
        }}
      >
        既定に戻す
      </button>
    </div>
  )
}

/* ======================
   Consult Page
====================== */

export default function ConsultPage() {
  const defaultPersona = useMemo<PersonaInput>(
    () => ({
      connection: 'medium',
      orientation: 'medium',
      research: 'medium',
      entrust: 'medium',
    }),
    []
  )

  const [persona, setPersona] = useState(defaultPersona)
  const [showCore, setShowCore] = useState(false)

  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null)

  const [copied, setCopied] = useState(false)

  /* API 呼び出し */
  const callApi = async (mode: Mode) => {
    if (!inputText.trim()) return

    setLoadingMode(mode)
    setResult('')

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, persona, mode }),
      })

      const data = await res.json()
      setResult(data.reply ?? '')

      // 👇 ここ！！（AIの返答が確定した瞬間）
      const payload = {
        mode,
        device: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          ? 'mobile'
          : 'pc',
        text_length: inputText.length,
        response_length: (data.reply ?? '').length,
        core_used: true,
      }

      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json',
        })
        navigator.sendBeacon('/api/log', blob)
      } else {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {})
      }

    } finally {
      setLoadingMode(null)
    }
  }

  const isLoading = loadingMode !== null

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const primaryBtnStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 16,
    background: '#0f172a',
    color: '#fff',
    fontSize: 16,
    border: 'none',
    cursor: 'pointer',
  }

  const secondaryBtnStyle: React.CSSProperties = {
    padding: 14,
    borderRadius: 14,
    background: '#fff',
    border: '1px solid #cbd5f5',
    cursor: 'pointer',
    fontSize: 16,
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      {/* タイトル */}
      <h1
        style={{
          textAlign: 'center',
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        AI常務に相談
      </h1>

      {/* 入力 */}
      <textarea
        rows={6}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="部下・取引先・社内チャットの文面を貼り付けてください"
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          border: '1px solid #cbd5f5',
          boxSizing: 'border-box',
          fontSize: 16,
          lineHeight: 1.7,
        }}
      />

      {/* ボタン群：4段 */}
      <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
        {/* 1段目：返信サポート */}
        <button
          type="button"
          onClick={() => callApi('support')}
          disabled={isLoading}
          style={{
            ...primaryBtnStyle,
            opacity: isLoading && loadingMode !== 'support' ? 0.5 : 1,
          }}
        >
          {loadingMode === 'support' ? '返信案を考えています…' : '返信サポート'}
        </button>

        {/* 2段目：返信チェック */}
        <button
          type="button"
          onClick={() => callApi('check')}
          disabled={isLoading}
          style={{
            ...secondaryBtnStyle,
            opacity: isLoading && loadingMode !== 'check' ? 0.5 : 1,
          }}
        >
          {loadingMode === 'check' ? '表現をチェックしています…' : '返信チェック'}
        </button>

        {/* 3段目：お悩み相談 */}
        <button
          type="button"
          onClick={() => callApi('worry')}
          disabled={isLoading}
          style={{
            ...secondaryBtnStyle,
            opacity: isLoading && loadingMode !== 'worry' ? 0.5 : 1,
          }}
        >
          {loadingMode === 'worry' ? '一緒に整理しています…' : 'お悩み相談'}
        </button>

        {/* 4段目：CORE分析・クリア */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            onClick={() => callApi('analyze')}
            disabled={isLoading}
            style={{
              ...secondaryBtnStyle,
              opacity: isLoading && loadingMode !== 'analyze' ? 0.5 : 1,
            }}
          >
            {loadingMode === 'analyze' ? '人格を分析しています…' : 'CORE分析'}
          </button>

          <button
            type="button"
            onClick={() => {
              setInputText('')
              setResult('')
            }}
            disabled={isLoading}
            style={{
              padding: 14,
              borderRadius: 14,
              background: '#fff',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            クリア
          </button>
        </div>
      </div>

      {/* 人格調整ボタン（中央寄せ固定） */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setShowCore((v) => !v)}
          style={{
            margin: '20px auto 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 999,
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: 14,
            cursor: 'pointer',
            color: '#111',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'background .2s ease, box-shadow .2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb'
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          {showCore ? '▲ 人格調整を閉じる' : '▼ AI常務の人格を調整する'}
        </button>
      </div>

      {/* CORE 展開 */}
      <div
        style={{
          marginTop: 16,
          overflow: 'hidden',
          transition: 'all 0.35s ease',
          opacity: showCore ? 1 : 0,
          transform: showCore ? 'translateY(0)' : 'translateY(-8px)',
          maxHeight: showCore ? 1000 : 0,
          pointerEvents: showCore ? 'auto' : 'none',
        }}
      >
        <CoreDashboard persona={persona} setPersona={setPersona} onReset={() => setPersona(defaultPersona)} />
      </div>

      {/* 結果表示：外枠 + 中の白い枠（復活） */}
      {result && (
        <div
          style={{
            marginTop: 28,
            padding: 16,
            borderRadius: 16,
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>🤖 AI常務からの提案</div>

            <button
              type="button"
              onClick={copyResult}
              style={{
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>

          <pre
            style={{
              margin: 0,
              padding: 12,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14,
              color: '#0f172a',
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

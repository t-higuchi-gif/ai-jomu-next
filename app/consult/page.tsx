'use client'

import { useMemo, useState } from 'react'
import { PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check' | 'analyze'
type CoreLevel = 'low' | 'medium' | 'high'
type CoreKey = 'connection' | 'orientation' | 'research' | 'entrust'

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

  // ★ クリックした瞬間に色が変わる
  const barColor = (() => {
    if (value === 'low') return '#D1D5DB'    // light gray
    if (value === 'medium') return '#9CA3AF' // medium gray
    return '#4B5563'                         // dark gray
  })()

  const SegButton = ({ lv }: { lv: CoreLevel }) => {
    const active = value === lv
    return (
      <button
        type="button"
        onClick={() => onChange(lv)}
        style={{
          fontSize: 12,
          padding: '6px 10px',
          borderRadius: 999,
          border: '1px solid #ddd',
          background: active ? '#ddd' : '#fff',
          cursor: 'pointer',
        }}
        aria-pressed={active}
      >
        {lv}
      </button>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#777' }}>
          {levelLabel(value)}（{value}）
        </div>
      </div>

      {/* バー */}
      <div
        style={{
          height: 10,
          width: '100%',
          background: '#eee',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: barColor,
            borderRadius: 999,
            transition: 'width 0.25s ease, background 0.2s ease',
          }}
        />
      </div>

      {/* 手動調整 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <SegButton lv="low" />
        <SegButton lv="medium" />
        <SegButton lv="high" />
      </div>
    </div>
  )
}

function CoreDashboard({
  persona,
  setPersona,
  onReset,
}: {
  persona: PersonaInput
  setPersona: (next: PersonaInput) => void
  onReset: () => void
}) {
  const update = (key: CoreKey, next: CoreLevel) => {
    setPersona({
      ...persona,
      [key]: next,
    })
  }

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: '1px solid #eee',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ margin: 0 }}>現在のAI常務 CORE</h3>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#777' }}>
            ※ クリックで手動調整できます
          </div>
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            既定に戻す
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
        <CoreRow
          label="Connection（共感・承認）"
          value={persona.connection as CoreLevel}
          onChange={(lv) => update('connection', lv)}
        />
        <CoreRow
          label="Orientation（整理・方向づけ）"
          value={persona.orientation as CoreLevel}
          onChange={(lv) => update('orientation', lv)}
        />
        <CoreRow
          label="Research（問い・深掘り）"
          value={persona.research as CoreLevel}
          onChange={(lv) => update('research', lv)}
        />
        <CoreRow
          label="Entrust（任せる・委ねる）"
          value={persona.entrust as CoreLevel}
          onChange={(lv) => update('entrust', lv)}
        />
      </div>
    </div>
  )
}

export default function ConsultPage() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  /** CORE（AI常務の人格状態） */
  const defaultPersona = useMemo<PersonaInput>(
    () => ({
      connection: 'medium',
      orientation: 'medium',
      research: 'medium',
      entrust: 'medium',
    }),
    []
  )

  const [persona, setPersona] = useState<PersonaInput>(defaultPersona)

  /** API 呼び出し */
  const callConsultApi = async (text: string, mode: Mode) => {
    if (!text) return

    setLoading(true)
    setError('')
    setResult('')
    setCopied(false)

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, persona, mode }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      /** CORE分析モード */
      if (mode === 'analyze') {
        const parsed = JSON.parse(data.reply)

        setPersona({
          connection: parsed.connection,
          orientation: parsed.orientation,
          research: parsed.research,
          entrust: parsed.entrust,
        })

        setResult(
`【AI常務がアップデートされました】

Connection : ${parsed.connection}
Orientation: ${parsed.orientation}
Research   : ${parsed.research}
Entrust    : ${parsed.entrust}

${parsed.summary}

※ 次回以降の返信は、この人格をもとに行われます`
        )
      } else {
        setResult(data.reply)
      }
    } catch (e) {
      console.error(e)
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  /** コピー */
  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  /** クリア */
  const clearAll = () => {
    setInputText('')
    setResult('')
    setError('')
    setCopied(false)
  }

  /** COREを既定に戻す */
  const resetPersona = () => {
    setPersona(defaultPersona)
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 720,
        margin: '0 auto',
        overflowX: 'hidden',
      }}
    >
      <h1>AI常務に相談</h1>

      <p style={{ color: '#555', fontSize: 14 }}>
        言葉選びや判断に迷ったとき、<br />
        「理想のあなたならどう考えるか」を整理します。
      </p>

      {/* COREの可視化＆手動調整 */}
      <CoreDashboard persona={persona} setPersona={setPersona} onReset={resetPersona} />

      <textarea
        rows={6}
        style={{ width: '100%', boxSizing: 'border-box', marginTop: 16 }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="部下とのやり取り、または送信前のメッセージを貼り付けてください"
      />

      {/* ボタン群 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => callConsultApi(inputText, 'support')} disabled={loading || !inputText}>
          {loading ? '考え中…' : '返信サポート'}
        </button>

        <button onClick={() => callConsultApi(inputText, 'check')} disabled={loading || !inputText}>
          返信チェック
        </button>

        <button onClick={() => callConsultApi(inputText, 'analyze')} disabled={loading || !inputText}>
          CORE分析
        </button>

        <button onClick={clearAll} disabled={loading}>
          クリア
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        <div>※ 返信サポート：返し方を一緒に考えます</div>
        <div>※ 返信チェック：表現の強さや誤解を確認します</div>
        <div>※ CORE分析：あなたの関わり方の傾向を反映します</div>
        <div>※ COREは上のボタンで手動調整できます（クリックで色も変化）</div>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: 12 }}>
          {error}
        </p>
      )}

      {result && (
        <>
          <hr style={{ margin: '24px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>AI常務からのアウトプット</h3>
            <button onClick={copyResult} style={{ fontSize: 12 }}>
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            ― 理想のあなたなら、こう考えるかもしれません ―
          </div>

          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowX: 'auto',
              maxWidth: '100%',
              boxSizing: 'border-box',
              lineHeight: 1.6,
            }}
          >
            {result}
          </pre>
        </>
      )}
    </div>
  )
}

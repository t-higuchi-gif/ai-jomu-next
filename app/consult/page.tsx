'use client'

import { useState } from 'react'
import { PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check'

export default function ConsultPage() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const persona: PersonaInput = {
    position: '常務',
    audience: ['部下', '社内関係者'],
    stance: ['冷静', '誠実', '丁寧'],
    primaryStance: '冷静',
    regretPatterns: ['言いすぎる'],
  }

  /** API 呼び出し（mode 対応） */
  const callConsultApi = async (
    text: string,
    mode: Mode
  ) => {
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
      setResult(data.reply)
    } catch (e) {
      console.error(e)
      setError('AI常務との通信でエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  /** 返信サポート（返信案を考える） */
  const replySupport = () => {
    const wrapped = `
以下には、
・相手からのメッセージ
・それに対して返そうとしているあなたの文章
が混在している可能性があります。

目的は「返信案を一緒に考えること」です。
「理想のあなたならどう返すか」という視点で、
いくつかの選択肢を提示してください。

---
${inputText}
---
    `.trim()

    callConsultApi(wrapped, 'support')
  }

  /** 返信チェック（校閲・炎上防止） */
  const replyCheck = () => {
    const wrapped = `
以下は、あなた自身が送信しようとしている文章です。
相手のメッセージではありません。

この文章を、
・相手の意図として解釈しない
・相手の気持ちを代弁しない

目的は、
・強く受け取られそうな表現がないか
・感情的、攻撃的、誤解を招く可能性がないか
を客観的に確認することです。

必要に応じて、
・注意点
・少し和らげた表現案
を提示してください。

---
${inputText}
---
    `.trim()

    callConsultApi(wrapped, 'check')
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

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>AI常務に相談</h1>

      <p>
        感情的になりそうな時や、言葉選びに迷った時に、<br />
        AI常務が「理想のあなたならどう返すか」という視点で、
        返信案を一緒に考えます。
      </p>

      <textarea
        rows={6}
        style={{ width: '100%' }}
        placeholder={
          '相手のメッセージ、または返信前のあなたのメッセージを貼り付けてください。\n' +
          '（どちらか一方だけでも大丈夫です）'
        }
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={replySupport} disabled={loading || !inputText}>
          {loading ? '考え中…' : '返信サポート'}
        </button>

        <button onClick={replyCheck} disabled={loading || !inputText}>
          返信チェック
        </button>

        <button onClick={clearAll} disabled={loading}>
          クリア
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        <div>※ 返信サポート：返し方に迷った時に、返信案を一緒に考えます</div>
        <div>※ 返信チェック：今の文章で大丈夫か、客観的に確認します</div>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: 12 }}>
          {error}
        </p>
      )}

      {result && (
        <>
          <hr />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0 }}>AI常務からのアドバイス</h3>
            <button onClick={copyResult} style={{ fontSize: 12 }}>
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            ― 理想のあなたなら、こう返すかもしれません ―
          </div>

          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              whiteSpace: 'pre-wrap',
            }}
          >
            {result}
          </pre>
        </>
      )}
    </div>
  )
}

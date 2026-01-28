'use client'

import { useState } from 'react'
import { generatePersonaPrompt, PersonaInput } from '@/lib/persona'

export default function SetupPage() {
  const [persona, setPersona] = useState<PersonaInput>({
    position: '',
    audience: [],
    stance: [],
    primaryStance: '',
    regretPatterns: [],
  })

  const [prompt, setPrompt] = useState<string>('')

  const toggleArrayValue = (key: 'audience' | 'stance', value: string) => {
    setPersona((prev) => {
      const current = prev[key]
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  }

  const generate = () => {
    const p = generatePersonaPrompt(persona)
    setPrompt(p)
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>AI常務｜人格ヒアリング</h1>

      {/* Q1 */}
      <div>
        <h3>あなたの立場</h3>
        <input
          type="text"
          value={persona.position}
          onChange={(e) =>
            setPersona({ ...persona, position: e.target.value })
          }
          placeholder="例：常務、上司、調整役"
        />
      </div>

      {/* Q2 */}
      <div>
        <h3>主なやり取り相手</h3>
        {['上司', '部下', '顧客', '社内関係者'].map((v) => (
          <label key={v} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={persona.audience.includes(v)}
              onChange={() => toggleArrayValue('audience', v)}
            />
            {v}
          </label>
        ))}
      </div>

      {/* Q3 */}
      <div>
        <h3>大切にしたいスタンス</h3>
        {['冷静', '誠実', '丁寧', '公平', '共感的'].map((v) => (
          <label key={v} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={persona.stance.includes(v)}
              onChange={() => toggleArrayValue('stance', v)}
            />
            {v}
          </label>
        ))}
      </div>

      {/* Q4 */}
      <div>
        <h3>最も優先したいスタンス</h3>
        <select
          value={persona.primaryStance}
          onChange={(e) =>
            setPersona({ ...persona, primaryStance: e.target.value })
          }
        >
          <option value="">選択してください</option>
          {persona.stance.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Q5 */}
      <div>
        <h3>後悔しがちなパターン（任意）</h3>
        <input
          type="text"
          placeholder="例：言いすぎる"
          onChange={(e) =>
            setPersona({
              ...persona,
              regretPatterns: [e.target.value],
            })
          }
        />
      </div>

      <hr />

      <button onClick={generate}>人格プロンプトを生成</button>

      {prompt && (
        <>
          <h3>生成された人格プロンプト</h3>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 16,
              whiteSpace: 'pre-wrap',
            }}
          >
            {prompt}
          </pre>
        </>
      )}
    </div>
  )
}

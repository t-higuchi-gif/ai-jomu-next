'use client'

import { useState } from 'react'
import { PersonaInput, CoreLevel } from '@/lib/persona'

export default function SetupPage() {
  const [persona, setPersona] = useState<PersonaInput>({
    connection: 'medium',
    orientation: 'medium',
    research: 'medium',
    entrust: 'medium',
  })

  const update = (key: keyof PersonaInput, value: CoreLevel) => {
    setPersona((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const renderSelect = (label: string, key: keyof PersonaInput) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>{label}</div>
      <select
        value={persona[key]}
        onChange={(e) =>
          update(key, e.target.value as CoreLevel)
        }
      >
        <option value="low">低</option>
        <option value="medium">中</option>
        <option value="high">高</option>
      </select>
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h1>AI常務 プロフィール設定（CORE）</h1>

      {renderSelect('Connection（共感・承認）', 'connection')}
      {renderSelect('Orientation（方向づけ）', 'orientation')}
      {renderSelect('Research（問い・深掘り）', 'research')}
      {renderSelect('Entrust（任せる）', 'entrust')}

      <pre
        style={{
          marginTop: 24,
          background: '#f5f5f5',
          padding: 12,
          fontSize: 12,
        }}
      >
        {JSON.stringify(persona, null, 2)}
      </pre>
    </div>
  )
}

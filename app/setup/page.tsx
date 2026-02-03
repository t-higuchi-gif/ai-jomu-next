'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CoreLevel = 'low' | 'medium' | 'high'

type PersonaInput = {
  connection: CoreLevel
  orientation: CoreLevel
  research: CoreLevel
  entrust: CoreLevel
}

const LEVELS: CoreLevel[] = ['low', 'medium', 'high']

const levelLabel = (level: CoreLevel) => {
  switch (level) {
    case 'low':
      return '控えめ'
    case 'medium':
      return 'バランス'
    case 'high':
      return '強め'
  }
}

function Slider({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: CoreLevel
  onChange: (v: CoreLevel) => void
}) {
  const index = LEVELS.indexOf(value)

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        {LEVELS.map((level, i) => {
          const active = i === index
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={[
                'flex-1 rounded-lg py-3 text-sm transition',
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {levelLabel(level)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SetupPage() {
  const router = useRouter()

  const [persona, setPersona] = useState<PersonaInput>({
    connection: 'medium',
    orientation: 'medium',
    research: 'medium',
    entrust: 'medium',
  })

  // 初回ロード時に localStorage から復元
  useEffect(() => {
    const saved = localStorage.getItem('ai-persona')
    if (saved) {
      setPersona(JSON.parse(saved))
    }
  }, [])

  // 変更時に保存
  useEffect(() => {
    localStorage.setItem('ai-persona', JSON.stringify(persona))
  }, [persona])

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            AI Persona Setup
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            このAIが、あなたとどう向き合い、
            <br />
            どう考え、どこまで委ねるかを調整します。
          </p>
        </header>

        {/* Sliders */}
        <section className="space-y-6">
          <Slider
            label="Connection"
            description="あなたとの距離感"
            value={persona.connection}
            onChange={(v) => setPersona({ ...persona, connection: v })}
          />

          <Slider
            label="Orientation"
            description="結論への導き方"
            value={persona.orientation}
            onChange={(v) => setPersona({ ...persona, orientation: v })}
          />

          <Slider
            label="Research"
            description="深掘りの強さ"
            value={persona.research}
            onChange={(v) => setPersona({ ...persona, research: v })}
          />

          <Slider
            label="Entrust"
            description="判断の委ね方"
            value={persona.entrust}
            onChange={(v) => setPersona({ ...persona, entrust: v })}
          />
        </section>
      </div>

      {/* Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white px-4 py-3">
        <button
          onClick={() => router.push('/consult')}
          className="mx-auto block w-full max-w-xl rounded-xl bg-gray-900 py-4 text-white text-sm font-medium hover:bg-gray-800 transition"
        >
          この人格で相談する →
        </button>
      </div>
    </main>
  )
}

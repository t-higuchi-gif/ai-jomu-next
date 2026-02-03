'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CoreLevel = 'low' | 'medium' | 'high'

type PersonaInput = {
  connection: CoreLevel
  orientation: CoreLevel
  research: CoreLevel
  entrust: CoreLevel
}

const LEVELS: CoreLevel[] = ['low', 'medium', 'high']

const label = {
  low: '控えめ',
  medium: 'バランス',
  high: '強め',
}

function Slider({
  title,
  desc,
  value,
  onChange,
}: {
  title: string
  desc: string
  value: CoreLevel
  onChange: (v: CoreLevel) => void
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <div className="flex gap-2">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => onChange(lv)}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition
              ${value === lv
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {label[lv]}
          </button>
        ))}
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

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-8">
        <h1 className="text-2xl font-bold">AI Persona Setup</h1>

        <Slider
          title="Connection"
          desc="あなたとの距離感"
          value={persona.connection}
          onChange={(v) => setPersona(p => ({ ...p, connection: v }))}
        />
        <Slider
          title="Orientation"
          desc="結論への導き方"
          value={persona.orientation}
          onChange={(v) => setPersona(p => ({ ...p, orientation: v }))}
        />
        <Slider
          title="Research"
          desc="深掘りの強さ"
          value={persona.research}
          onChange={(v) => setPersona(p => ({ ...p, research: v }))}
        />
        <Slider
          title="Entrust"
          desc="判断の委ね方"
          value={persona.entrust}
          onChange={(v) => setPersona(p => ({ ...p, entrust: v }))}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={() => router.push('/consult')}
          className="mx-auto block w-full max-w-xl rounded-xl bg-gray-900 py-4 text-white font-semibold hover:bg-gray-800"
        >
          この人格で相談する →
        </button>
      </div>
    </main>
  )
}

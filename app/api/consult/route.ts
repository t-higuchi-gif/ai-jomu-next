import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { generatePersonaPrompt, PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check' | 'analyze'

export async function POST(req: Request) {
  try {
    const { text, persona, mode } = await req.json() as {
      text: string
      persona: PersonaInput
      mode: Mode
    }

    if (!text || !persona || !mode) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const personaPrompt = generatePersonaPrompt(persona)

    const supportPrompt = `
目的は「返信案を一緒に考えること」です。
断定や命令はせず、
「理想のあなたならどう返すか」という視点で
複数の選択肢を提示してください。
`.trim()

    const checkPrompt = `
以下の文章は、あなた自身が送信しようとしている文章です。

【出力形式】
【気になる点】
【理由】
【やわらかい言い換え案】

判断は必ず人に委ねてください。
`.trim()

    const analyzePrompt = `
あなたはマネジメント行動分析AIです。

以下の文章から、
上司としての関わり方を
COREモデルで分析してください。

【CORE定義】
- Connection
- Orientation
- Research
- Entrust

low / medium / high で評価し、
最後に summary を1文で付けてください。

【出力形式（JSONのみ）】
{
  "connection": "high",
  "orientation": "medium",
  "research": "low",
  "entrust": "medium",
  "summary": "〇〇"
}
`.trim()

    const rolePrompt =
      mode === 'analyze'
        ? analyzePrompt
        : mode === 'check'
        ? checkPrompt
        : supportPrompt

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: personaPrompt },
        { role: 'system', content: rolePrompt },
        { role: 'user', content: text },
      ],
    })

    const reply = completion.choices[0].message.content
    return NextResponse.json({ reply })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

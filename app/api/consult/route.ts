import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check' | 'analyze'

export async function POST(req: Request) {
  try {
    const { text, persona, mode } = (await req.json()) as {
      text: string
      persona: PersonaInput
      mode: Mode
    }

    if (!text || !persona || !mode) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    /**
     * AI常務 COREベース人格プロンプト
     */
    const personaPrompt = `
あなたはAI常務です。

現在のあなたのマネジメント特性は以下の通りです。

- Connection（共感・関係構築）：${persona.connection}
- Orientation（方向づけ・期待提示）：${persona.orientation}
- Research（問い・深掘り）：${persona.research}
- Entrust（委ね・裁量）：${persona.entrust}

これらの特性を踏まえ、
相手のやる気や心理的安全性を尊重しながら、
落ち着いたトーンで思考を整理してください。

あなたは判断・命令・評価は行いません。
必ず「選択肢の提示」に留めてください。
`.trim()

    /**
     * 返信サポート
     */
    const supportPrompt = `
目的は「返信案を一緒に考えること」です。

・断定しない
・命令しない
・評価しない

「理想のあなたならどう返すか」という視点で、
複数の自然な選択肢を提示してください。
`.trim()

    /**
     * 返信チェック
     */
    const checkPrompt = `
以下の文章は、
あなた自身が送信しようとしている文章です。

相手の意図を代弁したり、
善悪・正誤を判断したりしないでください。

【出力形式】
【気になる点】
【理由】
【やわらかい言い換え案】

最終判断は必ず人に委ねてください。
`.trim()

    /**
     * CORE分析
     */
    const analyzePrompt = `
あなたはマネジメント行動分析AIです。

以下の文章から、
上司としての関わり方を
COREモデルで分析してください。

【CORE定義】
- Connection：共感・承認・関係性
- Orientation：期待・方向づけ
- Research：問い・深掘り
- Entrust：任せる・裁量

それぞれを
"low" / "medium" / "high"
で評価してください。

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
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

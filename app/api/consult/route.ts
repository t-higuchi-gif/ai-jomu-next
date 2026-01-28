import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { generatePersonaPrompt, PersonaInput } from '@/lib/persona'

type Mode = 'support' | 'check'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { text, persona, mode } = body as {
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

    /** 共通：人格プロンプト（AI常務そのもの） */
    const personaPrompt = generatePersonaPrompt(persona)

    /** 返信サポート用（返信案を一緒に考える） */
    const supportPrompt = `
あなたはAI常務です。

以下の文章には、
・相手からのメッセージ
・それに対して返そうとしている文章
が混在している可能性があります。

目的は「返信案を一緒に考えること」です。

・相手の意図を整理しても構いません
・翻訳や言い換えを行っても構いません
・ただし断定や命令はせず、
  「理想のあなたならどう返すか」という視点で
  選択肢を提示してください。
`.trim()

    /** 返信チェック用（校閲・炎上防止） */
    const checkPrompt = `
あなたはAI常務です。

以下の文章は、
【あなた自身が送信しようとしている文章】です。
相手のメッセージではありません。

この文章を、
・相手の意図として解釈しない
・相手の気持ちを代弁しない
・正誤や善悪を断定しない

目的は、
この文章が相手にどう受け取られる可能性があるかを
冷静に整理することです。

【出力形式】
必ず、以下の形式で出力してください。

【気になる点】
・相手によっては強く受け取られる可能性がある表現

【理由】
・なぜそのように受け取られる可能性があるのか

【やわらかい言い換え案】
・トーンを和らげた表現案（複数可）

※ 判断や最終選択は人に委ねてください。
`.trim()

    /** mode によって役割を切り替える */
    const rolePrompt =
      mode === 'check' ? checkPrompt : supportPrompt

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: personaPrompt },
        { role: 'system', content: rolePrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.4,
    })

    const reply = completion.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

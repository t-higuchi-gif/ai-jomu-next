import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await fetch(process.env.GAS_LOG_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: body.mode,
        device: body.device,
        text_length: body.text_length,
        response_length: body.response_length,
        core_used: body.core_used,
        version: "v1",
      }),
    });

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    // ログ失敗はユーザー体験に影響させない
    return NextResponse.json({ status: "ng" });
  }
}

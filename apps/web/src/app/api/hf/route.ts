import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No HF API key configured' }, { status: 500 });
  }

  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  const prompt = `Convert this English sentence to sign language tokens.
Remove articles, prepositions, auxiliary verbs.
Convert pronouns to their sign equivalents.
Return ONLY uppercase English sign language tokens, NOT Arabic transliterations.

Available tokens: HELLO, THANK_YOU, PLEASE, YES, NO, HELP, GOOD, I, YOU, HE, SHE, WE, THEY, WHAT, WHERE, HOW, SCHOOL, GO, COME, NAME, TODAY, TOMORROW, HAPPY, SAD, NEED, KNOW, WANT, LIKE, WATER, FOOD, EAT, DRINK, FRIEND, FAMILY, WORK, GOODBYE, LOVE, SORRY, MORNING, NIGHT

Examples:
Input: "I am going to school tomorrow" -> "I GO SCHOOL TOMORROW"
Input: "How are you doing today" -> "HOW YOU TODAY"
Input: "Thank you very much" -> "THANK_YOU"
Input: "I need help please" -> "I NEED HELP PLEASE"
Input: "What is your name" -> "WHAT NAME"
Input: "Good morning my friend" -> "GOOD MORNING FRIEND"

Input: "${text}" ->`;

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-8B',
        messages: [
          {
            role: 'system',
            content:
              '/no_think\nYou convert English text to Emirati Sign Language tokens. Return ONLY uppercase English sign tokens. NEVER return Arabic transliterations. Use ONLY these tokens: HELLO, THANK_YOU, PLEASE, YES, NO, HELP, GOOD, I, YOU, HE, SHE, WE, THEY, WHAT, WHERE, HOW, SCHOOL, GO, COME, NAME, TODAY, TOMORROW, HAPPY, SAD, NEED, KNOW, WANT, LIKE, WATER, FOOD, EAT, DRINK, FRIEND, FAMILY, WORK, GOODBYE, LOVE, SORRY, MORNING, NIGHT',
          },
          { role: 'user', content: text },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `HF API ${response.status}: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';
    const tokens = output
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map((t: string) => t.toUpperCase());

    return NextResponse.json({ tokens });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'HF request failed' }, { status: 500 });
  }
}

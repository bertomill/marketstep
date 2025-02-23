import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { events } = await request.json();

    const prompt = `Analyze the following company events and provide a comprehensive summary:

${events.map(event => `
Company: ${event.company}
Event Type: ${event.type}
Date: ${event.date}
Title: ${event.title}
Quarter: ${event.quarter} ${event.year}
`).join('\n')}

Please provide:
1. Key highlights and takeaways
2. Important financial metrics mentioned
3. Strategic initiatives discussed
4. Market context and competitive analysis
5. Forward-looking statements and guidance`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst providing insights on company events and earnings reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      analysis: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error analyzing events:', error);
    return NextResponse.json({ error: 'Failed to analyze events' }, { status: 500 });
  }
} 
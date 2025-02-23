import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { analysis, question } = await request.json();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst helping users understand SEC filings."
        },
        {
          role: "user",
          content: `Based on this filing analysis: ${JSON.stringify(analysis)}\n\nQuestion: ${question}`
        }
      ]
    });

    return NextResponse.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('Error in question answering:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
} 
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
}

// Set maximum duration for the API call
export const maxDuration = 30;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Handle POST requests to /api/chat
export async function POST(req: Request) {
  try {
    const { messages, userContext, model } = await req.json();
    
    // Fetch user's notes if we have user context
    let userNotes: Note[] = [];
    if (userContext?.uid) {
      try {
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', userContext.uid)
        );
        const querySnapshot = await getDocs(q);
        userNotes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          userId: doc.data().userId
        } as Note));
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
    
    // Create system prompt with user context and notes if available
    let systemMessage = null;
    
    if (userContext) {
      const systemPrompt = `You are an AI assistant for MarketStep, a platform for market research and financial analysis.

USER CONTEXT:
- Name: ${userContext.displayName || 'Unknown'}
- Email: ${userContext.email}
- Occupation: ${userContext.occupation || 'Unknown'}
- Bio: ${userContext.bio || 'Not provided'}

USER NOTES:
${userNotes.map(note => `- "${note.title}": ${note.content}`).join('\n')}

Based on this context:
${userContext.occupation === 'Investment Banking' ? '- Focus on providing detailed financial analysis, market trends, and SEC filing insights\n' : ''}${userContext.occupation === 'Investor Relations' ? '- Emphasize content creation, stakeholder communications, and market analysis\n' : ''}${userContext.occupation === 'Strategy/M&A' ? '- Focus on merger analysis, strategic insights, and market opportunities\n' : ''}${userContext.occupation === 'Private Investor' ? '- Emphasize individual investment opportunities and portfolio analysis\n' : ''}

Your capabilities include:
• Market research and analysis
• SEC filing analysis
• Content creation and editing
• Notes management and reference
• Calendar scheduling
• Company tracking

You have access to the user's notes and can reference them in your responses when relevant.
Maintain a professional yet approachable tone, and tailor your responses to the user's professional background and stated interests.`;

      // Add system message at the beginning
      systemMessage = { role: "system", content: systemPrompt };
    }

    if (model === 'gemini') {
      // Use Gemini model
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Convert messages to Gemini format
      const geminiMessages = (systemMessage ? [systemMessage, ...messages] : messages).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      }));

      const result = await geminiModel.generateContentStream({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Convert Gemini stream to standard format
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Use Claude model (default)
      const result = streamText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        messages: systemMessage ? [systemMessage, ...messages] : messages,
      });
      
      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate chat response', details: error instanceof Error ? error.message : String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

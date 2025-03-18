import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

// Set maximum duration for the API call
export const maxDuration = 30;

// Handle POST requests to /api/chat
export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();
    
    // Create system prompt with user context if available
    let systemMessage = null;
    
    if (userContext) {
      const systemPrompt = `You are an AI assistant for MarketStep, a platform for market research and financial analysis.

USER CONTEXT:
- Name: ${userContext.displayName || 'Unknown'}
- Email: ${userContext.email}
- Occupation: ${userContext.occupation || 'Unknown'}
- Bio: ${userContext.bio || 'Not provided'}

Based on this context:
${userContext.occupation === 'Investment Banking' ? '- Focus on providing detailed financial analysis, market trends, and SEC filing insights\n' : ''}${userContext.occupation === 'Investor Relations' ? '- Emphasize content creation, stakeholder communications, and market analysis\n' : ''}${userContext.occupation === 'Strategy/M&A' ? '- Focus on merger analysis, strategic insights, and market opportunities\n' : ''}${userContext.occupation === 'Private Investor' ? '- Emphasize individual investment opportunities and portfolio analysis\n' : ''}

Your capabilities include:
• Market research and analysis
• SEC filing analysis
• Content creation and editing
• Task management
• Calendar scheduling
• Company tracking

Maintain a professional yet approachable tone, and tailor your responses to the user's professional background and stated interests.`;

      // Add system message at the beginning
      systemMessage = { role: "system", content: systemPrompt };
    }

    const result = streamText({
      model: anthropic("claude-3-7-sonnet-20250219"),
      messages: systemMessage ? [systemMessage, ...messages] : messages,
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate chat response', details: error instanceof Error ? error.message : String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

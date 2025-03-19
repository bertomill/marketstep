'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Event } from '../calendar/calendarService';

// Define types for AI chat interactions
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface StudioDocument {
  id: string;
  title: string;
  content: string;
  userId: string;
  lastModified: Date;
  chatHistory: ChatMessage[];
  // New fields for business context
  companyName?: string;
  industry?: string;
  researchType?: 'competitor-analysis' | 'market-research' | 'earnings-summary' | 'company-profile' | 'industry-report';
  tags: string[];
  sources: Array<{
    type: 'event' | 'filing' | 'news' | 'research';
    id: string;
    title: string;
    date: Date;
  }>;
}

/**
 * Generates content with Gemini 2.0 Flash based on events and user input
 * @param prompt User's instructions/prompt
 * @param events Calendar events to use as context
 * @returns The AI-generated content
 */
export async function generateContent(
  prompt: string, 
  events: Event[]
): Promise<string> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Format events into text to use as context
    const eventsContext = events.map(event => {
      // Extract notes and additional metadata if available
      const notes = event.metadata?.notes || '';
      let summaryContent = '';
      let eventType = '';
      
      // Extract summary content if this is a summary note
      if (event.title.includes('::SUMMARY::')) {
        const parts = event.title.split('::SUMMARY::');
        summaryContent = parts[1] || '';
      }

      // Determine event type from title or metadata
      if (event.title.toLowerCase().includes('earnings')) {
        eventType = 'Earnings Call/Report';
      } else if (event.title.toLowerCase().includes('meeting')) {
        eventType = 'Business Meeting';
      } else if (event.title.toLowerCase().includes('research')) {
        eventType = 'Research Session';
      }
      
      // Format the event information with more business context
      return `
Event Type: ${eventType || 'General Event'}
Title: ${event.title.split('::SUMMARY::')[0]}
Date: ${new Date(event.start).toLocaleDateString()}
${notes ? `Key Points:\n${notes}` : ''}
${summaryContent ? `Detailed Summary:\n${summaryContent}` : ''}
      `.trim();
    }).join('\n\n');

    // Prepare the prompt with events as context and business focus
    const fullPrompt = `
You are an expert business content writer and analyst. Your goal is to help create professional business content using the following calendar events as context. These events may include earnings calls, research sessions, meetings, and other business activities.

CALENDAR EVENTS CONTEXT:
${eventsContext}

USER REQUEST: ${prompt}

Please generate professional business content that:
1. Maintains a formal, analytical tone
2. Incorporates relevant data and insights from the events
3. Follows standard business writing practices
4. Includes clear sections and structure
5. Highlights key findings and implications
6. Provides actionable recommendations when appropriate

Generate the content now:
`;

    // Generate the content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    return `Error: ${error instanceof Error ? error.message : 'Failed to generate content'}`;
  }
}

/**
 * Sends a chat message to Gemini and gets a response
 * @param chatHistory Previous chat messages for context
 * @param newMessage The new user message to send
 * @param documentContent Current document content for context
 * @returns The AI response
 */
export async function getChatResponse(
  chatHistory: ChatMessage[],
  newMessage: string,
  documentContent: string
): Promise<string> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Format chat history for context
    const formattedHistory = chatHistory.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    // Prepare the chat prompt with enhanced business focus
    const prompt = `
You are an expert business content assistant with deep knowledge of company research, market analysis, and professional writing. You're collaborating with the user on a business document.

CURRENT DOCUMENT CONTENT:
${documentContent}

PREVIOUS CONVERSATION:
${formattedHistory}

USER QUERY: ${newMessage}

As the AI assistant:
1. Help improve the document's professional quality and analytical depth
2. Suggest relevant business frameworks or analysis methods when appropriate
3. Help identify gaps in the research or analysis
4. Provide industry-standard formatting suggestions
5. Offer data-driven insights and recommendations
6. Maintain consistency with standard business writing practices

Please provide your response with this business context in mind.
`;

    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat response:', error);
    return `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Failed to generate response'}`;
  }
} 
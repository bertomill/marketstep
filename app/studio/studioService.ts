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
      
      // Extract summary content if this is a summary note
      if (event.title.includes('::SUMMARY::')) {
        const parts = event.title.split('::SUMMARY::');
        summaryContent = parts[1] || '';
      }
      
      // Format the event information
      return `
Event: ${event.title.split('::SUMMARY::')[0]}
Date: ${new Date(event.start).toLocaleDateString()}
${notes ? `Notes: ${notes}` : ''}
${summaryContent ? `Content: ${summaryContent}` : ''}
      `.trim();
    }).join('\n\n');

    // Prepare the prompt with events as context
    const fullPrompt = `
You are a helpful writing assistant. Use the following calendar events as context:

${eventsContext}

User request: ${prompt}

Please generate content based on the user's request and the provided calendar events.
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

    // Prepare the prompt with document content and chat history
    const prompt = `
You are a helpful writing assistant collaborating with the user on a document.

CURRENT DOCUMENT CONTENT:
${documentContent}

PREVIOUS CONVERSATION:
${formattedHistory}

USER QUERY: ${newMessage}

As the AI assistant, help the user with their writing and respond to their specific query. You can provide suggestions, insights, edits, research help, or any other assistance they need.
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
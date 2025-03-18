import { GoogleGenerativeAI } from '@google/generative-ai';

type SummarizeTranscriptResponse = {
  summary: string;
  error?: string;
};

type SummarizeFilingResponse = {
  summary: string;
  error?: string;
};

/**
 * Summarizes a transcript using the Gemini API
 * @param transcriptText The full text of the transcript to summarize
 * @returns A promise that resolves to the summary text or error
 */
export async function summarizeTranscript(transcriptText: string): Promise<SummarizeTranscriptResponse> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt for summarization
    const prompt = `
      Please summarize the following earnings call transcript in 3-5 paragraphs. 
      Focus on key financial results, business outlook, important announcements, 
      and significant analyst questions or management responses.
      
      TRANSCRIPT:
      ${transcriptText}
    `;

    // Generate the summary
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return { summary };
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    return { 
      summary: 'Failed to generate summary. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Summarizes an 8-K filing using the Gemini API with a shorter, more concise output
 * @param filingText The text content of the 8-K filing
 * @returns A promise that resolves to a brief summary or error
 */
export async function summarizeFiling(filingText: string): Promise<SummarizeFilingResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Please provide a 1-2 sentence summary of the key points from this 8-K filing.
      Focus only on the most important business impact or announcement.
      Make it clear and simple for a general audience.
      
      FILING TEXT:
      ${filingText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return { summary };
  } catch (error) {
    console.error('Error summarizing filing:', error);
    return { 
      summary: 'Unable to generate summary.',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 
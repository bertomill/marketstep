import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

// Define the transcript entry type based on the youtube-transcript package
interface TranscriptEntry {
  text: string;
  duration: number;
  offset: number;
}

// This API route extracts content from a URL
// It takes a URL and returns metadata about the content
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { url } = body;
    
    // Validate URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    try {
      // Special handling for YouTube URLs
      let isYouTube = false;
      let youtubeId = '';
      let transcript: TranscriptEntry[] = [];
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        isYouTube = true;
        // Extract YouTube video ID
        if (url.includes('youtube.com/watch')) {
          const youtubeMatch = url.match(/v=([^&]+)/);
          if (youtubeMatch && youtubeMatch[1]) {
            youtubeId = youtubeMatch[1];
          }
        } else if (url.includes('youtu.be/')) {
          const youtubeMatch = url.match(/youtu\.be\/([^?&]+)/);
          if (youtubeMatch && youtubeMatch[1]) {
            youtubeId = youtubeMatch[1];
          }
        }
        
        // If we have a YouTube ID, try to get the transcript
        if (youtubeId) {
          try {
            transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
          } catch (transcriptError) {
            console.error('Error fetching YouTube transcript:', transcriptError);
            // Continue even if transcript fetch fails
          }
        }
      }
      
      // Fetch the HTML content from the URL
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MarketStepBot/1.0)',
        },
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.status}` },
          { status: 400 }
        );
      }
      
      const htmlText = await response.text();
      
      // Extract title from HTML
      let title = '';
      const titleMatch = htmlText.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      
      // Extract meta description
      let description = '';
      const descriptionMatch = htmlText.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) || 
                             htmlText.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i);
      if (descriptionMatch && descriptionMatch[1]) {
        description = descriptionMatch[1].trim();
      }
      
      // Prepare a full text version of the transcript for easy display
      let transcriptText = '';
      if (transcript.length > 0) {
        transcriptText = transcript
          .map(entry => entry.text)
          .join(' ');
      }
      
      // Return the extracted data
      return NextResponse.json({
        title,
        description,
        url,
        isYouTube,
        youtubeId,
        transcript,
        transcriptText
      });
      
    } catch (error) {
      console.error('Error fetching URL:', error);
      return NextResponse.json(
        { error: 'Failed to fetch URL content', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error in extract-content API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Document {
  content: string;
  company: string;
  form: string;
  date: string;
}

interface UserContext {
  interests?: string;
  industry?: string;
  jobTitle?: string;
  firstName?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getFinancialAnalysisPrompt = (userName: string, userContext: UserContext) => `
You are a senior financial analyst providing insights to ${userName}. 
Focus on extracting and presenting key financial metrics and insights in a clear, structured format.

Key Areas to Analyze:
1. Revenue & Growth
   - Extract specific revenue figures
   - Calculate YoY growth rates
   - Highlight segment performance

2. Profitability
   - Gross margins
   - Operating margins
   - Net profit margins
   - Any significant changes

3. Cash Flow & Balance Sheet
   - Cash position
   - Debt levels
   - Key ratios

4. Technology & Innovation
   - R&D spending
   - New product developments
   - Technology investments

5. Market Position
   - Market share data
   - Competitive advantages
   - Industry trends

Format the response in a clean, easy-to-read structure with:
- Clear section headings
- Bullet points for key metrics
- Tables for comparative data
- Highlighted key insights
- Direct quotes where relevant

Remember to:
- Use specific numbers and percentages
- Compare current vs previous periods
- Highlight trends
- Connect insights to ${userName}'s interests in ${userContext.interests || 'finance and technology'}
`;

export async function POST(request: Request) {
  try {
    const { documents, userContext } = await request.json();
    const userName = userContext.firstName || 'User';

    // Use the documentSummaries and userContextStr
    const documentSummaries = documents.map(doc => {
      const truncatedContent = doc.content.slice(0, 10000);
      return `Document: ${doc.company} ${doc.form} (${doc.date})\n${truncatedContent}`;
    }).join('\n');

    const userContextStr = `
User Background:
- Name: ${userName}
- Current Projects/Interests: ${userContext.interests || 'Not specified'}
- Industry: ${userContext.industry || 'Not specified'}
- Job Title: ${userContext.jobTitle || 'Not specified'}
`;

    // Use these variables in your analysis logic
    const analysisPrompt = `
${userContextStr}

Documents to analyze:
${documentSummaries}

Please analyze these documents...`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert financial analyst specializing in SEC filings. Present information in a clean, structured format with clear sections, bullet points, and highlighted insights."
        },
        {
          role: "user",
          content: getFinancialAnalysisPrompt(userName, userContext)
        }
      ],
      temperature: 0.1,
    });

    const analysis = completion.choices[0].message.content;
    
    return NextResponse.json({
      analysis: analysis,
      documentCount: documents.length,
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze documents' },
      { status: 500 }
    );
  }
} 
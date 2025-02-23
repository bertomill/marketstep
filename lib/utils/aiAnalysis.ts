import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface AIAnalysisResult {
  summary: string;
  keyTechnologies: string[];
  strategicFocus: string;
  risks: string[];
  opportunities: string[];
}

export async function analyzeFilingWithAI(sections: {
  business: string;
  riskFactors: string;
  mdAndA: string;
}): Promise<AIAnalysisResult> {
  const prompt = `
    Analyze this SEC filing section by section. Focus on technological advancements, strategic initiatives, and industry trends.
    
    Business Section:
    ${sections.business.slice(0, 2000)}...
    
    Risk Factors:
    ${sections.riskFactors.slice(0, 2000)}...
    
    Management Discussion:
    ${sections.mdAndA.slice(0, 2000)}...
    
    Please provide:
    1. A concise summary of the company's tech focus
    2. Key technologies mentioned and their strategic importance
    3. Main technological risks
    4. Growth opportunities and strategic initiatives
    Format as JSON.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a technology industry analyst specializing in SEC filings analysis."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
} 
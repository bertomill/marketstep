export const seedIndustries = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Artificial Intelligence and Machine Learning technologies',
    parentIndustry: 'tech'
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    description: 'Cloud infrastructure and services',
    parentIndustry: 'tech'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Information security and cyber defense',
    parentIndustry: 'tech'
  },
  {
    id: 'blockchain',
    name: 'Blockchain & Web3',
    description: 'Decentralized technologies and cryptocurrencies',
    parentIndustry: 'tech'
  },
  {
    id: 'biotech',
    name: 'Biotechnology',
    description: 'Biological and medical technology advancement',
    parentIndustry: 'health'
  }
];

export const seedCompanies = [
  {
    id: 'openai',
    name: 'OpenAI',
    industries: ['ai-ml'],
    technologies: ['gpt', 'dall-e', 'transformers'],
    description: 'Leading AI research and deployment company',
    website: 'https://openai.com'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    industries: ['ai-ml'],
    technologies: ['claude', 'constitutional-ai'],
    description: 'AI safety and research company',
    website: 'https://anthropic.com'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    industries: ['ai-ml', 'cloud', 'cybersecurity'],
    technologies: ['azure', 'copilot', 'windows'],
    description: 'Global technology and cloud computing leader',
    website: 'https://microsoft.com'
  }
];

export const seedFeedItems = [
  {
    id: 'feed-1',
    type: 'news',
    title: 'OpenAI Releases GPT-5',
    content: 'OpenAI has announced the release of GPT-5, featuring improved reasoning capabilities...',
    source: 'Tech News',
    url: 'https://technews.com/openai-gpt5',
    publishedAt: new Date(),
    relatedIndustries: ['ai-ml'],
    relatedCompanies: ['openai'],
    relatedTechnologies: ['gpt']
  },
  {
    id: 'feed-2',
    type: 'analysis',
    title: 'The Future of Cloud Computing',
    content: 'Analysis of emerging trends in cloud computing and their impact on businesses...',
    source: 'Cloud Insights',
    url: 'https://cloudinsights.com/future-trends',
    publishedAt: new Date(),
    relatedIndustries: ['cloud'],
    relatedCompanies: ['microsoft'],
    relatedTechnologies: ['azure']
  }
]; 
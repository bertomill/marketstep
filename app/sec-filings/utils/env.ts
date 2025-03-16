import fs from 'fs';
import path from 'path';

// This function loads environment variables from a .env file
// It's a simple implementation for this self-contained feature
export function loadEnvVariables() {
  try {
    // Path to the .env.local file in the sec-filings folder
    const envPath = path.join(process.cwd(), 'app', 'sec-filings', '.env.local');
    
    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.warn('No .env.local file found in sec-filings folder');
      return {};
    }
    
    // Read the file content
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse the content into key-value pairs
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return;
      
      // Split by the first equals sign
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) return;
      
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();
      
      if (key && value) {
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error loading environment variables:', error);
    return {};
  }
}

// Get the Gemini API key from environment variables
// Falls back to a default value if not found
export function getGeminiApiKey(): string {
  // First try to get the key from Next.js environment variables
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  // Fall back to the local .env file if needed
  const envVars = loadEnvVariables();
  return envVars.GEMINI_API_KEY || '';
}
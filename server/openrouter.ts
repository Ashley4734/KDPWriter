import { storage } from "./storage";

export interface GenerateIdeasRequest {
  genre: string;
  targetAudience?: string;
  keyInterests?: string[];
  count?: number;
}

export interface BookIdeaResponse {
  title: string;
  description: string;
  targetAudience: string;
  keyPoints: string[];
}

export interface GenerateOutlineRequest {
  bookId: string;
  title: string;
  description: string;
  targetWordCount: number;
  genre: string;
  targetAudience?: string;
}

export interface ChapterOutline {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
  estimatedWordCount: number;
}

export interface OutlineResponse {
  title: string;
  chapters: ChapterOutline[];
  totalChapters: number;
  totalEstimatedWords: number;
}

export interface GenerateChapterRequest {
  bookId: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterDescription: string;
  keyPoints: string[];
  targetWordCount: number;
  previousChapters?: string;
  bookContext: {
    title: string;
    genre: string;
    description: string;
    targetAudience: string;
  };
}

export class OpenRouterService {
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  private async getApiKey(): Promise<string> {
    const settings = await storage.getSettings("demo-user");
    if (!settings?.openrouterApiKey) {
      const error = new Error("OpenRouter API key not configured. Please set it in Settings.");
      (error as any).statusCode = 400;
      throw error;
    }
    
    const apiKey = settings.openrouterApiKey;
    
    // Validate API key format
    if (!apiKey.startsWith('sk-or-')) {
      console.warn('API key does not start with sk-or-, this may cause authentication issues');
    }
    
    return apiKey;
  }

  private async getSelectedModel(): Promise<string> {
    const settings = await storage.getSettings("demo-user");
    // Use a more widely available model as default
    return settings?.selectedModel || "openai/gpt-4o-mini";
  }

  private async makeRequest(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = await this.getApiKey();
    const model = await this.getSelectedModel();
    console.log('Using model:', model);
    console.log('API key format:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.REPL_ID ? `https://${process.env.REPL_ID}.replit.app` : "http://localhost:5000",
      "X-Title": "BookGen AI - Nonfiction Book Generator"
    };
    
    console.log('Request headers (auth hidden):', { ...headers, Authorization: 'Bearer [HIDDEN]' });
    
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        url: this.baseUrl,
        model: model
      });
      
      if (response.status === 401) {
        // Try with a different commonly available model if current one fails
        if (model !== "openai/gpt-4o-mini") {
          console.log(`Model ${model} failed with 401, retrying with fallback model`);
          const fallbackSettings = { selectedModel: "openai/gpt-4o-mini" };
          await storage.updateSettings("demo-user", fallbackSettings);
          return this.makeRequest(prompt, systemPrompt);
        }
        throw new Error(`OpenRouter authentication failed. Please verify your API key is correct and has access to AI models. Try a different model in Settings.`);
      }
      
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from OpenRouter API");
    }

    return data.choices[0].message.content;
  }

  private extractJsonFromResponse(response: string): any {
    // Try to extract JSON from response that might have code fences or extra text
    let cleanResponse = response.trim();
    
    // Remove markdown code fences
    cleanResponse = cleanResponse.replace(/^```json\s*\n?/i, '');
    cleanResponse = cleanResponse.replace(/\n?```\s*$/i, '');
    cleanResponse = cleanResponse.replace(/^```\s*\n?/i, '');
    
    // Try to find JSON array or object in the response
    const arrayMatch = cleanResponse.match(/\[[\s\S]*\]/);
    const objectMatch = cleanResponse.match(/\{[\s\S]*\}/);
    
    if (arrayMatch) {
      cleanResponse = arrayMatch[0];
    } else if (objectMatch) {
      cleanResponse = objectMatch[0];
    }
    
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Raw AI response:", response);
      console.error("Cleaned response:", cleanResponse);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  async generateBookIdeas(request: GenerateIdeasRequest): Promise<BookIdeaResponse[]> {
    const count = request.count || 3;
    const systemPrompt = `You are an expert nonfiction book idea generator and publishing consultant. Your task is to generate compelling, marketable nonfiction book ideas that would be suitable for Amazon KDP publishing.

Focus on topics that:
- Have proven market demand
- Can be researched and written by someone with dedication
- Appeal to specific target audiences
- Solve real problems or provide valuable insights
- Are not oversaturated in the market

Always return valid JSON with no additional text or formatting.`;

    const userPrompt = `Generate ${count} compelling nonfiction book ideas for the "${request.genre}" genre.

${request.targetAudience ? `Target audience: ${request.targetAudience}` : ''}
${request.keyInterests && request.keyInterests.length > 0 ? `Key interests: ${request.keyInterests.join(', ')}` : ''}

For each book idea, provide:
- A compelling, specific title
- A detailed description (2-3 sentences) explaining what the book covers and its unique angle
- The specific target audience who would buy this book
- 4-5 key points or topics the book would cover

Return your response as a JSON array of objects with this structure:
[
  {
    "title": "Book Title Here",
    "description": "Detailed description of what the book covers and its unique value proposition.",
    "targetAudience": "Specific target audience description",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"]
  }
]

Make sure each idea is unique, valuable, and has clear market potential.`;

    const response = await this.makeRequest(userPrompt, systemPrompt);
    
    try {
      const ideas = this.extractJsonFromResponse(response);
      if (!Array.isArray(ideas)) {
        throw new Error("Response is not an array");
      }
      return ideas;
    } catch (error) {
      console.error("Error parsing book ideas:", error.message);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  async generateOutline(request: GenerateOutlineRequest): Promise<OutlineResponse> {
    const systemPrompt = `You are an expert nonfiction book outline creator and publishing consultant. Your task is to create detailed, well-structured outlines for nonfiction books that would be successful on Amazon KDP.

Create outlines that:
- Have logical flow and progression
- Cover the topic comprehensively
- Are engaging and actionable for readers
- Have appropriate chapter lengths for the target word count
- Include specific, valuable content in each chapter

Always return valid JSON with no additional text or formatting.`;

    const userPrompt = `Create a detailed outline for this nonfiction book:

Title: "${request.title}"
Description: ${request.description}
Genre: ${request.genre}
Target Word Count: ${request.targetWordCount} words
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}

Create an outline with 8-15 chapters that would total approximately ${request.targetWordCount} words. Each chapter should be substantial but focused.

For each chapter, provide:
- A compelling chapter title
- A detailed description of what the chapter covers (2-3 sentences)
- 4-6 key points or subtopics that will be discussed
- An estimated word count for the chapter

Return your response as JSON with this structure:
{
  "title": "Final Book Title (can refine the original)",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter Title",
      "description": "Detailed description of chapter content and objectives.",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
      "estimatedWordCount": 4000
    }
  ],
  "totalChapters": 10,
  "totalEstimatedWords": 50000
}

Make sure the outline is comprehensive, well-structured, and would create a valuable book for the target audience.`;

    const response = await this.makeRequest(userPrompt, systemPrompt);
    
    try {
      const outline = this.extractJsonFromResponse(response);
      
      // Validate structure
      if (!outline.title || !Array.isArray(outline.chapters)) {
        throw new Error("Invalid outline structure");
      }
      
      // Calculate totals if not provided
      outline.totalChapters = outline.chapters.length;
      outline.totalEstimatedWords = outline.chapters.reduce((sum: number, ch: any) => 
        sum + (ch.estimatedWordCount || 0), 0);
      
      return outline;
    } catch (error) {
      console.error("Failed to parse outline response:", response);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  async generateChapter(request: GenerateChapterRequest): Promise<string> {
    const systemPrompt = `You are an expert nonfiction writer specializing in creating engaging, informative, and well-structured book chapters. Your writing should be:

- Clear and accessible to the target audience
- Well-researched and authoritative
- Engaging with real examples and practical advice
- Properly structured with smooth flow between ideas
- Action-oriented when appropriate
- Professional yet conversational in tone

Write complete chapter content that would be suitable for publication.`;

    const userPrompt = `Write Chapter ${request.chapterNumber}: "${request.chapterTitle}" for this nonfiction book:

BOOK CONTEXT:
- Title: "${request.bookContext.title}"
- Genre: ${request.bookContext.genre}
- Description: ${request.bookContext.description}
- Target Audience: ${request.bookContext.targetAudience}

CHAPTER DETAILS:
- Chapter Number: ${request.chapterNumber}
- Chapter Title: "${request.chapterTitle}"
- Chapter Description: ${request.chapterDescription}
- Target Word Count: ${request.targetWordCount} words
- Key Points to Cover: ${request.keyPoints.join(', ')}

${request.previousChapters ? `PREVIOUS CHAPTERS CONTEXT:\n${request.previousChapters}\n\n` : ''}

Write a complete, engaging chapter that:
1. Has a strong opening that hooks the reader
2. Covers all the key points mentioned above
3. Includes practical examples, case studies, or actionable advice where appropriate
4. Maintains consistency with the book's overall tone and message
5. Concludes with a clear summary or transition to the next chapter
6. Meets approximately the target word count

Return only the chapter content as plain text, properly formatted with paragraphs. Do not include any JSON formatting or additional commentary.`;

    const response = await this.makeRequest(userPrompt, systemPrompt);
    return response.trim();
  }
}

export const openRouterService = new OpenRouterService();
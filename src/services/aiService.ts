export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

export const aiService = {
  async chat(messages: AIMessage[], _model?: string): Promise<AIResponse> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'No response'
      };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async analyzeCode(code: string, language: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert code reviewer. Analyze the following ${language} code and provide suggestions for improvement, potential bugs, and best practices.`
      },
      {
        role: 'user',
        content: `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];
    return this.chat(messages);
  },

  async fixErrors(code: string, language: string, errorDescription?: string, _model?: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert debugger. Fix the errors in the following ${language} code and return only the corrected code.`
      },
      {
        role: 'user',
        content: errorDescription 
          ? `Fix this ${language} code. Error: ${errorDescription}\n\n\`\`\`${language}\n${code}\n\`\`\``
          : `Fix any errors in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];
    return this.chat(messages);
  },

  async generateCode(prompt: string, language: string, _model?: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert programmer. Generate clean, well-commented ${language} code based on the user's request. Return only the code.`
      },
      {
        role: 'user',
        content: `Generate ${language} code for: ${prompt}`
      }
    ];
    return this.chat(messages);
  },

  async explainCode(code: string, language: string, _model?: string): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a helpful programming teacher. Explain the following ${language} code in simple terms.`
      },
      {
        role: 'user',
        content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];
    return this.chat(messages);
  }
};

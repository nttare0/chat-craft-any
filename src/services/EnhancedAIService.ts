interface APIKeys {
  openai: string;
  anthropic: string;
  perplexity: string;
}

interface AIResponse {
  content: string;
  model: string;
  reasoning?: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  calculations?: Array<{
    formula: string;
    result: string;
    explanation: string;
  }>;
}

export class EnhancedAIService {
  private static API_KEYS: Partial<APIKeys> = {};
  
  static setAPIKey(provider: keyof APIKeys, key: string) {
    this.API_KEYS[provider] = key;
    localStorage.setItem(`ai_${provider}_key`, key);
  }

  static getAPIKey(provider: keyof APIKeys): string | null {
    if (this.API_KEYS[provider]) {
      return this.API_KEYS[provider]!;
    }
    return localStorage.getItem(`ai_${provider}_key`);
  }

  static async callOpenAI(message: string, domain?: string): Promise<AIResponse> {
    const apiKey = this.getAPIKey('openai');
    if (!apiKey) throw new Error('OpenAI API key not found');

    const systemPrompt = this.getSystemPrompt(domain);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: 'GPT-5',
    };
  }

  static async callClaude(message: string, domain?: string): Promise<AIResponse> {
    const apiKey = this.getAPIKey('anthropic');
    if (!apiKey) throw new Error('Anthropic API key not found');

    const systemPrompt = this.getSystemPrompt(domain);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: 'Claude Opus 4',
    };
  }

  static async callPerplexity(message: string): Promise<AIResponse> {
    const apiKey = this.getAPIKey('perplexity');
    if (!apiKey) throw new Error('Perplexity API key not found');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced AI research assistant with access to real-time internet data. Provide comprehensive, accurate, and up-to-date information with proper citations.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: true,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: 'Perplexity Research',
      sources: data.citations || []
    };
  }

  static async enhancedQuery(message: string, domain?: string, useInternet = false): Promise<AIResponse> {
    try {
      // Choose the best model based on the query type
      if (useInternet || message.toLowerCase().includes('latest') || message.toLowerCase().includes('current')) {
        return await this.callPerplexity(message);
      }
      
      if (domain === 'mathematics' || domain === 'machine-learning') {
        return await this.callOpenAI(message, domain);
      }
      
      if (domain === 'ethical-hacking' || domain === 'research') {
        return await this.callClaude(message, domain);
      }

      // Default to GPT-5 for general queries
      return await this.callOpenAI(message, domain);
    } catch (error) {
      console.error('Enhanced AI query failed:', error);
      throw error;
    }
  }

  private static getSystemPrompt(domain?: string): string {
    const basePrompt = `You are an advanced AI assistant with expertise in mathematics, computer science, machine learning, and ethical hacking. You can perform complex calculations, analyze code, and provide detailed technical explanations.`;

    const domainPrompts = {
      mathematics: `${basePrompt} Focus on mathematical analysis, providing step-by-step solutions with formulas like:
      - Multi-head Attention: Attention(Q,K,V) = softmax(QK^T/√dk)V
      - Cross-entropy: H(p,q) = -∑p(x)log(q(x))
      - Gradient Descent: θ = θ - α∇J(θ)`,
      
      'computer-science': `${basePrompt} Focus on algorithms, data structures, system design, and software engineering principles. Provide code examples and complexity analysis.`,
      
      'machine-learning': `${basePrompt} Focus on ML algorithms, neural networks, and AI model training. Include mathematical formulations and implementation details.`,
      
      'ethical-hacking': `${basePrompt} Focus on cybersecurity, penetration testing, and vulnerability assessment. Always emphasize ethical use and legal compliance.`,
      
      research: `${basePrompt} Focus on comprehensive research, fact-checking, and providing well-cited information from reliable sources.`
    };

    return domainPrompts[domain as keyof typeof domainPrompts] || basePrompt;
  }

  static async executeCode(code: string, language: string): Promise<{ output: string; error?: string }> {
    // Simulate code execution (in a real implementation, use a secure sandbox)
    try {
      if (language === 'javascript') {
        // Very basic JS execution simulation
        const result = eval(code);
        return { output: String(result) };
      }
      
      if (language === 'python') {
        // Simulate Python execution
        return { output: 'Python execution simulated. In production, use a secure sandbox like Pyodide or server-side execution.' };
      }

      return { output: `Code execution for ${language} is simulated in this demo.` };
    } catch (error) {
      return { 
        output: '', 
        error: error instanceof Error ? error.message : 'Execution failed' 
      };
    }
  }

  static calculateMathExpression(expression: string): string {
    try {
      // Basic mathematical expression evaluation
      // In production, use a proper math parser like Math.js
      const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));
      return String(result);
    } catch {
      return 'Invalid mathematical expression';
    }
  }
}
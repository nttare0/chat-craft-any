interface AIResponse {
  content: string;
  model: string;
  confidence?: number;
  calculations?: Array<{
    formula: string;
    result: string;
    explanation: string;
  }>;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

interface KnowledgeBase {
  greetings: string[];
  responses: Record<string, string[]>;
  mathematics: Record<string, string>;
  computerScience: Record<string, string>;
}

export class FreeAIService {
  private static knowledgeBase: KnowledgeBase = {
    greetings: [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! What would you like to know?",
      "Greetings! I'm here to assist you with any questions.",
      "Hey! Ready to learn something new together?",
      "Hello! I'm excited to help you explore knowledge!"
    ],
    
    responses: {
      "how are you": [
        "I'm doing great! Ready to help you learn and explore.",
        "I'm functioning optimally and excited to assist you!",
        "I'm here and ready to tackle any questions you have!"
      ],
      "what is your name": [
        "I'm your AI Assistant, here to help with math, computer science, and more!",
        "You can call me AI Assistant. I'm specialized in learning and teaching!"
      ],
      "thank you": [
        "You're welcome! I'm always happy to help.",
        "My pleasure! Feel free to ask anything else.",
        "Glad I could help! What else would you like to know?"
      ],
      "goodbye": [
        "Goodbye! Come back anytime you want to learn something new!",
        "See you later! I'll be here whenever you need help.",
        "Take care! Remember, learning never stops!"
      ]
    },
    
    mathematics: {
      "what is calculus": "Calculus is the mathematical study of continuous change. It has two main branches: differential calculus (rates of change) and integral calculus (accumulation of quantities).",
      "what is algebra": "Algebra is a branch of mathematics dealing with symbols and rules for manipulating those symbols. It's used to solve equations and find unknown values.",
      "what is geometry": "Geometry is the branch of mathematics concerned with shapes, sizes, relative positions of figures, and properties of space.",
      "what is trigonometry": "Trigonometry studies relationships between side lengths and angles of triangles. It's fundamental in physics, engineering, and many other fields."
    },
    
    computerScience: {
      "what is programming": "Programming is the process of creating instructions for computers to follow. It involves writing code in various languages to solve problems and create applications.",
      "what is an algorithm": "An algorithm is a step-by-step procedure for solving a problem or completing a task. It's like a recipe that computers can follow.",
      "what is machine learning": "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed for every task.",
      "what is data structure": "Data structures are ways of organizing and storing data in computer memory so it can be accessed and modified efficiently.",
      "what is database": "A database is an organized collection of structured information or data, typically stored electronically in a computer system."
    }
  };

  static async query(message: string): Promise<AIResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check for greetings
    if (this.isGreeting(normalizedMessage)) {
      return {
        content: this.getRandomResponse(this.knowledgeBase.greetings),
        model: "Knowledge Base",
        confidence: 0.9
      };
    }

    // Check for specific responses
    for (const [key, responses] of Object.entries(this.knowledgeBase.responses)) {
      if (normalizedMessage.includes(key)) {
        return {
          content: this.getRandomResponse(responses),
          model: "Knowledge Base",
          confidence: 0.8
        };
      }
    }

    // Check mathematics knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.mathematics)) {
      if (normalizedMessage.includes(key.toLowerCase())) {
        return {
          content: answer,
          model: "Mathematics KB",
          confidence: 0.85
        };
      }
    }

    // Check computer science knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.computerScience)) {
      if (normalizedMessage.includes(key.toLowerCase())) {
        return {
          content: answer,
          model: "Computer Science KB",
          confidence: 0.85
        };
      }
    }

    // Mathematical calculations
    if (this.isMathExpression(normalizedMessage)) {
      const result = this.calculateMath(message);
      return {
        content: `The answer is: ${result}`,
        model: "Math Calculator",
        confidence: 0.95
      };
    }

    // Try Hugging Face free API as fallback
    try {
      return await this.callHuggingFace(message);
    } catch (error) {
      // Fallback to knowledge synthesis
      return this.synthesizeResponse(message);
    }
  }

  private static isGreeting(message: string): boolean {
    const greetingWords = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetingWords.some(greeting => message.includes(greeting));
  }

  private static getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static isMathExpression(message: string): boolean {
    return /[\d+\-*/().\s]+/.test(message) && /[+\-*/]/.test(message);
  }

  private static calculateMath(expression: string): string {
    try {
      // Extract mathematical expression
      const mathMatch = expression.match(/[\d+\-*/().\s]+/);
      if (mathMatch) {
        const cleanExpression = mathMatch[0].replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(cleanExpression);
        return String(result);
      }
      return "Invalid mathematical expression";
    } catch {
      return "Error calculating expression";
    }
  }

  private static async callHuggingFace(message: string): Promise<AIResponse> {
    // Free Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message,
        options: { wait_for_model: true }
      }),
    });

    if (!response.ok) {
      throw new Error('Hugging Face API failed');
    }

    const data = await response.json();
    return {
      content: data.generated_text || data[0]?.generated_text || "I'm processing your request...",
      model: "Hugging Face Free",
      confidence: 0.7
    };
  }

  private static synthesizeResponse(message: string): AIResponse {
    const message_lower = message.toLowerCase();
    
    // Topic-based responses
    if (message_lower.includes('learn') || message_lower.includes('teach')) {
      return {
        content: "I'd love to help you learn! I can assist with mathematics, computer science, programming, and general questions. What specific topic interests you?",
        model: "Knowledge Synthesis",
        confidence: 0.6
      };
    }

    if (message_lower.includes('math') || message_lower.includes('calculate')) {
      return {
        content: "I can help with mathematics! Try asking me about calculus, algebra, geometry, or give me a calculation to solve.",
        model: "Knowledge Synthesis",
        confidence: 0.6
      };
    }

    if (message_lower.includes('program') || message_lower.includes('code')) {
      return {
        content: "Programming is fascinating! I can explain concepts like algorithms, data structures, different programming languages, and development practices.",
        model: "Knowledge Synthesis",
        confidence: 0.6
      };
    }

    if (message_lower.includes('computer') || message_lower.includes('technology')) {
      return {
        content: "Computer science covers many exciting areas! From algorithms and data structures to machine learning and databases. What aspect interests you most?",
        model: "Knowledge Synthesis",
        confidence: 0.6
      };
    }

    // Default response
    return {
      content: "That's an interesting question! While I'm still learning, I can help with mathematics, computer science basics, programming concepts, and general knowledge. Could you rephrase your question or ask about a specific topic?",
      model: "Knowledge Synthesis",
      confidence: 0.4
    };
  }

  // Add new knowledge dynamically
  static addKnowledge(category: keyof KnowledgeBase, key: string, value: string | string[]) {
    if (category === 'greetings' && Array.isArray(value)) {
      this.knowledgeBase.greetings.push(...value);
    } else if (category === 'responses' && Array.isArray(value)) {
      this.knowledgeBase.responses[key] = value;
    } else if ((category === 'mathematics' || category === 'computerScience') && typeof value === 'string') {
      this.knowledgeBase[category][key] = value;
    }
  }

  // Get current knowledge stats
  static getKnowledgeStats() {
    return {
      greetings: this.knowledgeBase.greetings.length,
      responses: Object.keys(this.knowledgeBase.responses).length,
      mathematics: Object.keys(this.knowledgeBase.mathematics).length,
      computerScience: Object.keys(this.knowledgeBase.computerScience).length
    };
  }
}
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
  english: Record<string, string>;
  kinyarwanda: Record<string, string>;
  programming: Record<string, string>;
  advanced: Record<string, string>;
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
      "what is database": "A database is an organized collection of structured information or data, typically stored electronically in a computer system.",
      "what is recursion": "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.",
      "what is sorting": "Sorting algorithms arrange data in a particular order (ascending or descending). Common algorithms include bubble sort, merge sort, and quick sort.",
      "what is big o notation": "Big O notation describes the performance or complexity of an algorithm in terms of time and space as input size grows.",
      "what is artificial intelligence": "AI is the simulation of human intelligence in machines programmed to think and learn like humans.",
      "what is neural network": "Neural networks are computing systems inspired by biological neural networks, used in machine learning.",
      "what is binary": "Binary is a base-2 number system using only 0s and 1s, fundamental to how computers store and process data.",
      "what is encryption": "Encryption is the process of converting information into a secret code to prevent unauthorized access.",
      "what is api": "API (Application Programming Interface) is a set of protocols and tools for building software applications."
    },

    english: {
      "what is grammar": "Grammar is the set of structural rules governing the composition of clauses, phrases and words in any language.",
      "what is a noun": "A noun is a word that represents a person, place, thing, or idea. Examples: cat, house, happiness.",
      "what is a verb": "A verb is a word that expresses an action, occurrence, or state of being. Examples: run, exist, think.",
      "what is an adjective": "An adjective is a word that describes or modifies a noun or pronoun. Examples: big, beautiful, smart.",
      "what is a sentence": "A sentence is a group of words that expresses a complete thought, typically containing a subject and predicate.",
      "what is vocabulary": "Vocabulary refers to the body of words used in a particular language or known by a person.",
      "what is pronunciation": "Pronunciation is the way in which a word or language is spoken, including accent and intonation.",
      "what is spelling": "Spelling is the forming of words from letters according to accepted usage.",
      "what is reading": "Reading is the process of looking at written symbols and understanding their meaning.",
      "what is writing": "Writing is the activity of marking coherent words on paper or in a digital medium to communicate ideas."
    },

    kinyarwanda: {
      "muraho": "Muraho means 'hello' in Kinyarwanda. It's a common greeting used throughout Rwanda.",
      "mwaramutse": "Mwaramutse means 'good morning' in Kinyarwanda. It's used to greet people in the morning.",
      "mugende neza": "Mugende neza means 'goodbye' or 'go well' in Kinyarwanda. It's a polite way to say farewell.",
      "murakoze": "Murakoze means 'thank you' in Kinyarwanda. It's used to express gratitude.",
      "amakuru": "Amakuru means 'news' or 'how are things?' in Kinyarwanda. Often used as a greeting.",
      "ni meza": "Ni meza means 'it's good' or 'fine' in Kinyarwanda. Common response to greetings.",
      "izina ryawe": "Izina ryawe means 'your name' in Kinyarwanda. Used when asking someone's name.",
      "nitwa": "Nitwa means 'I am called' or 'my name is' in Kinyarwanda.",
      "rwandan culture": "Rwandan culture values unity (ubwiyunge), hard work (akazi), and respect for elders. Kinyarwanda is spoken by over 12 million people.",
      "kinyarwanda alphabet": "Kinyarwanda uses the Latin alphabet with 24 letters. It has specific pronunciation rules and tone patterns."
    },

    programming: {
      "what is python": "Python is a high-level, interpreted programming language known for its simplicity and readability. Great for beginners.",
      "what is javascript": "JavaScript is a programming language primarily used for web development, both frontend and backend applications.",
      "what is html": "HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications.",
      "what is css": "CSS (Cascading Style Sheets) is used for describing the presentation of HTML documents, including colors, layout, and fonts.",
      "what is react": "React is a JavaScript library for building user interfaces, particularly web applications with reusable components.",
      "what is nodejs": "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on servers.",
      "what is sql": "SQL (Structured Query Language) is a programming language designed for managing and querying relational databases.",
      "what is git": "Git is a distributed version control system for tracking changes in source code during software development.",
      "what is debugging": "Debugging is the process of finding and fixing errors or bugs in computer program code.",
      "what is function": "A function is a reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.",
      "what is variable": "A variable is a storage location with an associated name that contains data which can be modified during program execution.",
      "what is loop": "A loop is a programming construct that repeats a block of code until a specified condition is met.",
      "what is array": "An array is a data structure that stores multiple values in a single variable, accessed by index numbers.",
      "what is object": "An object is a data structure that contains properties (data) and methods (functions) grouped together."
    },

    advanced: {
      "machine learning algorithms": "Common ML algorithms include: Linear Regression, Decision Trees, Random Forest, SVM, Neural Networks, K-means clustering, and Gradient Boosting.",
      "calculus applications": "Calculus is used in optimization, physics simulations, machine learning (gradients), economics (marginal analysis), and engineering design.",
      "data structures complexity": "Array: O(1) access, O(n) search. Linked List: O(n) access/search. Hash Table: O(1) average access. Binary Tree: O(log n) search.",
      "neural network training": "Neural networks learn through backpropagation: forward pass calculates predictions, backward pass computes gradients, weights updated via gradient descent.",
      "cybersecurity principles": "Key principles: Confidentiality (data protection), Integrity (data accuracy), Availability (system access), Authentication, Authorization, Non-repudiation.",
      "software engineering": "Software engineering involves requirements analysis, system design, implementation, testing, deployment, and maintenance using methodologies like Agile.",
      "quantum computing": "Quantum computing uses quantum bits (qubits) that can exist in superposition, potentially solving certain problems exponentially faster than classical computers.",
      "blockchain technology": "Blockchain is a distributed ledger technology ensuring transparency and security through cryptographic hashing and consensus mechanisms."
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

    // Check English knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.english)) {
      if (normalizedMessage.includes(key.toLowerCase())) {
        return {
          content: answer,
          model: "English KB",
          confidence: 0.85
        };
      }
    }

    // Check Kinyarwanda knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.kinyarwanda)) {
      if (normalizedMessage.includes(key.toLowerCase()) || normalizedMessage.includes(key)) {
        return {
          content: answer,
          model: "Kinyarwanda KB",
          confidence: 0.85
        };
      }
    }

    // Check programming knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.programming)) {
      if (normalizedMessage.includes(key.toLowerCase())) {
        return {
          content: answer,
          model: "Programming KB",
          confidence: 0.85
        };
      }
    }

    // Check advanced knowledge
    for (const [key, answer] of Object.entries(this.knowledgeBase.advanced)) {
      if (normalizedMessage.includes(key.toLowerCase().split(' ')[0]) && 
          normalizedMessage.includes(key.toLowerCase().split(' ')[1] || '')) {
        return {
          content: answer,
          model: "Advanced KB",
          confidence: 0.9
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
    
    // Enhanced topic-based responses
    if (message_lower.includes('learn') || message_lower.includes('teach') || message_lower.includes('study')) {
      return {
        content: "I'd love to help you learn! I can assist with mathematics, computer science, programming, English, Kinyarwanda language, and advanced topics like machine learning and cybersecurity. What specific topic interests you?",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('math') || message_lower.includes('calculate') || message_lower.includes('equation')) {
      return {
        content: "I can help with mathematics! Ask me about calculus, algebra, geometry, trigonometry, statistics, or give me calculations to solve. I understand both basic and advanced mathematical concepts.",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('program') || message_lower.includes('code') || message_lower.includes('software')) {
      return {
        content: "Programming is fascinating! I can explain Python, JavaScript, HTML, CSS, React, Node.js, databases, algorithms, debugging, and software development practices. What would you like to know?",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('computer') || message_lower.includes('technology') || message_lower.includes('ai')) {
      return {
        content: "Computer science covers many exciting areas! From algorithms and data structures to machine learning, neural networks, cybersecurity, and quantum computing. What aspect interests you most?",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('english') || message_lower.includes('grammar') || message_lower.includes('language')) {
      return {
        content: "I can help with English language! Ask me about grammar, vocabulary, sentence structure, parts of speech, reading, writing, or pronunciation.",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('kinyarwanda') || message_lower.includes('rwanda') || message_lower.includes('muraho')) {
      return {
        content: "Muraho! I can help with Kinyarwanda language and Rwandan culture. Ask me about greetings, basic phrases, pronunciation, or cultural aspects of Rwanda.",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    if (message_lower.includes('security') || message_lower.includes('hacking') || message_lower.includes('encryption')) {
      return {
        content: "I can explain cybersecurity concepts including encryption, network security, ethical hacking principles, and data protection. Remember to always use knowledge ethically and legally!",
        model: "Knowledge Synthesis",
        confidence: 0.7
      };
    }

    // Advanced topic detection
    if (message_lower.includes('machine learning') || message_lower.includes('neural') || message_lower.includes('deep learning')) {
      return {
        content: "Machine Learning is an exciting field! I can explain algorithms like regression, decision trees, neural networks, training processes, backpropagation, and practical applications.",
        model: "Knowledge Synthesis",
        confidence: 0.8
      };
    }

    // Default response
    return {
      content: "That's an interesting question! I have knowledge in mathematics, computer science, programming (Python, JavaScript, etc.), English, Kinyarwanda, machine learning, and cybersecurity. Could you be more specific about what you'd like to know?",
      model: "Knowledge Synthesis",
      confidence: 0.5
    };
  }

  // Add new knowledge dynamically
  static addKnowledge(category: keyof KnowledgeBase, key: string, value: string | string[]) {
    if (category === 'greetings' && Array.isArray(value)) {
      this.knowledgeBase.greetings.push(...value);
    } else if (category === 'responses' && Array.isArray(value)) {
      this.knowledgeBase.responses[key] = value;
    } else if ((category === 'mathematics' || category === 'computerScience' || 
                category === 'english' || category === 'kinyarwanda' || 
                category === 'programming' || category === 'advanced') && typeof value === 'string') {
      this.knowledgeBase[category][key] = value;
    }
  }

  // Get current knowledge stats
  static getKnowledgeStats() {
    return {
      greetings: this.knowledgeBase.greetings.length,
      responses: Object.keys(this.knowledgeBase.responses).length,
      mathematics: Object.keys(this.knowledgeBase.mathematics).length,
      computerScience: Object.keys(this.knowledgeBase.computerScience).length,
      english: Object.keys(this.knowledgeBase.english).length,
      kinyarwanda: Object.keys(this.knowledgeBase.kinyarwanda).length,
      programming: Object.keys(this.knowledgeBase.programming).length,
      advanced: Object.keys(this.knowledgeBase.advanced).length,
      total: Object.keys(this.knowledgeBase.mathematics).length + 
             Object.keys(this.knowledgeBase.computerScience).length +
             Object.keys(this.knowledgeBase.english).length +
             Object.keys(this.knowledgeBase.kinyarwanda).length +
             Object.keys(this.knowledgeBase.programming).length +
             Object.keys(this.knowledgeBase.advanced).length
    };
  }
}
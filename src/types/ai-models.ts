interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'perplexity';
  capabilities: string[];
  description: string;
}

interface KnowledgeDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    relevance: number;
  }>;
  synthesis: string;
  timestamp: Date;
}

interface CodeExecution {
  code: string;
  language: string;
  output: string;
  error?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5-2025-08-07',
    name: 'GPT-5 Advanced',
    provider: 'openai',
    capabilities: ['reasoning', 'mathematics', 'coding', 'analysis'],
    description: 'Most advanced reasoning and problem-solving'
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    capabilities: ['reasoning', 'analysis', 'research', 'ethics'],
    description: 'Superior reasoning and ethical analysis'
  },
  {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Research',
    provider: 'perplexity',
    capabilities: ['research', 'internet', 'real-time'],
    description: 'Real-time internet research and analysis'
  }
];

export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Advanced mathematical analysis, calculus, statistics, linear algebra',
    icon: '∑',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Algorithms, data structures, system design, software engineering',
    icon: '⚡',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    description: 'Deep learning, neural networks, AI models, data science',
    icon: '🧠',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'ethical-hacking',
    name: 'Ethical Hacking',
    description: 'Cybersecurity, penetration testing, vulnerability assessment',
    icon: '🔒',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'research',
    name: 'Internet Research',
    description: 'Real-time information gathering, fact-checking, analysis',
    icon: '🌐',
    color: 'from-indigo-500 to-purple-500'
  }
];

export const MATHEMATICAL_FORMULAS = {
  // Transformer Architecture
  multiHeadAttention: 'Attention(Q,K,V) = softmax(QK^T/√dk)V',
  rlhfLoss: 'L_RL = -E[∑logπ_θ(a_t|s_t)·A_t]',
  
  // Machine Learning
  crossEntropy: 'H(p,q) = -∑p(x)log(q(x))',
  gradientDescent: 'θ = θ - α∇J(θ)',
  backpropagation: '∂J/∂w = ∂J/∂y · ∂y/∂w',
  
  // Computer Science
  bigO: 'O(f(n)) = {g(n): ∃c,n₀ such that g(n) ≤ cf(n) ∀n ≥ n₀}',
  recursion: 'T(n) = aT(n/b) + f(n)',
  
  // Cybersecurity
  entropy: 'H(X) = -∑P(x)log₂P(x)',
  cryptography: 'E_k(m) = m^e mod n',
};
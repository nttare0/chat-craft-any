import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Volume2, VolumeX, Settings, Brain, Globe, Code, Calculator, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import AISettings from '@/components/AISettings';
import ResearchDisplay from '@/components/ResearchDisplay';
import SpeechSettings from '@/components/SpeechSettings';
import { FreeAIService } from '@/services/FreeAIService';
import { KNOWLEDGE_DOMAINS } from '@/types/ai-models';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  model?: string;
  domain?: string;
  researchData?: any;
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

const AIAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Free AI Assistant! I can help with mathematics, computer science basics, programming concepts, and answer general questions. I have built-in knowledge and can perform calculations. Try asking me anything!",
      isUser: false,
      timestamp: new Date(),
      model: 'Free AI',
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeechSettings, setShowSpeechSettings] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('general');
  const [useInternet, setUseInternet] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1,
    volume: 0.8
  });
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [continuousListening, setContinuousListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsRecognitionSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = continuousListening || wakeWordEnabled;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = speechLanguage;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          toast({
            title: "Listening",
            description: "Speak now...",
            duration: 2000,
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          
          // Check for wake words
          if (wakeWordEnabled && (
            transcript.includes('hey ai') || 
            transcript.includes('hello ai') || 
            transcript.includes('computer') ||
            transcript.includes('assistant')
          )) {
            setInput(transcript.replace(/(hey ai|hello ai|computer|assistant)/gi, '').trim());
            toast({
              title: "Wake Word Detected",
              description: "I'm listening...",
              duration: 1000,
            });
            return;
          }
          
          if (event.results[event.results.length - 1].isFinal) {
            setInput(transcript);
            // Auto-submit if transcript is complete and not in continuous mode
            if (transcript.trim() && !continuousListening) {
              setTimeout(() => {
                handleSubmit();
              }, 500);
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          setIsListening(false);
          console.error('Speech recognition error:', event.error);
          
          let errorMessage = "Speech recognition failed";
          switch (event.error) {
            case 'no-speech':
              errorMessage = "No speech detected. Please try again.";
              break;
            case 'audio-capture':
              errorMessage = "Microphone not available.";
              break;
            case 'not-allowed':
              errorMessage = "Microphone permission denied.";
              break;
            case 'network':
              errorMessage = "Network error. Check your connection.";
              break;
          }
          
          toast({
            title: "Speech Error",
            description: errorMessage,
            variant: "destructive",
          });
        };
      } else {
        console.warn('Speech recognition not supported in this browser');
      }

      // Check speech synthesis support
      if (window.speechSynthesis) {
        setIsSpeechSupported(true);
        synthRef.current = window.speechSynthesis;
        
        // Ensure voices are loaded
        const loadVoices = () => {
          const voices = synthRef.current?.getVoices() || [];
          console.log('Available voices:', voices.length);
        };
        
        if (synthRef.current.onvoiceschanged !== undefined) {
          synthRef.current.onvoiceschanged = loadVoices;
        }
        loadVoices();
      }
    }
  }, [speechLanguage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
      domain: selectedDomain,
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Use free AI service
      const response = await FreeAIService.query(userInput);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.content,
        isUser: false,
        timestamp: new Date(),
        model: response.model,
        domain: selectedDomain,
        calculations: response.calculations,
        sources: response.sources,
      };

      setMessages(prev => [...prev, aiResponse]);

      // Speak the response
      if (speechEnabled && synthRef.current) {
        speakText(response.content);
      }

      toast({
        title: "Response Generated",
        description: `Using ${response.model} with ${selectedDomain} domain`,
      });

    } catch (error) {
      console.error('AI query failed:', error);
      
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm working with my built-in knowledge base right now. I can help with mathematics, basic computer science concepts, programming questions, and general knowledge. What would you like to learn about?",
        isUser: false,
        timestamp: new Date(),
        model: 'Fallback Mode',
      };

      setMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: "Connection Error",
        description: "Using built-in knowledge. I'm ready to help you learn!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'mathematics': return <Calculator className="h-4 w-4" />;
      case 'computer-science': return <Code className="h-4 w-4" />;
      case 'machine-learning': return <Brain className="h-4 w-4" />;
      case 'ethical-hacking': return <Zap className="h-4 w-4" />;
      case 'research': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current && speechEnabled && isSpeechSupported) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      
      // Select appropriate voice based on language
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(speechLanguage.split('-')[0]) && voice.localService
      ) || voices.find(voice => 
        voice.lang.startsWith(speechLanguage.split('-')[0])
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech synthesis error:', event.error);
        toast({
          title: "Speech Error",
          description: "Failed to speak the response",
          variant: "destructive",
        });
      };
      
      // Split long text into chunks for better performance on mobile devices
      const chunks = text.match(/.{1,200}(?:\s|$)/g) || [text];
      
      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          if (speechEnabled && synthRef.current) {
            const chunkUtterance = new SpeechSynthesisUtterance(chunk);
            chunkUtterance.rate = utterance.rate;
            chunkUtterance.pitch = utterance.pitch;
            chunkUtterance.volume = utterance.volume;
            chunkUtterance.voice = utterance.voice;
            chunkUtterance.lang = utterance.lang;
            
            if (index === chunks.length - 1) {
              chunkUtterance.onend = () => setIsSpeaking(false);
            }
            
            synthRef.current.speak(chunkUtterance);
          }
        }, index * 100);
      });
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecognitionSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        // Request microphone permission if needed
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Update language before starting
        recognitionRef.current.lang = speechLanguage;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Microphone access denied:', error);
        toast({
          title: "Microphone Access",
          description: "Please allow microphone access to use voice input",
          variant: "destructive",
        });
      }
    } else if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass border-b border-border/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-pulse">
              <span className="text-lg font-bold text-primary-foreground">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Free AI Assistant</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Smart AI with Built-in Knowledge</p>
                {selectedDomain !== 'general' && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {getDomainIcon(selectedDomain)}
                    {KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseInternet(!useInternet)}
              className={cn(
                "transition-colors text-xs",
                useInternet ? "text-primary hover:text-primary/80 bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-4 w-4 mr-1" />
              {useInternet ? 'Internet: ON' : 'Internet: OFF'}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSpeechSettings(true)}
              className={cn(
                "transition-colors",
                speechEnabled ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
              )}
              title="Speech Settings"
            >
              {speechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full message-slide-in",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3",
                    message.isUser
                      ? "bg-user-message text-primary-foreground ml-4"
                      : "glass border border-border/20 text-ai-message-foreground mr-4"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {!message.isUser && message.model && (
                      <Badge variant="secondary" className="text-xs">
                        {message.model}
                      </Badge>
                    )}
                    {message.domain && message.domain !== 'general' && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        {getDomainIcon(message.domain)}
                        {KNOWLEDGE_DOMAINS.find(d => d.id === message.domain)?.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  
                  {/* Display calculations if available */}
                  {message.calculations && message.calculations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.calculations.map((calc, idx) => (
                        <div key={idx} className="bg-background/20 rounded-lg p-2">
                          <div className="font-mono text-xs mb-1">{calc.formula}</div>
                          <div className="text-sm font-semibold text-primary">Result: {calc.result}</div>
                          <div className="text-xs text-muted-foreground">{calc.explanation}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Display sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-2">Sources:</div>
                      <div className="space-y-1">
                        {message.sources.slice(0, 3).map((source, idx) => (
                          <div key={idx} className="text-xs bg-background/20 rounded p-1">
                            <div className="font-medium">{source.title}</div>
                            <div className="text-muted-foreground truncate">{new URL(source.url).hostname}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start message-slide-in">
                <div className="glass border border-border/20 rounded-2xl px-4 py-3 mr-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-border/20 p-4 glass">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask me about ${selectedDomain !== 'general' ? KNOWLEDGE_DOMAINS.find(d => d.id === selectedDomain)?.name.toLowerCase() : 'anything'}...`}
                className="pr-12 bg-muted/30 border-border/40 focus:border-primary/50 transition-colors"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                disabled={!isRecognitionSupported || isLoading}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 transition-all duration-200",
                  isListening && "text-primary animate-pulse scale-110",
                  !isRecognitionSupported && "opacity-50 cursor-not-allowed"
                )}
                title={isRecognitionSupported ? (isListening ? "Stop listening" : "Start voice input") : "Voice input not supported"}
              >
                <Mic className={cn(
                  "h-4 w-4 transition-transform",
                  isListening && "scale-125"
                )} />
              </Button>
            </div>
            
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          
          {isListening && (
            <div className="flex items-center justify-center mt-2 text-sm text-primary animate-pulse">
              <div className="flex space-x-1 mr-2">
                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              🎤 Listening... Speak clearly
            </div>
          )}
          
          {isSpeaking && (
            <div className="flex items-center justify-center mt-2 text-sm text-secondary animate-pulse">
              <div className="flex space-x-1 mr-2">
                <div className="w-1 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              </div>
              🔊 AI is speaking...
            </div>
          )}
          
          {!isRecognitionSupported && (
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Voice input not supported in this browser. Try Chrome, Edge, or Safari.
            </div>
          )}
          
          {!isSpeechSupported && speechEnabled && (
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Text-to-speech not supported in this browser.
            </div>
          )}
        </div>
      </footer>

      {/* AI Settings Modal */}
      <AISettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
      />

      {/* Speech Settings Modal */}
      <SpeechSettings
        isOpen={showSpeechSettings}
        onClose={() => setShowSpeechSettings(false)}
        speechLanguage={speechLanguage}
        setSpeechLanguage={setSpeechLanguage}
        voiceSettings={voiceSettings}
        setVoiceSettings={setVoiceSettings}
        speechEnabled={speechEnabled}
        setSpeechEnabled={setSpeechEnabled}
        isRecognitionSupported={isRecognitionSupported}
        isSpeechSupported={isSpeechSupported}
        continuousListening={continuousListening}
        setContinuousListening={setContinuousListening}
        wakeWordEnabled={wakeWordEnabled}
        setWakeWordEnabled={setWakeWordEnabled}
      />
    </div>
  );
};

export default AIAssistant;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, Send, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Assistant. I can help you with various tasks and answer your questions. You can type or use voice input to communicate with me.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }

      synthRef.current = window.speechSynthesis;
    }
  }, []);

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
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      // Speak the response
      if (speechEnabled && synthRef.current) {
        speakText(aiResponse.text);
      }
    }, 1000 + Math.random() * 2000); // Simulate network delay
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "That's an interesting question! Let me think about that. Based on my understanding, I would suggest considering multiple perspectives on this topic.",
      "I appreciate you sharing that with me. From what I can analyze, there are several approaches we could explore together.",
      "Thank you for asking! This is a complex topic that involves various factors. Let me break it down for you.",
      "I understand what you're looking for. Based on current knowledge and best practices, here's what I would recommend.",
      "That's a great point you've raised. Let me provide some insights that might help clarify things for you.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const speakText = (text: string) => {
    if (synthRef.current && speechEnabled) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
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
              <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Powered by advanced AI technology</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSpeech}
            className={cn(
              "transition-colors",
              speechEnabled ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {speechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
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
                  <p className="text-sm leading-relaxed">{message.text}</p>
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
                placeholder="Type your message or use voice input..."
                className="pr-12 bg-muted/30 border-border/40 focus:border-primary/50 transition-colors"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isListening || isLoading}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8",
                  isListening && "text-primary animate-pulse"
                )}
              >
                <Mic className="h-4 w-4" />
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
            <div className="flex items-center justify-center mt-2 text-sm text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
              Listening... Speak now
            </div>
          )}
          
          {isSpeaking && (
            <div className="flex items-center justify-center mt-2 text-sm text-secondary">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse mr-2"></div>
              AI is speaking...
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AIAssistant;
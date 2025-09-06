import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Key, Brain, Globe, Code, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedAIService } from '@/services/EnhancedAIService';
import { AI_MODELS, KNOWLEDGE_DOMAINS } from '@/types/ai-models';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
}

const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose, selectedDomain, setSelectedDomain }) => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    perplexity: ''
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAPIKey = async (provider: 'openai' | 'anthropic' | 'perplexity') => {
    const key = apiKeys[provider];
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setTestingConnection(provider);
      EnhancedAIService.setAPIKey(provider, key);
      
      toast({
        title: "Success",
        description: `${provider.toUpperCase()} API key saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${provider} API key`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass border-border/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Assistant Configuration
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Knowledge Domains
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                AI Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configure AI Provider API Keys</h3>
                
                {(['openai', 'anthropic', 'perplexity'] as const).map((provider) => (
                  <Card key={provider} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{provider} API Key</h4>
                      <Badge variant="secondary">{provider === 'perplexity' ? 'Internet Access' : 'Advanced AI'}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder={`Enter your ${provider} API key`}
                        value={apiKeys[provider]}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSaveAPIKey(provider)}
                        disabled={testingConnection === provider}
                        className="min-w-[80px]"
                      >
                        {testingConnection === provider ? 'Testing...' : 'Save'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {provider === 'openai' && 'GPT-5 for advanced reasoning and mathematics'}
                      {provider === 'anthropic' && 'Claude for ethical analysis and research'}
                      {provider === 'perplexity' && 'Real-time internet research and current information'}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="domains" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Knowledge Domain</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {KNOWLEDGE_DOMAINS.map((domain) => (
                    <Card 
                      key={domain.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedDomain === domain.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedDomain(domain.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${domain.color} flex items-center justify-center text-white font-bold`}>
                            {domain.icon}
                          </div>
                          <h4 className="font-semibold">{domain.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{domain.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available AI Models</h3>
                <div className="space-y-3">
                  {AI_MODELS.map((model) => (
                    <Card key={model.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant="outline" className="capitalize">{model.provider}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {model.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettings;
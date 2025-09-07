import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SpeechSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  speechLanguage: string;
  setSpeechLanguage: (lang: string) => void;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
  };
  setVoiceSettings: (settings: { rate: number; pitch: number; volume: number }) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  isRecognitionSupported: boolean;
  isSpeechSupported: boolean;
  continuousListening?: boolean;
  setContinuousListening?: (enabled: boolean) => void;
  wakeWordEnabled?: boolean;
  setWakeWordEnabled?: (enabled: boolean) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'rw-RW', name: 'Kinyarwanda', flag: '🇷🇼' },
];

const SpeechSettings: React.FC<SpeechSettingsProps> = ({
  isOpen,
  onClose,
  speechLanguage,
  setSpeechLanguage,
  voiceSettings,
  setVoiceSettings,
  speechEnabled,
  setSpeechEnabled,
  isRecognitionSupported,
  isSpeechSupported,
  continuousListening = false,
  setContinuousListening,
  wakeWordEnabled = false,
  setWakeWordEnabled,
}) => {
  const { toast } = useToast();

  const testSpeech = () => {
    const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === speechLanguage);
    const testText = speechLanguage === 'rw-RW' 
      ? "Muraho! Ndagukorera. Ubu tuzakoresha ururimi rw'ikinyarwanda." 
      : speechLanguage.startsWith('fr') 
      ? "Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?"
      : speechLanguage.startsWith('es') 
      ? "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?"
      : speechLanguage.startsWith('de') 
      ? "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?"
      : "Hello! I'm your AI assistant. How can I help you today?";

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = speechLanguage;

      // Find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(speechLanguage.split('-')[0]));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "Testing Speech",
        description: `Speaking in ${selectedLang?.name || speechLanguage}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Speech Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Speech Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span className="text-sm">Voice Input</span>
              </div>
              <Badge variant={isRecognitionSupported ? "default" : "destructive"}>
                {isRecognitionSupported ? "Supported" : "Not Available"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Text-to-Speech</span>
              </div>
              <Badge variant={isSpeechSupported ? "default" : "destructive"}>
                {isSpeechSupported ? "Supported" : "Not Available"}
              </Badge>
            </div>
          </div>

          {/* Speech Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="speech-enabled" className="text-base font-medium">
              Enable Speech Features
            </Label>
            <Switch
              id="speech-enabled"
              checked={speechEnabled}
              onCheckedChange={setSpeechEnabled}
            />
          </div>

          {speechEnabled && (
            <>
              {/* Language Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Speech Language
                </Label>
                <Select value={speechLanguage} onValueChange={setSpeechLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Voice Settings</Label>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm">Speech Rate</Label>
                      <span className="text-sm text-muted-foreground">{voiceSettings.rate.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[voiceSettings.rate]}
                      onValueChange={([rate]) => setVoiceSettings({ ...voiceSettings, rate })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm">Pitch</Label>
                      <span className="text-sm text-muted-foreground">{voiceSettings.pitch.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[voiceSettings.pitch]}
                      onValueChange={([pitch]) => setVoiceSettings({ ...voiceSettings, pitch })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm">Volume</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(voiceSettings.volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[voiceSettings.volume]}
                      onValueChange={([volume]) => setVoiceSettings({ ...voiceSettings, volume })}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              {isRecognitionSupported && (
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-base font-medium">Advanced Features</Label>
                  
                  {setContinuousListening && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Continuous Listening</Label>
                        <p className="text-xs text-muted-foreground">Keep listening after each response</p>
                      </div>
                      <Switch
                        checked={continuousListening}
                        onCheckedChange={setContinuousListening}
                      />
                    </div>
                  )}
                  
                  {setWakeWordEnabled && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Wake Words</Label>
                        <p className="text-xs text-muted-foreground">Activate with "Hey AI", "Computer", etc.</p>
                      </div>
                      <Switch
                        checked={wakeWordEnabled}
                        onCheckedChange={setWakeWordEnabled}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Test Speech */}
              <Button
                onClick={testSpeech}
                variant="outline"
                className="w-full"
                disabled={!isSpeechSupported}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Speech
              </Button>
            </>
          )}

          {/* Device Compatibility Info */}
          <div className="p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Device Compatibility:</p>
            <ul className="space-y-1">
              <li>• Chrome, Edge, Safari: Full support</li>
              <li>• Firefox: Limited voice selection</li>
              <li>• Mobile: May require user interaction first</li>
              <li>• Offline mode available on most devices</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpeechSettings;
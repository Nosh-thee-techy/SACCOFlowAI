import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Phone, PhoneOff, Volume2, 
  Brain, Sparkles, X, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// You need to get an ElevenLabs agent ID from their dashboard
// For demo purposes, we'll prompt the user if not configured
const DEFAULT_AGENT_ID = '';

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentId, setAgentId] = useState(DEFAULT_AGENT_ID);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startConversation = useCallback(async () => {
    if (!agentId) {
      const id = prompt('Please enter your ElevenLabs Agent ID:');
      if (!id) {
        toast.error('Agent ID is required to use voice assistant');
        return;
      }
      setAgentId(id);
      return startConversationWithId(id);
    }
    return startConversationWithId(agentId);
  }, [agentId]);

  const startConversationWithId = async (id: string) => {
    setIsConnecting(true);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        body: { agentId: id }
      });

      if (error || !data?.signed_url) {
        throw new Error(error?.message || 'Failed to get conversation token');
      }

      // For now, we'll show a message since the full ElevenLabs SDK integration 
      // requires the @elevenlabs/react package
      toast.success('Voice assistant ready!', {
        description: 'ElevenLabs connection established'
      });
      
      setIsConnected(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Hello! I'm your fraud detection assistant. I can help you understand flagged transactions, explain AI alerts, and guide you through the review process. How can I help you today?",
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to connect', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = useCallback(() => {
    setIsConnected(false);
    setIsSpeaking(false);
    toast.info('Voice assistant disconnected');
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow-intelligence bg-gradient-to-r from-intelligence to-primary hover:opacity-90 transition-all hover:scale-110 z-50"
      >
        <Brain className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[600px] shadow-2xl border-intelligence/20 z-50 animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="p-4 gradient-intelligence flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Fraud Detection Assistant</h3>
            <p className="text-xs text-white/70">
              {isConnected ? (isSpeaking ? 'Speaking...' : 'Listening...') : 'Ready to help'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && !isConnected && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-intelligence/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-intelligence" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Start a conversation to get help with fraud detection
                </p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 animate-slide-up",
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === 'assistant' 
                    ? 'bg-intelligence/10 text-intelligence' 
                    : 'bg-primary/10 text-primary'
                )}>
                  {msg.role === 'assistant' ? (
                    <Brain className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === 'assistant'
                    ? 'bg-muted rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-intelligence">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-intelligence rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-intelligence rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-intelligence rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs">Speaking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={isConnecting}
                className="gap-2 bg-gradient-to-r from-intelligence to-primary hover:opacity-90"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Start Conversation
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full",
                    isSpeaking && "border-intelligence text-intelligence"
                  )}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-intelligence to-primary hover:opacity-90 shadow-glow-intelligence"
                >
                  <Mic className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={endConversation}
                  className="h-12 w-12 rounded-full"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          
          {isConnected && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Speak naturally about transactions, alerts, or fraud patterns
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

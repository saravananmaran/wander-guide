import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Something went wrong');
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ') || line.trim() === '' || line.startsWith(':')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
  onDone();
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      if (!session?.user) {
        setMessages([]);
        setConversationId(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load latest conversation when opened
  useEffect(() => {
    if (!open || !userId) return;
    (async () => {
      const { data: convs } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      let convId = convs?.[0]?.id;
      if (!convId) {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({ user_id: userId, title: 'Chennai Chat' })
          .select('id')
          .single();
        if (error) { console.error(error); return; }
        convId = newConv.id;
      }
      setConversationId(convId);

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    })();
  }, [open, userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const persistMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!userId || !conversationId) return;
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
    });
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const clearHistory = async () => {
    if (!conversationId) return;
    await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
    setMessages([]);
    toast({ title: 'Chat history cleared' });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    if (userId) persistMessage('user', text);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => {
          setLoading(false);
          if (assistantSoFar && userId) persistMessage('assistant', assistantSoFar);
        },
        onError: (err) => {
          upsert(`⚠️ ${err}`);
          setLoading(false);
        },
      });
    } catch {
      upsert('⚠️ Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setOpen(true)}
              variant="hero"
              size="icon"
              className="h-14 w-14 rounded-full shadow-2xl"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral to-sunset text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-display font-bold">ChennaiSpot AI</span>
              </div>
              <div className="flex items-center gap-1">
                {userId && messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 h-8 w-8" onClick={clearHistory} title="Clear history">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 h-8 w-8" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Ask me anything about Chennai!</p>
                  <p className="text-xs mt-1">
                    {userId ? 'Restaurants, places, directions…' : 'Sign in to save your chat history.'}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-coral/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-coral" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-coral text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-coral" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Chennai..."
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 disabled:opacity-50"
                  disabled={loading}
                />
                <Button type="submit" variant="coral" size="icon" disabled={loading || !input.trim()} className="rounded-xl shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

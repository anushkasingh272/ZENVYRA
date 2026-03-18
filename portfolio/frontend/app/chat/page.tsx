"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User, Mic, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";

function ChatContent() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I am the AI assistant trained on this professional's profile. You can ask me about their skills, experience, or projects!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [session] = useState(`sess_${Math.random().toString(36).substring(7)}`);
    const [targetUserId, setTargetUserId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const initChat = async () => {
            const username = searchParams.get("user");
            try {
                if (username) {
                    const res = await fetch(`http://localhost:8000/portfolio/${username}/public`);
                    if (res.ok) {
                        const data = await res.json();
                        setTargetUserId(data.user_id);
                    }
                } else {
                    const token = localStorage.getItem("token");
                    if (token) {
                        const res = await fetch("http://localhost:8000/auth/me", {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setTargetUserId(data.id);
                        }
                    }
                }
            } catch (error) {
                console.error("Could not fetch target user:", error);
            }
        };
        initChat();
    }, [searchParams]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !targetUserId) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMsg, user_id: targetUserId, session_id: session })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.answer || "I did not understand that." }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am having trouble connecting to my service right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleMicClick = () => {
        if (input.trim()) return;
        setInput("What are their key projects?");
    };

    return (
        <div className="py-20 md:py-28 min-h-[calc(100vh-8rem)] flex items-center justify-center w-full bg-slate-50/50 dark:bg-background/95">
            <Container className="max-w-4xl mx-auto">
                <Card className="w-full shadow-2xl border-primary/10 overflow-hidden bg-background rounded-3xl">
                    <CardHeader className="bg-muted/30 border-b px-8 py-6 flex flex-row items-center gap-6 space-y-0">
                        <div className="bg-primary/20 p-3 rounded-2xl ring-4 ring-primary/10 shadow-inner">
                            <Bot className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight">Ask About Me</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                                    {targetUserId ? "Digital Identity AI Agent" : "System Synchronizing..."}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/30 dark:bg-card/30 h-[500px] md:h-[600px]" ref={scrollRef}>
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={i}
                                    className={`flex gap-4 md:gap-6 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && (
                                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 shadow-xl shrink-0 mt-1">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <Bot className="h-5 w-5 md:h-6 md:w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`relative max-w-[85%] md:max-w-[75%] rounded-3xl px-6 py-4 text-base md:text-lg leading-relaxed shadow-xl border ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground border-primary rounded-tr-sm shadow-primary/20"
                                            : "bg-background/80 backdrop-blur-md border-border/80 text-foreground rounded-tl-sm shadow-black/5"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {msg.role === "user" && (
                                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 shadow-xl shrink-0 mt-1">
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                <User className="h-5 w-5 md:h-6 md:w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex gap-4 md:gap-6 w-full justify-start"
                                >
                                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 shadow-xl shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            <Bot className="h-5 w-5 md:h-6 md:w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-background/80 backdrop-blur-md border border-border/80 rounded-3xl rounded-tl-sm px-6 py-4 text-base shadow-xl flex items-center min-w-[120px] justify-center">
                                        <span className="flex gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <div className="p-6 md:p-8 border-t bg-background">
                        <form onSubmit={sendMessage} className="flex w-full items-center gap-4 relative">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleMicClick}
                                title="Hold to dictate (Voice AI)"
                                className="shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full hidden sm:flex border-primary/20 bg-muted/30 hover:bg-muted transition-all active:scale-90"
                            >
                                <Mic className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </Button>
                            <Input
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                                className="flex-1 h-12 md:h-14 rounded-2xl px-6 md:px-8 bg-muted/50 border-muted-foreground/10 focus-visible:ring-primary/50 text-base md:text-lg shadow-inner"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                size="icon"
                                className="shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl transition-all active:scale-90 bg-primary hover:shadow-primary/25"
                            >
                                <Send className="h-5 w-5 md:h-6 md:w-6 ml-1" />
                            </Button>
                        </form>
                        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mt-4 font-medium opacity-60">
                            <Info className="h-3 w-3" />
                            <span>AI can make mistakes. Verify important information.</span>
                        </div>
                    </div>
                </Card>
            </Container>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ChatContent />
        </Suspense>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Clipboard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/utils/clipboard";


export default function AIEnhancer() {
    const [projectDesc, setProjectDesc] = useState("");
    const [enhancedDesc, setEnhancedDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return router.push("/login");

            try {
                const res = await fetch("http://localhost:8000/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    setUser(await res.json());
                } else {
                    router.push("/login");
                }
            } catch {
                console.error("Failed to fetch user");
            }
        };
        fetchUser();
    }, [router]);

    const handleEnhance = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/ai/enhance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text: projectDesc, context: "project description" })
            });
            const data = await res.json();
            if (res.ok) {
                setEnhancedDesc(data.enhanced_text);
                toast.success("Description enhanced successfully!");
            } else {
                toast.error(data.detail || "Failed to enhance description.");
            }
        } catch {
            toast.error("An error occurred during AI enhancement.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(enhancedDesc);
        if (success) {
            setCopied(true);
            toast.success("Ready for your resume!", { description: "Copied to clipboard." });
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error("Failed to copy", { description: "Please copy manually." });
        }
    };


    if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 w-full">
            <Container className="py-20 md:py-28 space-y-12 md:space-y-16 w-full">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b pb-8">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight flex items-center gap-4">
                        <Sparkles className="h-10 w-10 text-primary" /> AI Description Enhancer
                    </h2>
                    <p className="text-neutral-400 mt-4 text-xl max-w-3xl leading-relaxed font-medium">
                        Transform simple bullet points into high-impact, ATS-optimized descriptions using context-aware AI models.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 w-full items-stretch">
                    <Card className="flex flex-col border-primary/10 shadow-2xl w-full rounded-3xl overflow-hidden bg-background">
                        <CardHeader className="bg-muted/30 pb-6 p-8 border-b">
                            <CardTitle className="text-2xl font-bold tracking-tight text-primary">Input Source</CardTitle>
                            <CardDescription className="text-base">Paste your raw project or task text here.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-8 pt-8">
                            <Textarea
                                value={projectDesc}
                                onChange={(e) => setProjectDesc(e.target.value)}
                                className="h-full min-h-[400px] md:min-h-[500px] p-6 resize-none text-lg border-muted-foreground/10 focus-visible:ring-primary/40 bg-muted/20 rounded-2xl leading-relaxed"
                                placeholder="e.g. Built a dashboard in React. Used Nodejs. Increased speed by 40%."
                            />
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-8 pt-0">
                            <Button size="lg" onClick={handleEnhance} disabled={loading || !projectDesc} className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl hover:shadow-primary/20 transition-all duration-300">
                                {loading ? (
                                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing & Optimizing...</>
                                ) : (
                                    <>Optimize with AI 🪄</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="flex flex-col bg-white dark:bg-card/40 shadow-2xl border-primary/5 w-full rounded-3xl overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6 p-8 border-b">
                            <CardTitle className="text-2xl font-bold tracking-tight text-primary">AI Refinement</CardTitle>
                            <CardDescription className="text-base">Professional, impactful phrasing generated for recruiters.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-8 pt-8">
                            <div className="h-full min-h-[400px] md:min-h-[500px] relative">
                                <Textarea
                                    readOnly
                                    value={enhancedDesc}
                                    placeholder="AI generation will appear here..."
                                    className="h-full w-full p-6 resize-none bg-background/50 text-lg border-dashed border-primary/20 rounded-2xl leading-relaxed focus-visible:ring-0"
                                />
                                {!enhancedDesc && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                        <Sparkles className="h-20 w-20" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-8 pt-0">
                            <Button variant="outline" size="lg" className="w-full h-16 text-lg font-bold rounded-2xl border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={handleCopy} disabled={!enhancedDesc}>
                                {copied ? <CheckCircle2 className="mr-3 h-6 w-6" /> : <Clipboard className="mr-3 h-6 w-6" />}
                                {copied ? "Copied!" : "Copy to Clipboard"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </Container>
        </div>
    );
}

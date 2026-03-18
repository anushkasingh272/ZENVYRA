"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GitPullRequest, Loader2, Star, GitFork, Code, PieChart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/Container";

export default function GitHubAnalyzer() {
    const [repoUrl, setRepoUrl] = useState("");
    const [insights, setInsights] = useState("");
    const [loading, setLoading] = useState(false);
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

    const [repoData, setRepoData] = useState<{
        name?: string;
        description?: string;
        stargazers_count?: number;
        forks_count?: number;
        language?: string;
    } | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setInsights(""); // clear previous insights
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/analyze-github`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ repo_url: repoUrl })
            });
            const data = await res.json();
            if (res.ok) {
                setInsights(data.analysis || JSON.stringify(data, null, 2));
                setRepoData(data.repository);
                toast.success("Repository analyzed!");
            } else {
                toast.error(data.detail || "Failed to analyze repository.");
            }
        } catch {
            toast.error("An error occurred during repository analysis.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 w-full">
            <Container className="py-20 md:py-28 space-y-12 md:space-y-16 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border-b pb-8"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight flex items-center gap-4">
                        <GitPullRequest className="h-10 w-10 text-primary" /> GitHub Intelligence
                    </h2>
                    <p className="text-muted-foreground mt-4 text-xl max-w-2xl leading-relaxed font-medium">
                        Unlock deep architectural insights from any GitHub project with AI-powered multidimensional assessment.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 w-full items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="flex flex-col w-full overflow-hidden rounded-3xl shadow-2xl border-primary/5">
                            <CardHeader className="bg-muted/30 p-8 border-b">
                                <CardTitle className="text-2xl font-bold tracking-tight">Active Scan</CardTitle>
                                <CardDescription className="text-base text-neutral-400">Enter a public repository URL to begin the architectural audit.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pb-10 flex flex-col gap-8 min-h-[350px]">
                                <div className="space-y-4">
                                    <Input
                                        placeholder="https://github.com/facebook/react"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        className="h-14 text-lg shadow-inner border-muted-foreground/10 bg-muted/20 focus-visible:ring-primary/30 rounded-xl"
                                    />
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={loading || !repoUrl}
                                        className="w-full h-14 text-lg font-black rounded-2xl transition-all hover:scale-[1.01] shadow-xl hover:shadow-primary/25"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                                Deconstructing Codebase...
                                            </>
                                        ) : (
                                            <>Launch Deep Analysis 🚀</>
                                        )}
                                    </Button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {repoData && !loading ? (
                                        <motion.div
                                            key="repo-data"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col gap-4 shadow-inner"
                                        >
                                            <h3 className="font-black text-2xl text-primary tracking-tight">{repoData.name}</h3>
                                            <p className="text-base text-muted-foreground leading-relaxed italic opacity-90">{repoData.description || "No description provided."}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-xl border border-yellow-500/10 font-bold text-sm">
                                                    <Star className="w-4 h-4" /> {repoData.stargazers_count?.toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-500/10 font-bold text-sm">
                                                    <GitFork className="w-4 h-4" /> {repoData.forks_count?.toLocaleString()}
                                                </div>
                                                {repoData.language && (
                                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/10 font-bold text-sm">
                                                        <Code className="w-4 h-4" /> {repoData.language}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ) : loading ? (
                                        <div className="p-6 space-y-6 animate-pulse bg-muted/20 rounded-2xl border border-muted-foreground/10 h-48">
                                            <div className="h-8 bg-muted/40 rounded w-2/3"></div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-muted/30 rounded w-full"></div>
                                                <div className="h-4 bg-muted/30 rounded w-4/5"></div>
                                            </div>
                                            <div className="flex gap-3 mt-4">
                                                <div className="h-10 w-24 bg-muted/40 rounded-xl"></div>
                                                <div className="h-10 w-24 bg-muted/40 rounded-xl"></div>
                                            </div>
                                        </div>
                                    ) : null}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-full"
                    >
                        <Card className="flex flex-col w-full overflow-hidden h-full min-h-[500px] md:min-h-[600px] rounded-3xl shadow-2xl border-primary/5">
                            <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold tracking-tight">AI Engine Findings</CardTitle>
                                    <CardDescription className="text-base">Neural assessment of patterns & quality.</CardDescription>
                                </div>
                                <PieChart className="h-8 w-8 text-primary opacity-40 hidden sm:block" />
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex flex-col h-full bg-slate-50/5 dark:bg-card/20">
                                <Textarea
                                    readOnly
                                    value={insights}
                                    placeholder="Insights will populate here after scan..."
                                    className="flex-1 min-h-[450px] lg:min-h-[550px] resize-none p-8 text-lg border-transparent shadow-none focus-visible:ring-0 leading-relaxed font-sans placeholder:italic whitespace-pre-wrap break-words no-scrollbar"
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </Container>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Sparkles, Plus, Star, Award, Eye, ClipboardCheck, Loader2, GitBranch, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/Container";
import { copyToClipboard } from "@/lib/utils/clipboard";


export default function Dashboard() {
    const [projectDesc, setProjectDesc] = useState("Developed a web app using React and Node.");
    const [enhancedDesc, setEnhancedDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("analytics");
    const [user, setUser] = useState<{ id: number; full_name: string; username: string } | null>(null);
    const router = useRouter();

    // Data states
    const [skills, setSkills] = useState<{ id: number; name: string; level: string }[]>([]);
    const [projects, setProjects] = useState<{ id: number; title: string; description: string; tech_stack: string[] }[]>([]);
    const [repos, setRepos] = useState<{ id: number; name: string; description: string; url: string; language: string; stars: number }[]>([]);

    // Analytics state
    const [analytics, setAnalytics] = useState<{
        score: number;
        breakdown: { skills: number; projects: number; experience: number; resume: number };
        suggestions: string[];
    } | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Form states
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillLevel] = useState("Beginner");
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [newProjectTechText, setNewProjectTechText] = useState("");
    const [newRepoUrl, setNewRepoUrl] = useState("");
    const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false);
    // "manual" | "github"
    const [projectAddMode, setProjectAddMode] = useState<"manual" | "github">("manual");
    const [importRepoUrl, setImportRepoUrl] = useState("");
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return router.push("/login");

            try {
                const res = await fetch("http://localhost:8000/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    fetchData(token);
                } else {
                    router.push("/login");
                }
            } catch {
                console.error("Failed to fetch user");
            }
        };
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    // fetchAnalytics MUST be defined before fetchData to avoid closure reference issues
    const refreshAnalytics = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/ai/analyze", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            } else {
                console.error("Analytics fetch failed:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchData = async (token: string) => {
        const headers = { "Authorization": `Bearer ${token}` };
        try {
            const [pRes, sRes, rRes] = await Promise.all([
                fetch("http://localhost:8000/projects/", { headers }),
                fetch("http://localhost:8000/skills/", { headers }),
                fetch("http://localhost:8000/repos/", { headers }),
            ]);
            if (pRes.ok) setProjects(await pRes.json());
            if (sRes.ok) setSkills(await sRes.json());
            if (rRes.ok) setRepos(await rRes.json());
        } catch (err) {
            console.error(err);
        }
        // Refresh analytics after data is loaded
        await refreshAnalytics();
    };
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

    const handleAddSkill = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/skills/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: newSkillName, level: newSkillLevel })
        });
        if (res.ok) {
            setIsSkillDialogOpen(false);
            setNewSkillName("");
            toast.success("Skill added!");
            // Refresh all data + analytics
            await fetchData(token as string);
        } else {
            toast.error("Failed to add skill");
        }
    };

    const handleAddProject = async () => {
        const token = localStorage.getItem("token");
        const techStack = newProjectTechText.split(",").map(s => s.trim()).filter(Boolean);
        const res = await fetch("http://localhost:8000/projects/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: newProjectTitle, description: newProjectDesc, tech_stack: techStack })
        });
        if (res.ok) {
            setIsProjectDialogOpen(false);
            setNewProjectTitle("");
            setNewProjectDesc("");
            setNewProjectTechText("");
            toast.success("Project added!");
            // Refresh all data + analytics
            await fetchData(token as string);
        } else {
            toast.error("Failed to add project");
        }
    };

    const handleAddRepo = async () => {
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            // Call the working /analyze-github endpoint
            const res = await fetch(`http://localhost:8000/analyze-github`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ repo_url: newRepoUrl })
            });
            const data = await res.json();
            if (res.ok) {
                const repo = data.repository;
                // Save the repo to the user's profile
                const createRes = await fetch("http://localhost:8000/repos/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: repo.name,
                        description: repo.description || "",
                        url: newRepoUrl,
                        stars: repo.stargazers_count ?? 0,
                        forks: repo.forks_count ?? 0,
                        language: repo.language || ""
                    })
                });
                if (createRes.ok) {
                    setIsRepoDialogOpen(false);
                    setNewRepoUrl("");
                    toast.success(`"${repo.name}" analyzed and added!`);
                    // Refresh all data + analytics
                    await fetchData(token as string);
                } else {
                    const errData = await createRes.json();
                    toast.error(errData.detail || "Failed to save repository.");
                }
            } else {
                toast.error(data.detail || "Failed to analyze repository. Make sure it's a valid public GitHub URL.");
            }
        } catch {
            toast.error("Network error — could not reach the backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleImportProjectFromRepo = async () => {
        const token = localStorage.getItem("token");
        if (!importRepoUrl.trim()) return;
        setImportLoading(true);
        try {
            // Step 1: Fetch repo data from GitHub via backend
            const res = await fetch(`http://localhost:8000/analyze-github`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ repo_url: importRepoUrl })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.detail || "Failed to fetch repository. Make sure the URL is correct and the repo is public.");
                return;
            }

            const repo = data.repository;
            const techStack = repo.language ? [repo.language] : [];

            // Step 2: Immediately save as project
            const createRes = await fetch("http://localhost:8000/projects/", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    title: repo.name,
                    description: repo.description || `GitHub repository: ${repo.name}`,
                    tech_stack: techStack
                })
            });

            if (createRes.ok) {
                setIsProjectDialogOpen(false);
                setImportRepoUrl("");
                setProjectAddMode("manual");
                toast.success(`"${repo.name}" added to your projects!`);
                // Refresh all data + analytics
                await fetchData(token as string);
            } else {
                const err = await createRes.json();
                toast.error(err.detail || "Repository imported but failed to save as project.");
            }
        } catch {
            toast.error("Network error — could not reach backend.");
        } finally {
            setImportLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 w-full">
            <Container className="py-20 md:py-28 space-y-16 md:space-y-24 w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 w-full border-b pb-10">
                    <div className="space-y-3 group">
                        <Link href={`/${user.username}`} className="block">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                                Welcome, <span className="text-primary/80">{user.username}</span>.
                                <ExternalLink className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h1>
                        </Link>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium">Manage your AI-powered professional identity.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button asChild className="w-full md:w-auto shadow-sm rounded-xl px-6 py-3 font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={`/${user.username}`}><Star className="mr-2 h-4 w-4 fill-current" /> View Public Profile</Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs Layout */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 md:inline-flex md:h-14 md:bg-muted/50 p-1.5 rounded-2xl mb-12">
                        <TabsTrigger value="analytics" className="rounded-xl md:px-8">Analytics</TabsTrigger>
                        <TabsTrigger value="projects" className="rounded-xl md:px-8">Projects</TabsTrigger>
                        <TabsTrigger value="skills" className="rounded-xl md:px-8">Skills</TabsTrigger>
                        <TabsTrigger value="repos" className="rounded-xl md:px-8">Repos</TabsTrigger>
                        <TabsTrigger value="enhancer" className="rounded-xl md:px-8">AI Enhancer</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TabsContent value="analytics" className="space-y-10 mt-0">
                                {/* Show full spinner only on very first load */}
                                {analyticsLoading && !analytics ? (
                                    <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
                                        <AnalyticsCard
                                            title="Portfolio Score"
                                            value={analytics?.score ?? 0}
                                            sub={analytics?.score && analytics.score >= 80 ? "Top 15% of peers" : analytics?.score && analytics.score >= 60 ? "Above average" : "Keep adding projects!"}
                                            icon={<Award className="h-6 w-6 text-blue-500" />}
                                            colorClass="from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-900"
                                            loading={analyticsLoading}
                                        />
                                        <AnalyticsCard
                                            title="Items Tracked"
                                            value={projects.length + skills.length + repos.length}
                                            sub={`${projects.length} projects · ${skills.length} skills · ${repos.length} repos`}
                                            icon={<Eye className="h-6 w-6 text-purple-500" />}
                                            colorClass="from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-900"
                                        />
                                        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border shadow-md w-full rounded-2xl overflow-hidden">
                                            <CardHeader className="p-8 pb-4 bg-muted/20">
                                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <ClipboardCheck className="h-4 w-4" /> Score Breakdown
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-8 md:p-10">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-sm font-medium">
                                                    <ScoreBar label="Skills Validation" score={analytics?.breakdown.skills ?? 0} color="bg-blue-500" />
                                                    <ScoreBar label="Project Impact" score={analytics?.breakdown.projects ?? 0} color="bg-purple-500" />
                                                    <ScoreBar label="Experience Depth" score={analytics?.breakdown.experience ?? 0} color="bg-emerald-500" />
                                                    <ScoreBar label="Resume ATS Match" score={analytics?.breakdown.resume ?? 0} color="bg-amber-500" />
                                                </div>
                                                {analytics?.suggestions && analytics.suggestions.length > 0 && (
                                                    <div className="mt-6 space-y-2">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">💡 Suggestions to improve your score</p>
                                                        {analytics.suggestions.map((s, i) => (
                                                            <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                <span className="text-primary mt-0.5">→</span> {s}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="projects" className="space-y-10 mt-0">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b pb-6">
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                                        <Briefcase className="h-7 w-7 text-primary" /> Your Projects
                                    </h2>
                                    <Dialog open={isProjectDialogOpen} onOpenChange={(open) => { setIsProjectDialogOpen(open); if (!open) { setProjectAddMode("manual"); setImportRepoUrl(""); } }}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="rounded-full shadow-sm">
                                                <Plus className="mr-2 h-4 w-4" /> Add Project
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>Add New Project</DialogTitle>
                                                <DialogDescription>Manually enter details or import directly from a GitHub repository.</DialogDescription>
                                            </DialogHeader>
                                            {/* Mode switcher */}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => setProjectAddMode("manual")}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${projectAddMode === "manual" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"}`}
                                                >
                                                    ✏️ Manual Entry
                                                </button>
                                                <button
                                                    onClick={() => setProjectAddMode("github")}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${projectAddMode === "github" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"}`}
                                                >
                                                    🐙 From GitHub Repo
                                                </button>
                                            </div>

                                            {projectAddMode === "github" ? (
                                                <div className="space-y-4 pt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Paste a public GitHub repo URL. We&apos;ll fetch its details and <strong>instantly add it</strong> to your Projects — no extra steps.
                                                    </p>
                                                    <Input
                                                        placeholder="https://github.com/owner/repository"
                                                        value={importRepoUrl}
                                                        onChange={e => setImportRepoUrl(e.target.value)}
                                                        onKeyDown={e => { if (e.key === "Enter" && importRepoUrl && !importLoading) handleImportProjectFromRepo(); }}
                                                    />
                                                    <Button
                                                        onClick={handleImportProjectFromRepo}
                                                        disabled={!importRepoUrl || importLoading}
                                                        className="w-full h-11 font-semibold"
                                                    >
                                                        {importLoading
                                                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching & Saving...</>
                                                            : "� Import & Add to Portfolio"}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 pt-2">
                                                    <Input placeholder="Project Title" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} />
                                                    <Textarea placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} />
                                                    <Input placeholder="Tech Stack (comma separated, e.g. React, Node.js)" value={newProjectTechText} onChange={e => setNewProjectTechText(e.target.value)} />
                                                </div>
                                            )}
                                            <DialogFooter>
                                                {projectAddMode === "manual" && (
                                                    <Button onClick={handleAddProject} disabled={!newProjectTitle}>Save Project</Button>
                                                )}
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
                                    {projects.map((p) => (
                                        <ProjectCard key={p.id} title={p.title} desc={p.description} stack={p.tech_stack || []} />
                                    ))}
                                    {projects.length === 0 && (
                                        <Card className="flex items-center justify-center p-6 border-dashed border-2 hover:bg-muted/50 cursor-pointer transition-colors shadow-none rounded-xl" onClick={() => setIsProjectDialogOpen(true)}>
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Plus className="h-8 w-8 mb-2 opacity-50" />
                                                <span className="font-semibold text-lg">Create New</span>
                                                <span className="text-sm">Link GitHub repo</span>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="repos" className="space-y-10 mt-0">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b pb-6">
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                                        <GitBranch className="h-7 w-7 text-primary" /> GitHub Repositories
                                    </h2>
                                    <Dialog open={isRepoDialogOpen} onOpenChange={setIsRepoDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="rounded-full shadow-sm">
                                                <Plus className="mr-2 h-4 w-4" /> Add Git Repo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Git Repository</DialogTitle>
                                                <DialogDescription>Paste the URL of your GitHub repository (e.g. https://github.com/owner/repo).</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <Input placeholder="Repository URL" value={newRepoUrl} onChange={e => setNewRepoUrl(e.target.value)} />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleAddRepo} disabled={!newRepoUrl || loading}>
                                                    {loading ? "Analyzing..." : "Analyze & Add"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
                                    {repos.map((r) => (
                                        <ProjectCard key={r.id} title={r.name} desc={r.description} stack={[r.language, `⭐ ${r.stars}`]} />
                                    ))}
                                    {repos.length === 0 && (
                                        <Card className="flex items-center justify-center p-6 border-dashed border-2 hover:bg-muted/50 cursor-pointer transition-colors shadow-none rounded-xl" onClick={() => setIsRepoDialogOpen(true)}>
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Plus className="h-8 w-8 mb-2 opacity-50" />
                                                <span className="font-semibold text-lg">Import Repo</span>
                                                <span className="text-sm">with AI analysis</span>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="enhancer" className="space-y-10 mt-0">
                                <div className="border-b pb-6">
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                                        <Sparkles className="h-7 w-7 text-primary" /> AI Description Enhancer
                                    </h2>
                                    <p className="text-muted-foreground mt-2 text-lg">Transform simple bullet points into high-impact, ATS-optimized descriptions.</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
                                    <Card className="flex flex-col border-primary/20 shadow-md w-full rounded-2xl">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle>Draft Description</CardTitle>
                                            <CardDescription>Paste your raw project or task text.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 pt-6 min-h-[400px]">
                                            <Textarea
                                                value={projectDesc}
                                                onChange={(e) => setProjectDesc(e.target.value)}
                                                className="h-full min-h-[350px] resize-none text-base border-muted-foreground/20 focus-visible:ring-primary/50"
                                                placeholder="e.g. Built a dashboard in React."
                                            />
                                        </CardContent>
                                        <CardFooter className="bg-muted/10 pt-4">
                                            <Button onClick={handleEnhance} disabled={loading || !projectDesc} className="w-full h-12 text-md font-semibold rounded-xl">
                                                {loading ? "Optimizing..." : "Optimize with AI 🪄"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                    <Card className="flex flex-col bg-slate-50 dark:bg-card shadow-sm border w-full rounded-2xl">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle>Enhanced Output</CardTitle>
                                            <CardDescription>Professional, impactful phrasing.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 pt-6 min-h-[400px]">
                                            <Textarea
                                                readOnly
                                                value={enhancedDesc}
                                                placeholder="AI generation will appear here..."
                                                className="h-full min-h-[350px] resize-none bg-background text-base border-transparent shadow-none focus-visible:ring-0"
                                            />
                                        </CardContent>
                                        <CardFooter className="bg-muted/10 pt-4">
                                            <Button variant="outline" className="w-full h-12 text-md font-semibold rounded-xl" onClick={async () => {
                                                const success = await copyToClipboard(enhancedDesc);
                                                if (success) {
                                                    toast.success("Ready for your resume!", { description: "Copied to clipboard." });
                                                } else {
                                                    toast.error("Failed to copy to clipboard", { description: "Please select and copy manually." });
                                                }
                                            }} disabled={!enhancedDesc}>
                                                Copy to Clipboard
                                            </Button>
                                        </CardFooter>

                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="skills" className="space-y-10 mt-0">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b pb-6">
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Verified Skills</h2>
                                    <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="rounded-full shadow-sm">
                                                <Plus className="mr-2 h-4 w-4" /> Add Skill
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add a Skill</DialogTitle>
                                                <DialogDescription>Add a new skill to showcase.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <Input placeholder="Skill Name (e.g. React)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleAddSkill} disabled={!newSkillName}>Save Skill</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Card className="border shadow-sm p-2 md:p-6">
                                    <CardContent className="pt-4">
                                        <div className="flex flex-wrap gap-3">
                                            {skills.map((skill) => (
                                                <Badge key={skill.id} variant="secondary" className="px-4 py-1.5 md:py-2 text-sm md:text-base font-semibold bg-muted hover:bg-muted/80 hover:scale-105 transition-transform cursor-default border">
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        {skills.length === 0 && <p className="text-muted-foreground text-center">No skills added yet.</p>}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </Container>
        </div>
    );
}

function AnalyticsCard({ title, value, sub, icon, colorClass, loading }: { title: string, value: string | number, sub: string, icon: React.ReactNode, colorClass: string, loading?: boolean }) {
    return (
        <Card className={`border shadow-sm bg-gradient-to-br ${colorClass} relative overflow-hidden`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            {title}
                            {loading && <Loader2 className="h-3 w-3 animate-spin opacity-60" />}
                        </p>
                        <p className="text-4xl font-extrabold text-foreground tracking-tight">{value}</p>
                        <p className="text-sm font-medium opacity-80">{sub}</p>
                    </div>
                    <div className="p-3 bg-background/50 backdrop-blur rounded-xl shadow-sm border border-border/50">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ScoreBar({ label, score, color }: { label: string, score: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between w-full">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{score}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden w-full border shadow-inner">
                <div className={`h-full ${color} rounded-r-none transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}


function ProjectCard({ title, desc, stack }: { title: string, desc: string, stack: string[] }) {
    return (
        <Card className="group flex flex-col justify-between transition-all duration-200 hover:shadow-xl border cursor-pointer hover:border-primary/30 rounded-2xl overflow-hidden w-full">
            <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">{title}</CardTitle>
                <CardDescription className="text-base mt-2 line-clamp-2 leading-relaxed">{desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex items-end">
                <div className="flex flex-wrap gap-2 w-full">
                    {stack.map((s, idx) => (
                        s ? <Badge key={idx} variant="outline" className="bg-background/50 font-medium">
                            {s}
                        </Badge> : null
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-4 border-t bg-muted/20 group-hover:bg-primary/5 transition-colors">
                <Button variant="ghost" className="w-full font-semibold">Manage Repo</Button>
            </CardFooter>
        </Card>
    );
}

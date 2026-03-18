"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ghost, Loader2, Sparkles, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/Container";

interface Skill {
    id: number;
    name: string;
    level: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    tech_stack: string[];
}

interface Profile {
    user_id: number;
    full_name: string;
    bio: string;
    skills: Skill[];
    projects: Project[];
}

export default function PublicProfile() {
    const params = useParams();
    const username = params.username as string;

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`http://localhost:8000/portfolio/${username}/public`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                } else {
                    setProfile(null);
                }
            } catch {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 dark:bg-background">
                <Ghost className="h-20 w-20 text-muted-foreground opacity-20" />
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Profile not found</h1>
                    <p className="text-muted-foreground text-xl max-w-md mx-auto">The user &quot;{username}&quot; does not exist or their profile is private.</p>
                </div>
                <Button asChild size="lg" className="rounded-xl px-8 py-4 font-bold mt-4 shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <Link href="/">Back to Homepage</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-slate-50/50 dark:bg-background w-full min-h-[calc(100vh-4rem)]">
            <Container className="py-20 md:py-32 space-y-24 md:space-y-32">

                {/* Header / Hero Section */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 max-w-4xl mx-auto">
                    <div className="mx-auto bg-gradient-to-tr from-primary/20 via-primary/10 to-indigo-500/20 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-background ring-2 ring-primary/20 relative">
                        <span className="text-6xl md:text-7xl font-black text-primary drop-shadow-sm">{profile.full_name.charAt(0)}</span>
                        <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border shadow-lg">
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                            {profile.full_name}
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-2xl mx-auto font-medium">
                            {profile.bio || "Full-stack developer passionate about building AI-powered solutions and scalable architectures."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                        <Button asChild size="lg" className="rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 w-full sm:w-auto h-16 px-10 text-lg font-bold hover:scale-[1.02] active:scale-[0.98]">
                            <Link href={`/chat?user=${username}`}>
                                <MessageSquare className="mr-3 h-6 w-6" /> Ask AI Assistant
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-2xl w-full sm:w-auto h-16 px-10 text-lg font-bold bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-muted transition-all duration-200">
                            <a href={`http://127.0.0.1:8000/portfolio/${username}/resume`} download target="_blank" rel="noopener noreferrer">
                                Download Resume
                            </a>
                        </Button>
                    </div>
                </motion.div>

                {/* Skills Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-10">
                    <div className="flex items-center gap-4 border-b pb-6">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Tech Expertise</h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="px-6 py-3 text-base md:text-lg bg-white dark:bg-card border shadow-md hover:shadow-xl hover:border-primary/30 transition-all cursor-default group rounded-2xl">
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{skill.name}</span>
                                <span className="text-muted-foreground/30 mx-3 font-light">|</span>
                                <span className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">{skill.level}</span>
                            </Badge>
                        ))}
                    </div>
                </motion.div>

                {/* Projects Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-12">
                    <div className="flex items-center gap-4 border-b pb-6">
                        <div className="bg-indigo-500/10 p-3 rounded-2xl">
                            <ExternalLink className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Featured Engineering</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                        {profile.projects.map((project) => (
                            <Card key={project.id} className="overflow-hidden group hover:border-primary/50 w-full rounded-3xl transition-all duration-300 hover:shadow-2xl bg-card shadow-lg border-primary/5">
                                <div className="h-2 bg-gradient-to-r from-primary to-indigo-500" />
                                <CardHeader className="bg-muted/10 p-8 pb-4">
                                    <CardTitle className="text-2xl md:text-3xl font-black group-hover:text-primary transition-colors tracking-tight">{project.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 p-8 pt-4">
                                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-medium line-clamp-4">{project.description}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {project.tech_stack.map((stack) => (
                                            <Badge key={stack} variant="outline" className="bg-background/80 backdrop-blur-sm font-bold py-1.5 px-3 rounded-lg border-primary/10 hover:border-primary transition-colors">
                                                {stack}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

            </Container>
        </div>
    );
}

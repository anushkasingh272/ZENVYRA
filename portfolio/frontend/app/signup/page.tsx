"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate username from email
            const username = email.split('@')[0];

            const res = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: name,
                    username
                })
            });

            if (res.ok) {
                toast.success("Account created successfully. Please login.");
                router.push("/login");
            } else {
                const data = await res.json();
                toast.error(data.detail || "Failed to create account");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-8rem)] flex items-center bg-slate-50/50 dark:bg-background/95">
            <Container className="py-20 md:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-center">
                    <div className="hidden lg:block space-y-8 pr-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                                Build your AI portfolio.
                            </h1>
                            <p className="text-neutral-400 text-xl leading-relaxed max-w-xl">
                                Create an account to unlock the dashboard, AI tools, and a public profile you can share with recruiters.
                            </p>
                        </div>
                        <div className="h-px bg-neutral-800/80 w-full max-w-xl" />
                        <p className="text-lg text-neutral-400">
                            Already have an account?{" "}
                            <Link href="/login" className="underline underline-offset-4 hover:text-primary font-medium text-foreground">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto lg:mx-0">
                        <Card className="w-full shadow-2xl border-primary/10 rounded-2xl overflow-hidden">
                            <CardHeader className="space-y-3 text-center p-8 pb-4">
                                <CardTitle className="text-4xl font-bold tracking-tight">Sign up</CardTitle>
                                <CardDescription className="text-neutral-400 text-base">
                                    Enter your information to create your account.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-6 p-8 pt-4">
                                    <div className="space-y-3">
                                        <label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                                        <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className="h-14 border-muted-foreground/20 rounded-xl bg-muted/30 focus-visible:ring-primary/50 text-base" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                                        <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="h-14 border-muted-foreground/20 rounded-xl bg-muted/30 focus-visible:ring-primary/50 text-base" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="h-14 border-muted-foreground/20 rounded-xl bg-muted/30 focus-visible:ring-primary/50 text-base" />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-6 p-8 pt-0">
                                    <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-200" type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Create account
                                    </Button>
                                    <div className="text-base text-center text-muted-foreground lg:hidden">
                                        Already have an account?{" "}
                                        <Link href="/login" className="underline underline-offset-4 hover:text-primary font-semibold text-foreground">
                                            Sign in
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </Container>
        </div>
    );
}

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

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.access_token);
                // Also set cookie for middleware if needed
                document.cookie = `token=${data.access_token}; path=/; max-age=86400;`;
                toast.success("Welcome back!");
                router.push("/dashboard");
            } else {
                const data = await res.json();
                toast.error(data.detail || "Invalid credentials");
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
                                Welcome back.
                            </h1>
                            <p className="text-neutral-400 text-xl leading-relaxed max-w-xl">
                                Log in to manage your dashboard, analyze GitHub repos, and refine your portfolio with AI tools.
                            </p>
                        </div>
                        <div className="h-px bg-neutral-800/80 w-full max-w-xl" />
                        <p className="text-lg text-neutral-400">
                            New here?{" "}
                            <Link href="/signup" className="underline underline-offset-4 hover:text-primary font-medium text-foreground">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto lg:mx-0">
                        <Card className="w-full shadow-2xl border-primary/10 rounded-2xl overflow-hidden">
                            <CardHeader className="space-y-3 text-center p-8 pb-4">
                                <CardTitle className="text-4xl font-bold tracking-tight">Log in</CardTitle>
                                <CardDescription className="text-neutral-400 text-base">
                                    Enter your email and password to access your account.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-6 p-8 pt-4">
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
                                        Sign In
                                    </Button>
                                    <div className="text-base text-center text-muted-foreground lg:hidden">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/signup" className="underline underline-offset-4 hover:text-primary font-semibold text-foreground">
                                            Sign up
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

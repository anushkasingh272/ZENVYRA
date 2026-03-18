"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<{ full_name: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:8000/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                    localStorage.removeItem("token");
                    document.cookie = "token=; path=/; max-age=0;";
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0;";
        setUser(null);
        toast.info("Logged out successfully");
        router.push("/login");
    };

    const links = [
        { href: "/", label: "Home", protected: false, hideOnAuth: true },
        { href: "/dashboard", label: "Dashboard", protected: true },
        { href: "/ai-enhancer", label: "AI Enhancer", protected: true },
        { href: "/chat", label: "Ask About Me", protected: true },
        { href: "/github", label: "GitHub Analysis", protected: true }
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[1400px] mx-auto px-6 w-full flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-extrabold tracking-tight text-xl md:text-2xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        AI Portfolio
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {links.map(link => {
                        if (link.protected && !user) return null;
                        if (link.hideOnAuth && user) return null;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors hover:text-primary ${pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    <div className="flex items-center gap-4 border-l pl-6 ml-2">
                        {!loading && !user ? (
                            <>
                                <Button variant="ghost" asChild className="font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="font-semibold rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    Welcome, {user.username}
                                </span>
                                <Button onClick={handleLogout} variant="outline" size="sm" className="font-semibold rounded-xl px-4 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
                                    <LogOut className="h-4 w-4 mr-2" /> Logout
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </nav>

                {/* Mobile Hamburger toggle */}
                <button className="md:hidden p-2 text-muted-foreground" onClick={toggleMenu} aria-label="Toggle Menu">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden bg-background border-b border-neutral-800"
                    >
                        <div className="max-w-[1400px] mx-auto px-6 w-full flex flex-col gap-4 py-4">
                            {links.map(link => {
                                if (link.protected && !user) return null;
                                if (link.hideOnAuth && user) return null;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-lg font-medium p-2 rounded-md transition-colors ${pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                                {!loading && !user ? (
                                    <>
                                        <Button variant="outline" asChild onClick={() => setIsOpen(false)} className="w-full justify-center">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild onClick={() => setIsOpen(false)} className="w-full justify-center">
                                            <Link href="/signup">Sign Up</Link>
                                        </Button>
                                    </>
                                ) : user ? (
                                    <>
                                        <span className="w-full text-center flex items-center gap-2 justify-center py-2 text-muted-foreground font-semibold">
                                            <UserIcon className="h-4 w-4" />
                                            Welcome, {user.username}
                                        </span>
                                        <Button variant="outline" onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full justify-center hover:bg-destructive hover:text-destructive-foreground">
                                            <LogOut className="h-4 w-4 mr-2" /> Logout
                                        </Button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

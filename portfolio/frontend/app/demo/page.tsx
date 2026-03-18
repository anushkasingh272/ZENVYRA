"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoPage() {
    const router = useRouter();

    useEffect(() => {
        const initDemo = async () => {
            try {
                const res = await fetch("http://localhost:8000/auth/demo", { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem("token", data.access_token);
                    document.cookie = `token=${data.access_token}; path=/; max-age=86400;`;
                    router.push("/dashboard");
                } else {
                    router.push("/login");
                }
            } catch {
                router.push("/login");
            }
        };
        initDemo();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-lg text-muted-foreground">Setting up demo account...</p>
            </div>
        </div>
    );
}

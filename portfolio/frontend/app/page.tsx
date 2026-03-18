"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, Shield, MessageSquare, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";

export default function Home() {
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/demo", { method: "POST" });
      if (res.ok) {
        router.push("/demo");
      } else {
        router.push("/demo");
      }
    } catch {
      router.push("/demo");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center justify-center text-center w-full">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
          <div className="w-[600px] h-[600px] opacity-10 blur-3xl rounded-full bg-gradient-to-tr from-primary to-blue-400" />
        </div>

        <Container className="flex flex-col items-center gap-6 md:gap-8 py-20 md:py-28 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-full bg-background/50 border border-primary/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium flex items-center gap-2 shadow-sm text-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span>Next-Generation AI Portfolio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight max-w-5xl"
          >
            Stand out with an <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI-Powered</span> Portfolio.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            A premium, market-ready platform that combines your GitHub projects, resume, and an intelligent AI chatbot trained on your professional journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center"
          >
            <Button size="lg" asChild className="h-14 px-8 py-3 text-lg font-semibold rounded-xl w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02]">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={handleDemo} disabled={demoLoading} className="h-14 px-8 py-3 text-lg font-semibold rounded-xl w-full sm:w-auto shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-background">
              {demoLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-purple-600 text-purple-600" />} Try Demo
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28 bg-white dark:bg-card/30 border-t w-full">
        <Container className="flex flex-col items-center space-y-12 md:space-y-16">
          <div className="text-center space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to showcase your skills.</h2>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
              Impress recruiters faster with tailored, data-driven features built around your unique experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-blue-500" />}
              title="Smart Portfolio Analytics"
              description="Get AI-driven insights on your profile strengths, weaknesses, and a dynamic job-readiness score."
              delay={0.1}
            />
            <FeatureCard
              icon={<Terminal className="h-8 w-8 text-green-500" />}
              title="AI Resume Enhancer"
              description="Auto-improve your project descriptions using advanced NLP models optimized for ATS parsing."
              delay={0.2}
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-purple-500" />}
              title="Ask About Me Bot"
              description="Let recruiters chat directly with an interactive AI specifically trained on your projects and resume."
              delay={0.3}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-200 group"
    >
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20 mb-6">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

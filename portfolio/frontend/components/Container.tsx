import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 w-full", className)}>
            {children}
        </div>
    );
}

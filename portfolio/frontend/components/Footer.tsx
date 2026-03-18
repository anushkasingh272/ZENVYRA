import { Container } from "./Container";

export function Footer() {
    return (
        <footer className="border-t border-neutral-800 py-20 bg-card w-full">
            <Container className="flex flex-col items-center justify-between gap-4 md:flex-row w-full">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <p className="text-center text-sm md:text-left text-neutral-400">
                        Built by <span className="font-semibold text-foreground">You</span>. Hosted anywhere.
                    </p>
                    <p className="text-xs text-neutral-400/60">
                        AI-Powered Personal Portfolio Platform &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </Container>
        </footer>
    );
}

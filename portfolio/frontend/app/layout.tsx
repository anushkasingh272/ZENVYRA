import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 flex flex-col w-full">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

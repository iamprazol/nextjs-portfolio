import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CommandPaletteLoader } from "@/components/shell/CommandPaletteLoader";
import { Footer } from "@/components/shell/Footer";
import { NavBar } from "@/components/shell/NavBar";
import { env } from "@/env";
import { getProfile } from "@/lib/github";

import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();

    return {
        metadataBase: new URL(env.SITE_URL),
        title: { default: profile.name, template: `%s — ${profile.name}` },
        description: profile.headline ?? undefined
    };
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
            <body className="bg-bg text-ink flex min-h-screen flex-col">
                <a
                    href="#content"
                    className="bg-panel border-line-2 text-ink sr-only rounded-lg border px-4 py-3 font-mono text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
                >
                    Skip to content
                </a>
                <Providers>
                    <NavBar />
                    {/* tabIndex lets the skip link move focus here, not just scroll. */}
                    <main id="content" tabIndex={-1} className="flex-1 outline-none">
                        {children}
                    </main>
                    <Footer />
                    <CommandPaletteLoader />
                </Providers>
            </body>
        </html>
    );
}

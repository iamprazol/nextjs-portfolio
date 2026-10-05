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
    display: "swap",
    subsets: ["latin"]
});

// next/font's generated fallback is Arial stretched to the average glyph
// width, which is far off for monospace text (uppercase labels came out ~15%
// wider and wrapped until the font arrived). System monospace fonts share
// Geist Mono's 0.6em advance, so they stand in with almost no layout shift.
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    display: "swap",
    subsets: ["latin"],
    adjustFontFallback: false,
    fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
});

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();

    return {
        metadataBase: new URL(env.SITE_URL),
        title: { default: profile.name, template: `%s — ${profile.name}` },
        description: profile.headline ?? undefined,
        openGraph: {
            type: "website",
            siteName: profile.name,
            title: profile.name,
            description: profile.headline ?? undefined,
            url: "/"
        },
        twitter: { card: "summary_large_image" },
        alternates: {
            types: { "application/rss+xml": [{ url: "/log/rss.xml", title: "Engineering Log" }] }
        }
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
            <body className="bg-bg text-ink flex min-h-screen flex-col print:block print:min-h-0">
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

import { notFound } from "next/navigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Dev-only swatch sheet for the tokens in globals.css. Served at /_tokens:
// the folder is named %5Ftokens because a literal "_" prefix makes it private.

const colorTokens = [
    { name: "bg", use: "Page background" },
    { name: "panel", use: "Cards, panels" },
    { name: "panel-2", use: "Inset areas, icon tiles" },
    { name: "line", use: "Dividers, card borders" },
    { name: "line-2", use: "Stronger borders, inputs" },
    { name: "chip", use: "Tag backgrounds" },
    { name: "ink", use: "Primary text" },
    { name: "ink-2", use: "Secondary text" },
    { name: "mute", use: "Captions, mono labels" },
    { name: "link", use: "Text links" },
    { name: "wire", use: "Diagram connectors" },
    { name: "acc", use: "Accent" },
    { name: "acc-soft", use: "Accent fills" },
    { name: "acc-line", use: "Accent borders" },
    { name: "acc-ink", use: "Text on accent-soft" },
    { name: "on-acc", use: "Text on solid accent" },
    { name: "ok", use: "Production / online" },
    { name: "ok-soft", use: "Production fill" },
    { name: "teal", use: "Active" },
    { name: "violet", use: "Experiment" },
    { name: "term", use: "Terminal background" },
    { name: "term-ink", use: "Terminal text" },
    { name: "term-mute", use: "Terminal secondary" },
    { name: "grid", use: "64px background grid" },
    { name: "glow", use: "Globe / pin glow" }
];

function TokenSheet({ theme }: { theme: "light" | "dark" }) {
    return (
        <section className={`${theme} bg-bg text-ink flex-1 p-6 sm:p-8`}>
            <h2 className="font-mono text-mute text-[11px] tracking-[.18em] uppercase">
                {theme}
            </h2>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {colorTokens.map((token) => (
                    <li
                        key={token.name}
                        className="border-line-2 bg-panel flex items-center gap-3 rounded-lg border p-3"
                    >
                        <span
                            className="border-line-2 size-11 shrink-0 rounded-md border"
                            style={{ background: `var(--${token.name})` }}
                        />
                        <span className="min-w-0">
                            <span className="block font-mono text-sm">
                                --{token.name}
                            </span>
                            <span className="text-mute block text-xs">
                                {token.use}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>

            <h3 className="font-mono text-mute mt-10 text-[11px] tracking-[.18em] uppercase">
                Type
            </h3>
            <p className="mt-3 font-mono text-2xl">Geist Mono 0123456789</p>
            <p className="text-ink-2 mt-1 font-sans text-base">
                Geist — body copy in --ink-2, with a{" "}
                <span className="text-link underline">text link</span>.
            </p>

            <h3 className="font-mono text-mute mt-10 text-[11px] tracking-[.18em] uppercase">
                .bg-grid
            </h3>
            <div className="bg-grid border-line-2 mt-3 h-48 rounded-lg border" />

            <h3 className="font-mono text-mute mt-10 text-[11px] tracking-[.18em] uppercase">
                Card (shadow-card)
            </h3>
            <div className="bg-panel border-line-2 shadow-card mt-3 rounded-xl border p-5">
                <p className="text-sm">
                    Panel on --bg with a --line-2 border. The shadow shows in
                    light mode only.
                </p>
            </div>
        </section>
    );
}

export default function TokensPage() {
    if (process.env.NODE_ENV === "production") notFound();

    return (
        <main className="min-h-screen">
            <div className="flex items-center justify-between gap-4 p-6 sm:px-8">
                <p className="text-ink-2 text-sm">
                    Both themes are shown side by side. The toggle switches the
                    page theme (this bar).
                </p>
                <ThemeToggle />
            </div>
            <div className="flex flex-col lg:flex-row">
                <TokenSheet theme="light" />
                <TokenSheet theme="dark" />
            </div>
        </main>
    );
}

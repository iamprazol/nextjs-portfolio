import type { Metadata } from "next";

import { Button, MonoLabel } from "@/components/ui";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[70vh] max-w-[1040px] flex-col justify-center px-4 py-16 sm:px-6">
            <MonoLabel as="p">Error 404</MonoLabel>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                Route not found
            </h1>

            {/* The terminal is dark in both themes. */}
            <div className="bg-term border-line-2 mt-8 overflow-x-auto rounded-xl border p-5 font-mono text-sm leading-7">
                <p className="text-term-mute">
                    <span aria-hidden="true">$ </span>open this-page
                </p>
                <p className="text-term-ink">404: route not found</p>
                <p className="text-term-mute">
                    <span aria-hidden="true">$ </span>
                    <span className="bg-term-ink inline-block h-4 w-2 translate-y-0.5 motion-safe:animate-pulse" />
                </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/">Home</Button>
                <Button href="/systems" variant="ghost">
                    Systems
                </Button>
                <Button href="/log" variant="ghost">
                    Log
                </Button>
            </div>
        </div>
    );
}

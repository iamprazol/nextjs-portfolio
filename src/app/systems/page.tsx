import { Suspense } from "react";

import { SystemsBrowser, SystemsView } from "@/components/systems/SystemsBrowser";
import { getSystems } from "@/lib/github";

export const revalidate = 3600;

export default async function SystemsPage() {
    // Already ordered: featured order first, then most recently pushed.
    const systems = await getSystems();

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Systems</h1>
            <p className="text-ink-2 mt-3 font-mono text-sm sm:text-base">
                Real products. Real users. Real problems.
            </p>

            {systems.length === 0 ? (
                <p className="text-ink-2 border-line mt-10 border-t pt-8">
                    No systems are published yet.
                </p>
            ) : (
                // useSearchParams needs a Suspense boundary on a static page.
                // The fallback is the same view, unfiltered, so the HTML holds
                // every system and nothing moves when the browser takes over.
                <Suspense fallback={<SystemsView systems={systems} selected={null} />}>
                    <SystemsBrowser systems={systems} />
                </Suspense>
            )}
        </div>
    );
}

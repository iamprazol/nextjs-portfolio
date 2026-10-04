import { Panel } from "@/components/ui";

const bar = "bg-chip rounded-sm";

/**
 * Skeleton in the shape of a page: a heading block and a grid of cards.
 *
 * Use it as a <Suspense fallback> around a slow section. Do not turn it into a
 * route-level loading.tsx: that wraps the whole page in a Suspense boundary,
 * and a notFound() thrown inside one is served with status 200.
 */
export function PageSkeleton() {
    return (
        <div
            role="status"
            aria-busy="true"
            className="mx-auto max-w-[1240px] px-4 py-12 motion-safe:animate-pulse sm:px-6 lg:px-8"
        >
            <span className="sr-only">Loading…</span>
            <div className={`${bar} h-3 w-28`} />
            <div className={`${bar} mt-4 h-10 w-full max-w-md`} />
            <div className={`${bar} mt-4 h-4 w-full max-w-xl`} />

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <Panel key={i}>
                        <div className="flex items-center gap-3">
                            <div className="bg-panel-2 border-line size-11 rounded-lg border" />
                            <div className="flex-1">
                                <div className={`${bar} h-4 w-2/3`} />
                                <div className={`${bar} mt-2 h-3 w-1/3`} />
                            </div>
                        </div>
                        <div className={`${bar} mt-5 h-3 w-full`} />
                        <div className={`${bar} mt-2 h-3 w-5/6`} />
                        <div className="mt-5 flex gap-2">
                            <div className={`${bar} h-5 w-14`} />
                            <div className={`${bar} h-5 w-16`} />
                            <div className={`${bar} h-5 w-12`} />
                        </div>
                    </Panel>
                ))}
            </div>
        </div>
    );
}

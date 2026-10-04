import { Button, MonoLabel } from "@/components/ui";

/**
 * Shown when the data layer fails. There is deliberately no fallback
 * content: the site never substitutes made-up or stale-looking data.
 */
export function ErrorState({ onRetry, digest }: { onRetry: () => void; digest?: string }) {
    return (
        <div
            role="alert"
            className="mx-auto flex min-h-[70vh] max-w-[1040px] flex-col justify-center px-4 py-16 sm:px-6"
        >
            <MonoLabel as="p">Data unavailable</MonoLabel>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                GitHub is not responding
            </h1>
            <p className="text-ink-2 mt-4 max-w-xl text-base sm:text-[17px]">
                Everything on this site is read from GitHub, and that request just failed. Nothing
                is shown in its place.
            </p>
            <div className="mt-8">
                <Button onClick={onRetry} arrow={false}>
                    Try again
                </Button>
            </div>
            {digest && <p className="text-mute mt-6 font-mono text-xs">ref {digest}</p>}
        </div>
    );
}

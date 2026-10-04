import { MonoLabel, Panel, ThemeToggle } from "@/components/ui";

// Placeholder until M04 builds the home page from GitHub data.
export default function Home() {
    return (
        <div className="bg-grid flex min-h-[70vh] items-center justify-center p-4 sm:p-8">
            <Panel padding="lg" className="w-full max-w-xl">
                <MonoLabel as="p">Status — rebuilding</MonoLabel>
                <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight sm:text-5xl">
                    Redesign in progress
                </h1>
                <p className="text-ink-2 mt-4 text-base sm:text-[17px]">
                    This site is being rebuilt. The new pages are on their way.
                </p>
                <div className="mt-8">
                    <ThemeToggle />
                </div>
            </Panel>
        </div>
    );
}

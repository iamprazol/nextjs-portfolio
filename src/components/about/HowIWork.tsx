import { SectionHeader } from "@/components/ui";

/** The profile's working principles as a numbered list. Nothing is rendered without any. */
export function HowIWork({ steps }: { steps: string[] }) {
    if (steps.length === 0) return null;

    return (
        <section aria-labelledby="how-i-work">
            <SectionHeader id="how-i-work" title="How I work" />
            <ol className="border-line mt-6 grid border-t sm:grid-cols-2 sm:gap-x-10">
                {steps.map((step, index) => (
                    <li key={index} className="border-line flex items-baseline gap-4 border-b py-5">
                        <span aria-hidden="true" className="text-link font-mono text-sm">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-lg leading-snug font-medium">{step}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

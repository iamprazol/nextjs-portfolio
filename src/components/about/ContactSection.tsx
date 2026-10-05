import { ArrowUpRight } from "lucide-react";

import { Panel } from "@/components/ui";
import type { ProfileData } from "@/lib/github";

/** Where "Get in touch" lands: the profile's email, or its GitHub when there is none. */
export function ContactSection({ profile }: { profile: ProfileData }) {
    const { email, github } = profile.links;

    return (
        <Panel as="section" id="contact" padding="lg" aria-labelledby="contact-title" className="scroll-mt-24">
            <h2 id="contact-title" className="text-[28px] leading-tight font-semibold tracking-tight">
                Get in touch
            </h2>
            <p className="text-ink-2 mt-3 max-w-[56ch]">
                Questions about a system, a role, or something you are building — write to me.
            </p>
            {email ? (
                <a
                    href={`mailto:${email}`}
                    className="text-link mt-4 inline-flex min-h-11 items-center font-mono text-base break-all hover:underline"
                >
                    {email}
                </a>
            ) : (
                <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link mt-4 inline-flex min-h-11 items-center gap-1 font-mono text-base hover:underline"
                >
                    Find me on GitHub
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
            )}
        </Panel>
    );
}

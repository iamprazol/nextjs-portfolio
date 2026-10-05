import { ArrowUpRight } from "lucide-react";

import { Panel } from "@/components/ui";
import type { ProfileData } from "@/lib/github";

import { ContactForm } from "./ContactForm";

/** Where "Get in touch" lands: the form, beside the profile's direct links. */
export function ContactSection({ profile }: { profile: ProfileData }) {
    const { email, github, linkedin } = profile.links;
    const link = "text-link inline-flex min-h-11 items-center gap-1 font-mono text-sm hover:underline";

    return (
        <Panel as="section" id="contact" padding="lg" aria-labelledby="contact-title" className="scroll-mt-24">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12">
                <div>
                    <h2 id="contact-title" className="text-[28px] leading-tight font-semibold tracking-tight">
                        Get in touch
                    </h2>
                    <p className="text-ink-2 mt-3 max-w-[44ch]">
                        Questions about a system, a role, or something you are building — write to me.
                    </p>
                    <ul className="mt-4">
                        {email && (
                            <li>
                                <a href={`mailto:${email}`} className={`${link} break-all`}>
                                    {email}
                                </a>
                            </li>
                        )}
                        <li>
                            <a href={github} target="_blank" rel="noreferrer" className={link}>
                                GitHub
                                <ArrowUpRight aria-hidden="true" className="size-4" />
                            </a>
                        </li>
                        {linkedin && (
                            <li>
                                <a href={linkedin} target="_blank" rel="noreferrer" className={link}>
                                    LinkedIn
                                    <ArrowUpRight aria-hidden="true" className="size-4" />
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
                <ContactForm email={email} />
            </div>
        </Panel>
    );
}

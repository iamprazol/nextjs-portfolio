import { ArrowUpRight } from "lucide-react";

import { Button, MonoLabel } from "@/components/ui";
import type { ProfileData } from "@/lib/github";

/** "Hi, I'm <first name> — <headline>", the introduction and the ways to get in touch. */
export function AboutHero({ profile }: { profile: ProfileData }) {
    const first = profile.name.trim().split(/\s+/)[0];
    const { links } = profile;

    const external = [
        { label: "GitHub", href: links.github },
        ...(links.linkedin ? [{ label: "LinkedIn", href: links.linkedin }] : []),
        ...(links.x ? [{ label: "X", href: links.x }] : []),
        ...(links.website ? [{ label: "Website", href: links.website }] : [])
    ];

    return (
        <section aria-labelledby="about-title">
            <MonoLabel as="p">About</MonoLabel>
            <h1
                id="about-title"
                className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl"
            >
                Hi, I&apos;m {first}
                {profile.headline && (
                    <>
                        {" — "}
                        <span className="text-ink-2">{profile.headline}</span>
                    </>
                )}
            </h1>

            {profile.aboutHtml ? (
                <div
                    className="prose prose-lab text-ink-2 mt-6 max-w-[64ch]"
                    dangerouslySetInnerHTML={{ __html: profile.aboutHtml }}
                />
            ) : (
                profile.intro && (
                    <p className="text-ink-2 mt-6 max-w-[64ch] text-base sm:text-[17px] sm:leading-7">
                        {profile.intro}
                    </p>
                )
            )}

            <ul className="mt-8 flex flex-wrap gap-3">
                <li>
                    <Button href="#contact">Get in touch</Button>
                </li>
                {external.map((link) => (
                    <li key={link.label}>
                        <Button
                            href={link.href}
                            variant="ghost"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {link.label}
                            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                        </Button>
                    </li>
                ))}
                {links.email && (
                    <li>
                        <Button href={`mailto:${links.email}`} variant="ghost">
                            Email
                        </Button>
                    </li>
                )}
            </ul>
        </section>
    );
}

import type { Metadata } from "next";

import { AboutAside } from "@/components/about/AboutAside";
import { AboutHero } from "@/components/about/AboutHero";
import { ContactSection } from "@/components/about/ContactSection";
import { HowIWork } from "@/components/about/HowIWork";
import { getInterests, getNow, getProfile, getSystems } from "@/lib/github";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getProfile();
    return {
        title: "About",
        description: profile.intro ?? profile.headline ?? `About ${profile.name}.`
    };
}

export default async function AboutPage() {
    const [profile, now, systems, interests] = await Promise.all([
        getProfile(),
        getNow(),
        getSystems(),
        getInterests()
    ]);

    return (
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
                <AboutHero profile={profile} />
                <AboutAside profile={profile} now={now} systems={systems} interests={interests} />
            </div>

            <div className="mt-16 space-y-16 empty:hidden">
                <HowIWork steps={profile.howIWork} />
            </div>

            <div className="mt-16">
                <ContactSection profile={profile} />
            </div>
        </div>
    );
}

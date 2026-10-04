import type { ProfileData } from "@/lib/github";

export function Hero({ profile }: { profile: ProfileData }) {
    return (
        <section aria-labelledby="hero-name" className="py-6 min-[1100px]:px-6 min-[1100px]:py-10">
            <h1
                id="hero-name"
                className="font-mono text-[clamp(44px,6vw,76px)] leading-[1.02] font-semibold tracking-tight"
            >
                {profile.name}
            </h1>
        </section>
    );
}

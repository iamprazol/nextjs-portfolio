import { getProfile, getSystems } from "@/lib/github";

import { CommandPalette } from "./CommandPalette";

/** Server parent: reads what the palette lists and hands it down as props. */
export async function CommandPaletteLoader() {
    const [systems, profile] = await Promise.all([getSystems(), getProfile()]);

    return (
        <CommandPalette
            systems={systems.map((system) => ({
                slug: system.slug,
                name: system.name,
                description: system.kind ?? system.description
            }))}
            architectureSlug={systems.find((system) => system.hasArchitecture)?.slug ?? null}
            problemsSlug={systems.find((system) => system.problemCount > 0)?.slug ?? null}
            githubUrl={profile.links.github}
            email={profile.links.email}
        />
    );
}

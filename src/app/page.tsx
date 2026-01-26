"use client";

import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode } from "@chakra-ui/react";

import { ContactSection } from "@/components/ContactMe/ContactMe";
import Hero from "@/components/Hero/Hero";
import { OtherProjectsSection } from "@/components/Projects/OtherProjects";
import FeaturedProjects from "@/components/Projects/Projects";
import Skills from "@/components/Skills/Skills";
import WorkExperience from "@/components/WorkExperience/WorkExperience";

export default function Home(): JSX.Element {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <>
            <IconButton
                aria-label="Toggle color mode"
                variant="solid"
                icon={
                    colorMode === "light" ? (
                        <MoonIcon boxSize={8} />
                    ) : (
                        <SunIcon boxSize={8} />
                    )
                }
                onClick={toggleColorMode}
                position="fixed"
                top="50px"
                right="100px"
            />
            <Hero />
            <Skills />
            <FeaturedProjects />
            <OtherProjectsSection />
            <WorkExperience />
            <ContactSection />
        </>
    );
}

"use client";

import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode } from "@chakra-ui/react";

import { ContactSection } from "@/components/ContactMe/ContactMe";
import Hero from "@/components/Hero/Hero";
import { OtherProjectsSection } from "@/components/Projects/OtherProjects";
import FeaturedProjects from "@/components/Projects/Projects";
import Skills from "@/components/Skills/Skills";
import WorkExperience from "@/components/WorkExperience/WorkExperience";

export default function Home() {
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
                position="absolute"
                top="50px"
                right="100px"
                zIndex={"9999"}
                color={colorMode === "light" ? "#be185d" : "linkDefault "}
                border="1px solid"
                borderColor={colorMode === "light" ? "#be185d" : "linkDefault"}
                bgColor={colorMode === "light" ? "#fdf2f8" : undefined}
                padding={"25px 10px"}
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

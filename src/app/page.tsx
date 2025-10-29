"use client";

import { IconButton, useColorMode } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

import Hero from "@/components/Hero/Hero";

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
        </>
    );
}

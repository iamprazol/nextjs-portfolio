"use client";

import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

const MotionBox = motion(Box);

export default function Home() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <VStack
            minH="100vh"
            justify="center"
            align="center"
            className="hero-section"
            color="white"
            spacing={6}
        >
            <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
            />
            <MotionBox
                textAlign="center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Heading fontSize="5xl" mb={4}>
                    Prajjwal Poudel
                </Heading>
                <Text fontSize="xl" mb={6}>
                    Full-Stack Developer | WordPress Expert | React Enthusiast
                </Text>
            </MotionBox>
        </VStack>
    );
}

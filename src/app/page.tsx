"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    IconButton,
    useColorMode,
    VStack,
    Button,
    HStack,
    Icon
} from "@chakra-ui/react";
import { color, motion } from "framer-motion";
import {
    SunIcon,
    MoonIcon,
    ArrowForwardIcon,
    ArrowDownIcon
} from "@chakra-ui/icons";

const MotionBox = motion(Box);

export default function Home() {
    const { colorMode, toggleColorMode } = useColorMode();
    const [isHovered, setIsHovered] = useState(false);

    const [index, setIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const meta = {
        name: "Prajjwal Poudel",
        description: [
            "Full Stack Developer ",
            "WordPress Expert",
            "React Enthusiast"
        ]
    };

    useEffect(() => {
        const currentWord = meta.description[index];
        let timeout;

        if (!isDeleting && displayedText.length < currentWord.length) {
            timeout = setTimeout(() => {
                setDisplayedText(
                    currentWord.slice(0, displayedText.length + 1)
                );
            }, 100);
        } else if (isDeleting && displayedText.length > 0) {
            timeout = setTimeout(() => {
                setDisplayedText(
                    currentWord.slice(0, displayedText.length - 1)
                );
            }, 100);
        } else if (!isDeleting && displayedText.length === currentWord.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && displayedText.length === 0) {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % meta.description.length);
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, index]);

    return (
        <VStack
            minH="100vh"
            justify="center"
            align="center"
            className="hero-section"
            color="white"
            spacing={6}
            bgColor="background"
            position={"relative"}
        >
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
                __css={{
                    position: "fixed",
                    top: "50px",
                    right: "100px"
                }}
            />
            <MotionBox
                textAlign="center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                width={"60%"}
            >
                <Box position={"relative"} marginBottom={"40px"}>
                    <Box
                        bgGradient="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                        opacity={0.75}
                        position={"absolute"}
                        width={"100%"}
                        height={"100%"}
                        filter="blur(24px) brightness(1.2) contrast(1.1) grayscale(0.3) hue-rotate(15deg) invert(0) saturate(1.2) sepia(0.1) drop-shadow(0 0 5px rgba(0,0,0,0.5))"
                    ></Box>
                    <Heading
                        mb={4}
                        fontSize={{ base: "50px", md: "75px", lg: "100px" }}
                        position={"relative"}
                    >
                        {meta.name}
                    </Heading>
                </Box>
                <VStack>
                    <VStack gap="24px">
                        <HStack>
                            <Text
                                fontSize="40px"
                                mb={6}
                                backgroundImage="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                                fontWeight={800}
                                margin={"0"}
                                color={"#0000"}
                                backgroundClip={"text"}
                            >
                                {displayedText.split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{
                                            opacity: 0,
                                            y: 20,
                                            scale: 0.8
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            y: -20,
                                            scale: 0.5
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            delay: i * 0.05
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                <motion.span
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{
                                        duration: 0.2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    |
                                </motion.span>
                            </Text>
                        </HStack>
                        <Text
                            fontSize="20px"
                            mb={6}
                            color={"#9ca3af"}
                            margin={"0"}
                        >
                            Transforming complex ideas, driven by curiosity,
                            into elegance defined by code.
                        </Text>
                        <HStack>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                _hover={{
                                    border: "1px solid teal"
                                }}
                            >
                                PHP
                            </Button>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                _hover={{
                                    border: "1px solid teal"
                                }}
                            >
                                WordPress
                            </Button>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                _hover={{
                                    border: "1px solid teal"
                                }}
                            >
                                Laravel
                            </Button>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                _hover={{
                                    border: "1px solid teal"
                                }}
                            >
                                JS
                            </Button>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                _hover={{
                                    border: "1px solid teal"
                                }}
                            >
                                React
                            </Button>
                        </HStack>
                        <HStack>
                            <Box
                                position={"relative"}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                _hover={{ opacity: 1 }}
                            >
                                <Box
                                    bgGradient="linear(to-r, #3b82f6, #ec4899, #a855f7)"
                                    opacity={isHovered ? 1 : 0.7}
                                    position={"absolute"}
                                    width={"104%"}
                                    height={"110%"}
                                    borderRadius={"9999px"}
                                    top="-2px"
                                    right="-3px"
                                    filter="blur(8px) brightness(0.8) contrast(1.2) grayscale(0.3) hue-rotate(36deg) invert(0) saturate(1.2) sepia(0.1) drop-shadow(0 0 5px rgba(0,0,0,0.5))"
                                ></Box>
                                <Button
                                    opacity={1}
                                    color="#d1d5db"
                                    variant="outline"
                                    borderRadius={"9999px"}
                                    bgColor={"#1a1f2b"}
                                    fontWeight={"500"}
                                    border={"0.5px solid #2d333b"}
                                    fontSize={"14px"}
                                    _hover={{
                                        gap: "2px"
                                    }}
                                    size={"lg"}
                                    rightIcon={<ArrowForwardIcon />}
                                >
                                    View My Work
                                </Button>
                            </Box>
                            <Button
                                color="#d1d5db"
                                variant="outline"
                                borderRadius={"9999px"}
                                bgColor={"#1a1f2b"}
                                fontWeight={"500"}
                                border={"0.5px solid #2d333b"}
                                fontSize={"14px"}
                                size={"lg"}
                            >
                                Get In Touch
                            </Button>
                        </HStack>
                    </VStack>
                </VStack>
            </MotionBox>
            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, -15, 15, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                opacity={"0.5"}
                width={"60%"}
                position={"absolute"}
                bottom={"100px"}
                left={"0px"}
            >
                <Text fontSize={"40px"}>⚛️</Text>
            </MotionBox>
            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, -15, 15, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                opacity={"0.5"}
                width={"60%"}
                position={"absolute"}
                top={"210px"}
                right={"-200px"}
            >
                <Text fontSize={"40px"}>🚀</Text>
            </MotionBox>
            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 15, -15, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                opacity={"0.5"}
                width={"60%"}
                position={"absolute"}
                bottom={"250px"}
                right={"0px"}
            >
                <Text fontSize={"40px"}>💻</Text>
            </MotionBox>

            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, -15, 15, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                opacity={"0.5"}
                width={"60%"}
                position={"absolute"}
                bottom={"150px"}
                right={"-150px"}
            >
                <Text fontSize={"40px"}>💡</Text>
            </MotionBox>
            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 15, -15, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                opacity={"0.5"}
                width={"60%"}
                position={"absolute"}
                top={"100px"}
                left={"0px"}
            >
                <Text fontSize={"40px"}>🐘</Text>
            </MotionBox>
            <MotionBox
                textAlign="center"
                animate={{
                    y: [0, -20, 0]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                width={"60%"}
                position={"absolute"}
                bottom={"10px"}
            >
                <VStack color={"#9ca3af"}>
                    <Text>Scroll to explore</Text>
                    <ArrowDownIcon boxSize={8} />
                </VStack>
            </MotionBox>
        </VStack>
    );
}

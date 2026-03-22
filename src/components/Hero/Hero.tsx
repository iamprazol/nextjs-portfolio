"use client";

import FloatingIcon from "@/components/Hero/FloatingIcon";
import SkillBadge from "@/components/Hero/SkillBadge";
import { ArrowDownIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Heading,
    HStack,
    Text,
    useColorMode,
    VStack
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import NextLink from "next/link"

// Types
interface FloatingIconProps {
    emoji: string;
    placement: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
}

const MotionBox = motion(Box);

const Hero = () => {
    const { colorMode } = useColorMode();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [index, setIndex] = useState<number>(0);
    const [displayedText, setDisplayedText] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const meta = {
        name: "Prajjwal Poudel",
        description: [
            "Full Stack Developer",
            "WordPress Expert",
            "React Enthusiast"
        ]
    };

    const skills: string[] = ["PHP", "WordPress", "Laravel", "JS", "React"];
    const floatingIcons: FloatingIconProps[] = [
        { emoji: "⚛️", placement: { bottom: "100px", left: "0px" } },
        { emoji: "🚀", placement: { top: "210px", right: "-200px" } },
        { emoji: "💻", placement: { bottom: "250px", right: "0px" } },
        { emoji: "💡", placement: { bottom: "150px", right: "-150px" } },
        { emoji: "🐘", placement: { top: "100px", left: "0px" } }
    ];

    useEffect(() => {
        const currentWord = meta.description[index];
        let timeout: NodeJS.Timeout;

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
    }, [displayedText, isDeleting, index, meta.description]);

    return (
        <VStack
            minH="100vh"
            justify="center"
            align="center"
            className="hero-section"
            color="white"
            spacing={6}
            bg={colorMode === "light" ? "bgGradientMain" : "background"}
            position="relative"
        >
            <div className="hero-section-bg"></div>

            {/* Hero Text */}
            <MotionBox
                textAlign="center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                width="60%"
            >
                <Box
                    position="relative"
                    mb="40px"
                    display={"flex"}
                    justifyContent={"center"}
                >
                    {colorMode !== "light" && (
                        <Box
                            bgGradient="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                            opacity={0.75}
                            position="absolute"
                            w="100%"
                            h="100%"
                            filter="blur(24px) brightness(1.2) contrast(1.1)"
                        />
                    )}
                    <Heading
                        mb={4}
                        fontSize={{ base: "40px", md: "75px", lg: "100px" }}
                        position="relative"
                        color={"primaryText"}
                        background={
                            colorMode === "light" ? "accentGradient" : ""
                        }
                        backgroundClip={colorMode === "light" ? "text" : ""}
                    >
                        {meta.name}
                    </Heading>
                </Box>

                <VStack spacing={6}>
                    <HStack>
                        <Text
                            fontSize={{ base: "20px", md: "30px", lg: "40px" }}
                            mb={6}
                            bgGradient="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                            fontWeight={800}
                            bgClip="text"
                            color="transparent"
                        >
                            {displayedText.split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.5 }}
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
                        fontSize={{ base: "16px", md: "20px", lg: "24px" }}
                        mb={6}
                        color="primaryText"
                    >
                        Transforming complex ideas, driven by curiosity, into
                        elegance defined by code.
                    </Text>

                    {/* Skill Badges */}
                    <HStack flexWrap="wrap" justify="center">
                        {skills.map((skill) => (
                            <SkillBadge key={skill} label={skill} />
                        ))}
                    </HStack>

                    {/* Buttons */}
                    <HStack flexWrap="wrap" justify="center" zIndex={1}>
                        <Box
                            position="relative"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <Box
                                bgGradient="linear(to-r, #3b82f6, #ec4899, #a855f7)"
                                opacity={isHovered ? 1 : 0.7}
                                position="absolute"
                                w="104%"
                                h="110%"
                                borderRadius="9999px"
                                top="-2px"
                                right="-3px"
                                filter="blur(3px)"
                            />
                            <Button
                                color="buttonPrimaryText"
                                variant="outline"
                                borderRadius="9999px"
                                bgColor={
                                    colorMode === "light"
                                        ? "white"
                                        : "buttonPrimaryGradient"
                                }
                                fontWeight="700"
                                border={
                                    colorMode === "light"
                                        ? "none"
                                        : "0.5px solid"
                                }
                                fontSize="16px"
                                size="lg"
                                rightIcon={<ArrowForwardIcon />}
                            >
                                <NextLink href="#projects">
									View My Work
								</NextLink>
                            </Button>
                        </Box>

                        <Button
                            color="buttonSecondaryText"
                            variant="outline"
                            borderRadius="9999px"
                            bgColor="buttonSecondaryBg"
                            fontWeight="500"
                            border="0.5px solid #2d333b"
                            fontSize="14px"
                            size="lg"
                            _hover={{
                                bgColor: "buttonSecondaryHoverBg",
                                color: "buttonSecondaryHoverText"
                            }}
                        >
							<NextLink href="#contact">
                            	Get In Touch
							</NextLink>
                        </Button>
                    </HStack>
                </VStack>
            </MotionBox>

            {/* Floating Emojis */}
            {floatingIcons.map((icon, i) => (
                <FloatingIcon key={i} {...icon} />
            ))}

            {/* Scroll Indicator */}
            <MotionBox
                textAlign="center"
                animate={{ y: [0, -20, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                position="absolute"
                bottom="10px"
            >
                <VStack color="secondaryText">
                    <Text fontSize={{ base: "12px", md: "14px", lg: "16px" }}>
                        Scroll to explore
                    </Text>
                    <ArrowDownIcon boxSize={{ base: 4, md: 6, lg: 8 }} />
                </VStack>
            </MotionBox>
        </VStack>
    );
};

export default Hero;

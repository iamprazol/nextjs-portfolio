import React from "react";

import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    VStack,
    Image,
    Flex,
    HStack,
    Circle,
    Divider,
    useColorModeValue,
    Tag
} from "@chakra-ui/react";

import { Code } from "@chakra-ui/icons";
import { motion, MotionProps } from "framer-motion";
const MotionBox = motion(Box);

const WorkExperience = () => {
    const experience = [
        {
            title: "Senior WordPress Plugin Developer (Team Lead)",
            company: "ThemeGrill Pvt. Ltd.",
            location: "Nepal",
            bullets: [
                "Led User Registration & Membership plugin development, doubling active installs from 30k to 60k.",
                "Recovered Everest Forms plugin (100k → 180k installs) through targeted improvements.",
                "Managed and mentored a team of 10+ developers, ensuring timely delivery and code quality.",
                "Resolved advanced support/debug issues using WP-CLI and browser dev tools.",
                "Conducted competitor analysis and feature planning based on user feedback.",
                "Refactored large parts of the plugin for performance and long-term maintainability.",
                "Worked with GitHub Actions (SVN Uploader, Repo Cloner, selective deployment workflows).",
                "Developed multiple major features: Frontend Listing, Customized My Account, Repeater Fields, Email Templates, Profile Completeness & more."
            ],
            date: "Nov 2019 – Present"
        },

        {
            title: "Senior WordPress Plugin Developer",
            company: "Turbo Subdomains",
            location: "Remote (Texas, USA)",
            bullets: [
                "Developed a custom plugin with 5k+ downloads in 6 months.",
                "Integrated AI services like OpenAI, Article Forge, and WordAI for automated content creation.",
                "Implemented APIs such as Pixabay, Unsplash, and YouTube for fetching images and videos.",
                "Used Cron Jobs and Redis Cache for scheduled, high-performance article generation.",
                "Fetched articles from RSS Feeds and NewsAPI for automated news/article creation.",
                "Added keyword replacement and backlink automation features for improved SEO."
            ],
            date: "Dec 2022 – Feb 2024"
        },

        {
            title: "Web Developer",
            company: "Infomax Pvt. Ltd.",
            location: "Nepal",
            bullets: [
                "Developed Laravel-based web applications and REST APIs for mobile apps.",
                "Implemented JWT/OAuth authentication and middleware security.",
                "Strengthened API security with CSRF protection and SQL injection prevention.",
                "Collaborated using Git and reported tasks using Jira/Trello."
            ],
            date: "Feb 2018 – Feb 2019"
        }
    ];

    return (
        <Box id="work" py={24} px={6}>
            <Box maxW="6xl" mx="auto" textAlign="center" mb={12}>
                <Heading>
                    Work{" "}
                    <Text as="span" color={"cyan.500"}>
                        Experience
                    </Text>
                </Heading>
            </Box>
            <Flex maxW="7xl" mx="auto" justify="center" py={10}>
                <Box position="relative" w="90%" maxW="1200px">
                    <Box
                        position="absolute"
                        top={0}
                        left="20px"
                        width="3px"
                        height="100%"
                        bg="cyan.400"
                    />

                    <VStack align="stretch" spacing={10}>
                        {experience.map((item, index) => (
                            <Flex
                                key={index}
                                align="flex-start"
                                position="relative"
                            >
                                <Circle
                                    size="14px"
                                    bg="cyan.400"
                                    border="3px solid #222"
                                    position="absolute"
                                    left="13px"
                                    top="6px"
                                    zIndex={2}
                                />

                                <Box
                                    bg={"cardBg"}
                                    borderRadius="lg"
                                    p={6}
                                    ml="50px"
                                    w="100%"
                                    boxShadow="lg"
                                    border="1px solid #222"
                                >
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                    >
                                        <Box>
                                            <Text
                                                fontWeight="bold"
                                                fontSize="lg"
                                            >
                                                {item.title}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                color="tertiaryText"
                                                fontWeight={"500"}
                                            >
                                                {item.company}, {item.location}
                                            </Text>
                                        </Box>

                                        <Tag
                                            size="sm"
                                            variant="outline"
                                            borderColor="linkDefault"
                                            color="tertiaryText"
                                            fontWeight={"500"}
                                        >
                                            {item.date}
                                        </Tag>
                                    </Flex>

                                    <VStack align="start" spacing={2} mt={4}>
                                        {item.bullets.map((point, i) => (
                                            <HStack
                                                key={i}
                                                align="start"
                                                spacing={2}
                                            >
                                                <Box
                                                    w="6px"
                                                    h="6px"
                                                    bg="cyan.400"
                                                    borderRadius="full"
                                                    mt="8px"
                                                />
                                                <Text fontSize="sm">
                                                    {point}
                                                </Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </Box>
                            </Flex>
                        ))}
                    </VStack>
                </Box>
            </Flex>
        </Box>
    );
};

export default WorkExperience;

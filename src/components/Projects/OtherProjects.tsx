// OtherProjectsSection.tsx
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Heading,
    HStack,
    Icon,
    Image,
    Link,
    ListItem,
    SimpleGrid,
    Stack,
    Tag,
    Text,
    UnorderedList,
    useColorMode
} from "@chakra-ui/react";
import React from "react";
type Project = {
    name: string;
    period?: string;
    projectType?: string;
    description: string;
    points: string[];
    techStack: string[];
    codeUrl?: string;
    liveUrl?: string;
};

const projects: Project[] = [
    {
        name: "WPMake Site",
        period: "2024",
        liveUrl: "https://www.wpmake.net/",
        description:
            "Created a site using WordPress for hosting self created WordPress Plugin Showcase.",
        points: [
            "Showcase for self created and hosted WordPress plugins",
            "Modern and sleek design"
        ],
        techStack: ["PHP", "jQuery", "React", "HTML", "CSS", "WordPress"]
    },
    {
        name: "Kuwa",
        period: "2022",
        codeUrl: "https://github.com/iamprazol/kuwa",
        description:
            "Inventory management system to track water jar vendors in the Kathmandu Valley.",
        points: [
            "Add, edit, delete and request water jars",
            "Vendor and jar tracking system"
        ],
        techStack: ["PHP", "Laravel", "MySQL"]
    },
    {
        name: "Tourist Information Management System",
        period: "2019",
        codeUrl: "https://github.com/iamprazol/TIS",
        description:
            "Web app to keep track of tourist information entering the Pokhara valley.",
        points: [
            "Track tourist arrivals and departures",
            "Secure data management"
        ],
        techStack: ["PHP", "Laravel", "HTML", "CSS", "MySQL"]
    },
    {
        name: "Monkeee API",
        period: "2018",
        codeUrl: "https://github.com/iamprazol/monkeee-api",
        description:
            "Laravel APIs for a mobile app to add and list upcoming event details in Australia.",
        points: ["Event listing API", "Built secure and scalable endpoints"],
        techStack: ["PHP", "Laravel", "MySQL"]
    }
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <Box
            position="relative"
            bg={"cardBg"}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={"cardBorder"}
            p={6}
            overflow="hidden"
            _hover={{
                borderColor: "purple.400",
                transform: "translateY(-4px)"
            }}
            transition="all 0.2s ease-out"
        >
            {/* floating gradient circle */}
            <Box
                position="absolute"
                top={-6}
                right={-6}
                w={16}
                h={16}
                borderRadius="full"
                bgGradient="linear(to-br, purple.400, cyan.400)"
                opacity={0.3}
                filter="blur(4px)"
            />

            <Stack spacing={4} position="relative">
                <HStack justify="space-between" align="flex-start">
                    <Box>
                        <Heading size="md">{project.name}</Heading>
                        {project.period && (
                            <Text fontSize="sm" mt={1}>
                                {project.period}
                            </Text>
                        )}
                    </Box>
                </HStack>

                <Text fontSize="sm">{project.description}</Text>

                {project.points && (
                    <UnorderedList spacing={1} pl={5}>
                        {project.points.map((point, index) => (
                            <ListItem key={index} fontSize="sm">
                                {point}
                            </ListItem>
                        ))}
                    </UnorderedList>
                )}

                {/* Tech stack tags */}
                <HStack spacing={2} flexWrap="wrap">
                    {project.techStack.map((tech) => (
                        <Tag
                            key={tech}
                            size="sm"
                            borderRadius="full"
                            bg="badgeBg"
                            color={"badgeText"}
                        >
                            {tech}
                        </Tag>
                    ))}
                </HStack>

                {/* Footer buttons */}
                <HStack spacing={3} pt={2}>
                    {project.codeUrl && (
                        <Link
                            href={project.codeUrl}
                            isExternal
                            _hover={{ textDecor: "none" }}
                        >
                            <Button
                                size="sm"
                                leftIcon={
                                    <Image
                                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                                        alt={" Github Icon"}
                                        boxSize={{
                                            base: "16px"
                                        }}
                                        background={"white"}
                                        borderRadius={"60%"}
                                    />
                                }
                                variant="outline"
                                borderColor="cardBorder"
                                bgColor={"badgeBg"}
                                _hover={{
                                    bg: "whiteAlpha.100",
                                    borderColor: "purple.300"
                                }}
                            >
                                View Code
                            </Button>
                        </Link>
                    )}

                    {project.liveUrl && (
                        <Link
                            href={project.liveUrl}
                            isExternal
                            _hover={{ textDecor: "none" }}
                        >
                            <Button
                                size="sm"
                                leftIcon={<Icon as={ExternalLinkIcon} />}
                                bg="purple.500"
                                color="white"
                                _hover={{ bg: "purple.400" }}
                            >
                                Live Demo
                            </Button>
                        </Link>
                    )}
                </HStack>
            </Stack>
        </Box>
    );
};

export const OtherProjectsSection: React.FC = () => {
    const { colorMode } = useColorMode();

    return (
        <Box as="section" py={16} px={{ base: 4, md: 8 }}>
            <Box maxW="6xl" mx="auto">
                <Box maxW="6xl" mx="auto" textAlign="center" mb={12}>
                    <Heading>
                        <Text
                            as="span"
                            color={
                                colorMode === "light" ? "#be185d" : "cyan.500"
                            }
                        >
                            Other{" "}
                        </Text>
                        Projects
                    </Heading>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    {projects.map((project) => (
                        <ProjectCard key={project.name} project={project} />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
};

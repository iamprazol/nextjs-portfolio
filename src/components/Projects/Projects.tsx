import { CheckCircleIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Image,
    List,
    ListIcon,
    ListItem,
    Text,
    useColorMode,
    VStack
} from "@chakra-ui/react";

interface Project {
    title: string;
    description: string;
    image: string;
    icon: string;
    technicalPoints: string[];
    projectOverview: {
        overviewPoints?: string[];
        links: {
            github?: string[];
            download?: string;
            liveDemo?: string;
        };
    };
    background?: string;
}

const projects: Project[] = [
    {
        title: "Advanced User Avatar",
        description:
            "WordPress plugin allowing users to upload or capture profile photos with built-in cropping.",
        image: "/images/advanced-user-avatar.png",
        icon: "/icons/advanced-user-avatar.png",
        technicalPoints: [
            "Webcam capture + cropping using JS libraries",
            "Custom WP Media Handling & REST APIs",
            "Plugin on WordPress.org"
        ],
        projectOverview: {
            overviewPoints: [
                "3+ 5 Star Rating",
                "100+ Active Installations",
                "Regular updates"
            ],
            links: {
                download:
                    "https://wordpress.org/plugins/wpmake-advance-user-avatar/",
                liveDemo: "https://www.wpmake.net/advance-user-avatar/"
            }
        },
        background: "linear(135deg,rgba(246,76,127,.078),rgba(246,76,127,.078))"
    },
    {
        title: "Food Ordering System (Full-Stack)",
        description:
            "Real-world prototype with real-time ordering, restaurant dashboards, API-driven backend, and fully responsive UI.",
        image: "/images/Foodie.png",
        icon: "/icons/Foodie.png",
        technicalPoints: [
            "Laravel API (auth, menus, orders, permissions)",
            "React frontend with state management & live UI updates",
            "Responsive customer + restaurant dashboard",
            "MySQL database with relational models"
        ],
        projectOverview: {
            links: {
                liveDemo: "http://foodie.wpmake.net"
            }
        },
        background: "linear(135deg,rgba(24,212,253,.078),rgba(0,64,227,.078))"
    },
    {
        title: "Timed Content Locker",
        description:
            "A WordPress plugin that locks content for a specific duration based on admin-defined rules.",
        image: "https://via.placeholder.com/400x260?text=Timed+Content+Locker",
        icon: "https://via.placeholder.com/400x260?text=Timed+Content+Locker",
        technicalPoints: [
            "PHP + jQuery based WordPress plugin",
            "Custom WordPress hooks & access-control logic",
            "Plugin available on WordPress.org"
        ],
        projectOverview: {
            overviewPoints: ["10+ Active Installations", "Regular updates"],
            links: {
                download: "https://wordpress.org/plugins/content-time-lock/",
                liveDemo: "https://www.wpmake.net/timed-content-locker/"
            }
        },
        background: "linear( 135deg,rgba(52,224,116,.078),rgba(11,142,65,.078))"
    }
];

export default function FeaturedProjects() {
    const { colorMode } = useColorMode();

    return (
        <Box w="100%" py={24} px={6}>
            <Box maxW="6xl" mx="auto" textAlign="center" mb={12}>
                <Heading>
                    Featured{" "}
                    <Text
                        as="span"
                        color={colorMode === "light" ? "#be185d" : "cyan.500"}
                    >
                        Projects
                    </Text>
                </Heading>
            </Box>

            <VStack spacing={10} w="100%">
                {projects.map((project, index) => (
                    <Flex
                        key={index}
                        bg="cardBg"
                        borderRadius="lg"
                        w="100%"
                        maxW="1200px"
                        justify="space-between"
                        align="center"
                        gap={8}
                        boxShadow="lg"
                        p={8}
                        border={"1px solid"}
                        borderColor={"cardBorder"}
                        flexDir={{ base: "column", lg: "row" }}
                    >
                        <Box
                            overflow="hidden"
                            borderRadius="lg"
                            position="relative"
                            w="360px"
                            maxW={"100%"}
                            maxH="14.75rem"
                        >
                            <Image
                                src={project.icon}
                                alt={project.title}
                                w="16%"
                                h="auto"
                                objectFit="cover"
                                position={"absolute"}
                                bottom={0}
                            />
                            <Box
                                aspectRatio={1.618 / 1}
                                display="flex"
                                justifyContent="center"
                                sx={{
                                    WebkitMaskImage:
                                        "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 382 236%27%3E%3Cpath d=%27M382 224c0 6.627-5.373 12-12 12H85.518c-10.529 0-17.561-14.446-16.669-24.937q.15-1.762.151-3.563c0-22.92-18.58-41.5-41.5-41.5a42 42 0 0 0-3.407.138C13.783 166.976 0 160.111 0 149.767V12C0 5.373 5.373 0 12 0h358c6.627 0 12 5.373 12 12z%27/%3E%3C/svg%3E')",
                                    WebkitMaskPosition: "center",
                                    WebkitMaskRepeat: "no-repeat",
                                    WebkitMaskSize: "cover"
                                }}
                                maxH="14.75rem"
                                maxW="100%"
                                bgGradient={project.background}
                                p={4}
                            >
                                <Box
                                    w="100%"
                                    overflow="hidden"
                                    borderRadius="lg"
                                >
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        w="100%"
                                        h="100%"
                                        objectFit="cover"
                                    />
                                </Box>
                            </Box>
                        </Box>
                        <Box
                            flex={"60%"}
                            gap={2}
                            display={"flex"}
                            flexDirection={"column"}
                        >
                            <Heading fontSize="24px">{project.title}</Heading>
                            <Text fontWeight={"400"} mt={2}>
                                {project.description}
                            </Text>
                            <List spacing={2} mt={2} fontSize={"15px"}>
                                {project.technicalPoints.map(
                                    (point, pointIndex) => (
                                        <ListItem
                                            key={pointIndex}
                                            fontSize={"15px"}
                                            fontWeight={"500"}
                                        >
                                            <ListIcon
                                                as={CheckCircleIcon}
                                                color="green.400"
                                            />
                                            {point}
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </Box>
                        <Box
                            flex="30%"
                            width={{ base: "80%", xl: "30%" }}
                            gap={4}
                            display="flex"
                            flexDirection="column"
                            px={"30px"}
                            py={"20px"}
                            borderRadius={"15px"}
                            bgGradient={project.background}
                            textAlign={"center"}
                        >
                            <Heading size="md">Project Overview</Heading>
                            <Divider
                                border={"1px solid"}
                                borderColor={
                                    colorMode === "light"
                                        ? "#0701261a"
                                        : "white"
                                }
                            />
                            {project.projectOverview.overviewPoints && (
                                <List spacing={2}>
                                    {project.projectOverview.overviewPoints.map(
                                        (point, pointIndex) => (
                                            <ListItem key={pointIndex}>
                                                <ListIcon
                                                    as={CheckCircleIcon}
                                                    color="green.400"
                                                />
                                                {point}
                                            </ListItem>
                                        )
                                    )}
                                </List>
                            )}
                            {project.projectOverview.links.github &&
                                project.projectOverview.links.github.map(
                                    (link, linkIndex) => (
                                        <Button
                                            key={linkIndex}
                                            as="a"
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            colorScheme="teal"
                                            variant="outline"
                                        >
                                            Github
                                        </Button>
                                    )
                                )}

                            {project.title ===
                                "Food Ordering System (Full-Stack)" && (
                                <Button
                                    as="a"
                                    href={
                                        "https://github.com/iamprazol/Food-Ordering-System-Api/"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    borderColor={"#22c3b6"}
                                    color={
                                        colorMode === "dark"
                                            ? "#22c3b6"
                                            : "white"
                                    }
                                    background={
                                        colorMode === "light" && "#22c3b6"
                                    }
                                    variant={colorMode === "dark" && "outline"}
                                >
                                    Backend
                                </Button>
                            )}
                            {project.title ===
                                "Food Ordering System (Full-Stack)" && (
                                <Button
                                    as="a"
                                    href={
                                        "https://github.com/iamprazol/react-food-ordering-website"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    borderColor="#ec3333"
                                    color={
                                        colorMode === "dark"
                                            ? "#ec3333"
                                            : "white"
                                    }
                                    background={
                                        colorMode === "light" && "#ec3333"
                                    }
                                    variant={colorMode === "dark" && "outline"}
                                >
                                    Frontend
                                </Button>
                            )}
                            {project.projectOverview.links.download && (
                                <Button
                                    as="a"
                                    href={
                                        project.projectOverview.links.download
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    borderColor="#146ef5"
                                    color={
                                        colorMode === "dark"
                                            ? "#146ef5"
                                            : "white"
                                    }
                                    background={
                                        colorMode === "light" && "#146ef5"
                                    }
                                    variant={colorMode === "dark" && "outline"}
                                >
                                    Download
                                </Button>
                            )}
                            {project.projectOverview.links.liveDemo && (
                                <Button
                                    as="a"
                                    href={
                                        project.projectOverview.links.liveDemo
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color={
                                        colorMode === "dark"
                                            ? "#ff7a00"
                                            : "white"
                                    }
                                    background={
                                        colorMode === "light" && "#ff7a00"
                                    }
                                    borderColor="#ff7a00"
                                    variant={colorMode === "dark" && "outline"}
                                >
                                    Live Demo
                                </Button>
                            )}
                        </Box>
                    </Flex>
                ))}
            </VStack>
        </Box>
    );
}

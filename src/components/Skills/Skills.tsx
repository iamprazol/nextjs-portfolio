import {
    Box,
    Heading,
    Image,
    SimpleGrid,
    Text,
    VStack,
    useColorMode
} from "@chakra-ui/react";
import { motion } from "framer-motion";
const MotionBox = motion(Box);

const Skills = () => {
    const { colorMode } = useColorMode();

    const skills = {
        "Programming Languages": [
            {
                skill: "PHP",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
            },
            {
                skill: "JavaScript",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            },
            {
                skill: "SQL",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
            }
        ],
        "Backend Technologies": [
            {
                skill: "WordPress",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg"
            },
            {
                skill: "Laravel",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg"
            },
            {
                skill: "REST API",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
            },
            {
                skill: "Redis",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg"
            },
            {
                skill: "Firebase",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg"
            },
            {
                skill: "React",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
            }
        ],
        "Frontend Technologies": [
            {
                skill: "HTML",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
            },
            {
                skill: "CSS",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
            },
            {
                skill: "SCSS",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg"
            },
            {
                skill: "JQuery",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg"
            },
            {
                skill: "React",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
            }
        ],
        "Developer Tools": [
            {
                skill: "Git",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
            },
            {
                skill: "GitHub",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            },
            {
                skill: "GitLab",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg"
            },
            {
                skill: "VSCode",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
            },
            {
                skill: "PHPStorm",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/phpstorm/phpstorm-original.svg"
            },
            {
                skill: "Jira",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg"
            },
            {
                skill: "Linux",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg"
            }
        ]
    };

    return (
        <Box id="skills" py={24} px={6}>
            <Box maxW="6xl" mx="auto" textAlign="center" mb={12}>
                <Heading>
                    <Text
                        as="span"
                        color={colorMode === "light" ? "#be185d" : "cyan.500"}
                    >
                        Technical
                    </Text>{" "}
                    Skills
                </Heading>
            </Box>
            <SimpleGrid
                columns={{ base: 1, sm: 2 }}
                spacing={6}
                maxW="6xl"
                mx="auto"
            >
                {Object.entries(skills).map(([category, items]) => (
                    <Box
                        key={category}
                        bg={"gray.800"}
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        rounded="lg"
                        p={6}
                        _hover={{
                            borderColor:
                                colorMode === "light"
                                    ? "1px solid #be185d"
                                    : "1px solid teal"
                        }}
                        transition="0.2s"
                        bgColor={"bgSecondary"}
                    >
                        <VStack mb={4} alignItems={"flex-start"}>
                            <Text
                                fontSize={{
                                    base: "14px",
                                    md: "16px",
                                    lg: "18px"
                                }}
                                bgGradient="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                                fontWeight={500}
                                bgClip="text"
                                color="transparent"
                            >
                                {category}
                            </Text>
                            <Box
                                bgGradient="linear(to-r, #3b82f6, #a855f7, #ec4899)"
                                width={"100%"}
                                height={"2px"}
                            ></Box>
                        </VStack>
                        <SimpleGrid
                            columns={{
                                base: 3,
                                md: 4,
                                lg: 5
                            }}
                            spacing={6}
                            maxW="6xl"
                            mx="auto"
                            justifyContent={"left"}
                        >
                            {items.map((skill) => (
                                <Box
                                    key={skill.skill}
                                    position="relative"
                                    mb="40px"
                                    display={"flex"}
                                >
                                    <MotionBox
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        w="100%"
                                        h="100%"
                                        bgGradient={
                                            "linear-gradient(to right, hsl(175 70% 45%) , #a855f7)"
                                        }
                                        filter="blur(24px) brightness(1.2) contrast(1.1)"
                                        animate={{
                                            x: [0, 20, 40, 20, 0],
                                            opacity: [0.05, 0.15, 0.05]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <MotionBox
                                        textAlign="center"
                                        display="inline-block"
                                        cursor="pointer"
                                        position="relative"
                                        zIndex={2}
                                        whileHover={{
                                            scale: 1.15,
                                            transition: {
                                                duration: 0.3,
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <Box
                                            bg="cardBg"
                                            border="1px solid"
                                            borderColor={
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "linkDefault"
                                            }
                                            px={3}
                                            py={1}
                                            rounded="md"
                                            fontSize="sm"
                                            boxSize={{
                                                base: "48px",
                                                md: "58px"
                                            }}
                                            _hover={{
                                                borderColor: "linkHover"
                                            }}
                                        >
                                            <MotionBox
                                                textAlign="center"
                                                display="inline-block"
                                                cursor="pointer"
                                                position="relative"
                                                zIndex={2}
                                                whileHover={{
                                                    rotate: [
                                                        0, -10, 10, -5, 5, 0,
                                                        360
                                                    ],
                                                    transition: {
                                                        duration: 1.5,
                                                        times: [
                                                            0, 0.1, 0.2, 0.3,
                                                            0.4, 0.5, 1
                                                        ],
                                                        ease: "easeInOut"
                                                    }
                                                }}
                                            >
                                                <Image
                                                    src={skill.icon}
                                                    alt={skill.skill + " Icon"}
                                                    boxSize={{
                                                        base: "40px",
                                                        md: "50px"
                                                    }}
                                                />
                                            </MotionBox>
                                        </Box>
                                    </MotionBox>
                                    <Text
                                        fontSize={{
                                            base: "8px",
                                            md: "10px"
                                        }}
                                        position="absolute"
                                        bottom="-20px"
                                        right="0px"
                                        color={"brand.secondaryText"}
                                    >
                                        {skill.skill}
                                    </Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default Skills;

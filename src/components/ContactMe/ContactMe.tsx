// ContactSection.tsx
import { EmailIcon, LinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Heading,
    HStack,
    Icon,
    Input,
    Link,
    Text,
    Textarea,
    useColorMode,
    useToast,
    VStack
} from "@chakra-ui/react";
import React, { useState } from "react";

type ContactFormValues = {
    name: string;
    email: string;
    message: string;
};

export const ContactSection: React.FC = () => {
    const { colorMode } = useColorMode();
    const [form, setForm] = useState<ContactFormValues>({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.message) {
            toast({
                status: "warning",
                title: "Please fill all fields.",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Failed to send");

            toast({
                status: "success",
                title: "Message sent!",
                description: "Thanks for reaching out.",
                duration: 4000,
                isClosable: true
            });

            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            console.error(err);
            toast({
                status: "error",
                title: "Something went wrong.",
                description: "Please try again later.",
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box w="100%" py={24} px={6}>
            <Box maxW="6xl" mx="auto" textAlign="center" mb={12}>
                <Heading>
                    <Text
                        as="span"
                        color={colorMode === "light" ? "#be185d" : "cyan.500"}
                    >
                        Contact{" "}
                    </Text>
                    Me
                </Heading>
            </Box>

            <VStack spacing={10} w="100%">
                <Grid
                    templateColumns={{ base: "1fr", md: "1.1fr 1.5fr" }}
                    gap={12}
                >
                    {/* LEFT SIDE - info */}
                    <GridItem>
                        <VStack align="flex-start" spacing={4}>
                            <Heading as="h3" size="lg">
                                Get In Touch
                            </Heading>
                            <Text fontSize="md">
                                Feel free to contact me for any work or
                                suggestions below.
                            </Text>

                            <VStack align="flex-start" spacing={4} mt={4}>
                                {/* Email */}
                                <HStack spacing={3}>
                                    <Icon
                                        as={EmailIcon}
                                        color={"accentPrimary"}
                                        boxSize={5}
                                    />
                                    <Link
                                        href="mailto:iamprazol@gmail.com"
                                        fontSize="sm"
                                    >
                                        iamprazol@gmail.com
                                    </Link>
                                </HStack>

                                {/* LinkedIn */}
                                <HStack spacing={3}>
                                    <Icon
                                        as={LinkIcon}
                                        color={"accentPrimary"}
                                        boxSize={5}
                                    />
                                    <Link
                                        href="https://linkedin.com/in/prajjwal-poudel"
                                        isExternal
                                        fontSize="sm"
                                    >
                                        linkedin.com/in/prajjwal-poudel
                                    </Link>
                                </HStack>

                                {/* GitHub */}
                                <HStack spacing={3}>
                                    <Icon
                                        viewBox="0 0 24 24"
                                        boxSize={5}
                                        color={"accentPrimary"}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.43c.6.11.82-.26.82-.58
                      0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73
                      1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96
                      0-1.32.47-2.39 1.24-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 5.8c1.02.01
                      2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.85 1.24 1.92 1.24 3.24
                      0 4.63-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12.01 12.01 0 0024 12C24 5.37 18.63 0 12 0z"
                                        />
                                    </Icon>
                                    <Link
                                        href="https://github.com/iamprazol"
                                        isExternal
                                        fontSize="sm"
                                    >
                                        github.com/iamprazol
                                    </Link>
                                </HStack>
                            </VStack>
                        </VStack>
                    </GridItem>

                    <GridItem>
                        <Box
                            as="form"
                            onSubmit={handleSubmit}
                            bg={"cardBg"}
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor={"cardBorder"}
                            p={8}
                        >
                            <VStack spacing={6} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        name="name"
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={handleChange}
                                        color={"tertiaryText"}
                                        bg={
                                            colorMode === "light"
                                                ? "#fce7f3"
                                                : "bg"
                                        }
                                        border={
                                            colorMode === "light"
                                                ? "1px solid #fce7f3"
                                                : "0.5px solid #2d333b"
                                        }
                                        _hover={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal"
                                        }}
                                        _focus={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal",
                                            boxShadow:
                                                colorMode === "light"
                                                    ? "0 0 0 1px #be185d"
                                                    : "0 0 0 1px teal"
                                        }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        color={"tertiaryText"}
                                        type="email"
                                        name="email"
                                        placeholder="Your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        bg={
                                            colorMode === "light"
                                                ? "#fce7f3"
                                                : "bg"
                                        }
                                        border={
                                            colorMode === "light"
                                                ? "1px solid #fce7f3"
                                                : "0.5px solid #2d333b"
                                        }
                                        _hover={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal"
                                        }}
                                        _focus={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal",
                                            boxShadow:
                                                colorMode === "light"
                                                    ? "0 0 0 1px #be185d"
                                                    : "0 0 0 1px teal"
                                        }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Message</FormLabel>
                                    <Textarea
                                        color={"tertiaryText"}
                                        name="message"
                                        placeholder="Your message"
                                        rows={6}
                                        value={form.message}
                                        onChange={handleChange}
                                        bg={
                                            colorMode === "light"
                                                ? "#fce7f3"
                                                : "bg"
                                        }
                                        border={
                                            colorMode === "light"
                                                ? "1px solid #fce7f3"
                                                : "0.5px solid #2d333b"
                                        }
                                        _hover={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal"
                                        }}
                                        _focus={{
                                            borderColor:
                                                colorMode === "light"
                                                    ? "#be185d"
                                                    : "teal",
                                            boxShadow:
                                                colorMode === "light"
                                                    ? "0 0 0 1px #be185d"
                                                    : "0 0 0 1px teal"
                                        }}
                                        resize="vertical"
                                    />
                                </FormControl>

                                <Button
                                    type="submit"
                                    mt={4}
                                    w="100%"
                                    size="lg"
                                    bg={"accentPrimary"}
                                    _hover={{ bg: "#02ccb3" }}
                                    isLoading={isSubmitting}
                                    loadingText="Sending..."
                                    color={"buttonSecondaryText"}
                                >
                                    Send Message
                                </Button>
                            </VStack>
                        </Box>
                    </GridItem>
                </Grid>
            </VStack>
        </Box>
    );
};

import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
};

const theme = extendTheme({
    config,
    fonts: {
        heading: `'Poppins', sans-serif`,
        body: `'Inter', sans-serif`
    },
    semanticTokens: {
        colors: {
            background: {
                default: "#6C63FF",
                _dark: "#0d1117"
            },
            brand: {
                500: "#6C63FF"
            }
        }
    }
});

export default theme;

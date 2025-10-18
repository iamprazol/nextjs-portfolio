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
    colors: {
        brand: {
            500: "#6C63FF"
        }
    }
});

export default theme;

import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: false
};

const theme = extendTheme({
    config,
    fonts: {
        heading: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        body: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
    },
    colors: {
        brand: {
            // Backgrounds
            bgLight: "#dbe4f0",
            bgDark: "#0d1117",
            bgSecondaryLight: "#F8F9FA",
            bgSecondaryDark: "#1E293B",
            bgGradientMain:
                "linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fce7f3 100%)",
            bgGradientLight:
                "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
            bgGradientDark: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
            cardBgLight: "#ffffff",
            cardBgDark: "#ffffff0f",
            cardBorder: "#0c0d3c1a",

            // Texts
            textPrimaryLight: "#525252",
            textPrimaryDark: "#f2f2f2",
            textSecondaryLight: "#4b5563",
            textSecondaryDark: "#9ca3af",
            textTertiaryLight: "#be185d",
            textTertiaryDark: "#22c3b6",
            textHeadingLight: "#111827",
            textHeadingDark: "#F1F5F9",

            // Accents
            accentPrimaryLight: "#6366f1",
            accentPrimaryDark: "#A78BFA",
            accentSecondaryLight: "#EC4899",
            accentSecondaryDark: "#F472B6",
            accentGradientLight:
                "linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)",
            accentGradientDark:
                "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",

            // Buttons
            buttonPrimaryGradientLight:
                "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
            buttonPrimaryGradientDark:
                "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
            buttonPrimaryTextLight: "#111827",
            buttonPrimaryTextDark: "#FFFFFF",
            buttonSecondaryBgLight: "#1F2937",
            buttonSecondaryBgDark: "#1a1f2b",
            buttonSecondaryTextLight: "#FFFFFF",
            buttonSecondaryTextDark: "#d1d5db",
            buttonSecondaryHoverBgLight: "#7C3AED",
            buttonSecondaryHoverBgDark: "#C4B5FD",
            buttonSecondaryHoverTextLight: "#FFFFFF",
            buttonSecondaryHoverTextDark: "#1a1f2b",

            // Links
            linkDefaultLight: "#8B5CF6",
            linkHoverLight: "#7C3AED",
            linkVisitedLight: "#9333EA",
            linkDefaultDark: "#A78BFA",
            linkHoverDark: "#C4B5FD",
            linkVisitedDark: "#DDD6FE",

            // Badges
            badgeBgLight: "#fdf2f8",
            badgeBgDark: "#1a1f2b",
            badgeTextLight: "#be185d",
            badgeTextDark: "#d1d5db",

            // Shadows
            shadowSmLight: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            shadowMdLight: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            shadowLgLight: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            shadowXlLight: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            shadowSmDark: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
            shadowMdDark: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
            shadowLgDark: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            shadowXlDark: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
        }
    },
    semanticTokens: {
        colors: {
            bg: {
                default: "brand.bgLight",
                _dark: "brand.bgDark"
            },
            bgSecondary: {
                default: "brand.bgSecondaryLight",
                _dark: "brand.bgSecondaryDark"
            },
            bgGradientMain: {
                default: "brand.bgGradientMain"
            },
            bgGradient: {
                default: "brand.bgGradientLight",
                _dark: "brand.bgGradientDark"
            },
            cardBg: {
                default: "brand.cardBgLight",
                _dark: "brand.cardBgDark"
            },
            cardBorder: {
                default: "brand.cardBorder",
                _dark: "brand.cardBorder"
            },
            primaryText: {
                default: "brand.textPrimaryLight",
                _dark: "brand.textPrimaryDark"
            },
            secondaryText: {
                default: "brand.textSecondaryLight",
                _dark: "brand.textSecondaryDark"
            },
            tertiaryText: {
                default: "brand.textTertiaryLight",
                _dark: "brand.textTertiaryDark"
            },
            headingText: {
                default: "brand.textHeadingLight",
                _dark: "brand.textHeadingDark"
            },
            accentPrimary: {
                default: "brand.accentPrimaryLight",
                _dark: "brand.accentPrimaryDark"
            },
            accentSecondary: {
                default: "brand.accentSecondaryLight",
                _dark: "brand.accentSecondaryDark"
            },
            accentGradient: {
                default: "brand.accentGradientLight"
            },
            buttonPrimaryGradient: {
                default: "brand.buttonPrimaryGradientLight",
                _dark: "brand.buttonPrimaryGradientDark"
            },
            buttonPrimaryText: {
                default: "brand.buttonPrimaryTextLight",
                _dark: "brand.buttonPrimaryTextDark"
            },
            buttonSecondaryBg: {
                default: "brand.buttonSecondaryBgLight",
                _dark: "brand.buttonSecondaryBgDark"
            },
            buttonSecondaryText: {
                default: "brand.buttonSecondaryTextLight",
                _dark: "brand.buttonSecondaryTextDark"
            },
            buttonSecondaryHoverBg: {
                default: "brand.buttonSecondaryHoverBgLight",
                _dark: "brand.buttonSecondaryHoverBgDark"
            },
            buttonSecondaryHoverText: {
                default: "brand.buttonSecondaryHoverTextLight",
                _dark: "brand.buttonSecondaryHoverTextDark"
            },
            linkDefault: {
                default: "brand.linkDefaultLight",
                _dark: "brand.linkDefaultDark"
            },
            linkHover: {
                default: "brand.linkHoverLight",
                _dark: "brand.linkHoverDark"
            },
            linkVisited: {
                default: "brand.linkVisitedLight",
                _dark: "brand.linkVisitedDark"
            },
            badgeBg: {
                default: "brand.badgeBgLight",
                _dark: "brand.badgeBgDark"
            },
            badgeText: {
                default: "brand.badgeTextLight",
                _dark: "brand.badgeTextDark"
            },
            shadowSm: {
                default: "brand.shadowSmLight",
                _dark: "brand.shadowSmDark"
            },
            shadowMd: {
                default: "brand.shadowMdLight",
                _dark: "brand.shadowMdDark"
            },
            shadowLg: {
                default: "brand.shadowLgLight",
                _dark: "brand.shadowLgDark"
            },
            shadowXl: {
                default: "brand.shadowXlLight",
                _dark: "brand.shadowXlDark"
            }
        }
    }
});

export default theme;

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
            bgGradientLight:
                "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
            bgGradientDark: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
            cardBgLight: "#dbe4f0",
            cardBgDark: "#ffffff0f",

            // Texts
            textPrimaryLight: "#0f0f0f",
            textPrimaryDark: "#f2f2f2",
            textSecondaryLight: "#4b5563",
            textSecondaryDark: "#9ca3af",
            textHeadingLight: "#111827",
            textHeadingDark: "#F1F5F9",

            // Accents
            accentPrimaryLight: "#6366f1",
            accentPrimaryDark: "#A78BFA",
            accentSecondaryLight: "#EC4899",
            accentSecondaryDark: "#F472B6",
            accentGradientLight:
                "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
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
            badgeBgLight: "#E5E7EB",
            badgeBgDark: "#1a1f2b",
            badgeTextLight: "#374151",
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
            bgGradient: {
                default: "brand.bgGradientLight",
                _dark: "brand.bgGradientDark"
            },
            cardBg: {
                default: "brand.cardBgLight",
                _dark: "brand.cardBgDark"
            },
            primaryText: {
                default: "brand.textPrimaryLight",
                _dark: "brand.textPrimaryDark"
            },
            secondaryText: {
                default: "brand.textSecondaryLight",
                _dark: "brand.textSecondaryDark"
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
                default: "brand.accentGradientLight",
                _dark: "brand.accentGradientDark"
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

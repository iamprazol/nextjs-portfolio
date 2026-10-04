import { ChakraProviders } from "@/legacy/ChakraProviders";
import LegacyPage from "@/legacy/LegacyPage";

// Renders the pre-redesign single-page site until M04 replaces it. Chakra is
// mounted here, not in the layout, so its global reset stays off the new routes.
export default function Home() {
    return (
        <ChakraProviders>
            <LegacyPage />
        </ChakraProviders>
    );
}

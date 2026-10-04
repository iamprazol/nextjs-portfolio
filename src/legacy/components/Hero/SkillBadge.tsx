import { Button, ButtonProps, useColorMode } from "@chakra-ui/react";
import { FC } from "react";

interface SkillBadgeProps extends ButtonProps {
    label: string;
}

const SkillBadge: FC<SkillBadgeProps> = ({ label, ...props }) => {
    const { colorMode } = useColorMode();

    return (
        <Button
            variant="outline"
            borderRadius="full"
            bgColor="badgeBg"
            color="badgeText"
            fontWeight="500"
            border={
                colorMode === "light"
                    ? "1px solid #fce7f3"
                    : "0.5px solid #2d333b"
            }
            fontSize="14px"
            lineHeight="20px"
            height="30px"
            _hover={{
                border:
                    colorMode === "light"
                        ? "1px solid #be185d"
                        : "1px solid teal"
            }}
            {...props}
        >
            {label}
        </Button>
    );
};

export default SkillBadge;

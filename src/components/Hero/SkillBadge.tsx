import { Button, ButtonProps } from "@chakra-ui/react";
import { FC } from "react";

interface SkillBadgeProps extends ButtonProps {
    label: string;
}

const SkillBadge: FC<SkillBadgeProps> = ({ label, ...props }) => (
    <Button
        variant="outline"
        borderRadius="full"
        bgColor="badgeBg"
        color="badgeText"
        fontWeight="500"
        border="0.5px solid #2d333b"
        fontSize="14px"
        lineHeight="20px"
        height="30px"
        _hover={{ border: "1px solid teal" }}
        {...props}
    >
        {label}
    </Button>
);

export default SkillBadge;

import { Box, Text, BoxProps } from "@chakra-ui/react";
import { motion, MotionProps } from "framer-motion";
import { FC } from "react";

const MotionBox = motion(Box);

interface FloatingIconProps extends BoxProps {
    emoji: string;
    position: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    animation?: MotionProps["animate"];
}

const FloatingIcon: FC<FloatingIconProps> = ({
    emoji,
    position,
    animation = {}
}) => (
    <MotionBox
        textAlign="center"
        animate={{ y: [0, -20, 0], rotate: [0, -15, 15, 0], ...animation }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        opacity={0.5}
        width="60%"
        position="absolute"
        {...position}
    >
        <Text fontSize="40px">{emoji}</Text>
    </MotionBox>
);

export default FloatingIcon;

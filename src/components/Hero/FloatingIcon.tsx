import { Box, Text } from "@chakra-ui/react";
import { motion, type TargetAndTransition } from "framer-motion";
import type { FC } from "react";

const MotionBox = motion(Box);

type FloatingIconProps = {
  emoji: string;
  placement: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animation?: TargetAndTransition;
};

const FloatingIcon: FC<FloatingIconProps> = ({
  emoji,
  placement,
  animation = {},
}) => (
  <MotionBox
    textAlign="center"
    animate={{
      y: [0, -20, 0],
      rotate: [0, -15, 15, 0],
      ...animation,
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    opacity={0.5}
    width="60%"
    position="absolute"
    {...placement}
  >
    <Text fontSize="40px">{emoji}</Text>
  </MotionBox>
);

export default FloatingIcon;

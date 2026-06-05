export const easeOut = [0.16, 1, 0.3, 1] as const;

export const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

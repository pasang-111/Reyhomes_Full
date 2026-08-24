// src/components/common/motion.tsx
"use client";

import { motion, useScroll, useTransform, type Variants, type HTMLMotionProps } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Shared easing & variants                                                   */
/* -------------------------------------------------------------------------- */

export const luxeEase = [0.22, 1, 0.36, 1] as const;
// Scroll-triggered text reveals
export const textReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerText = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: luxeEase },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: luxeEase },
  },
};

/* -------------------------------------------------------------------------- */
/*  Basic Reveal (single element)                                              */
/* -------------------------------------------------------------------------- */

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
} & HTMLMotionProps<"div">;

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 36,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px", amount: 0.2 }}
      transition={{ duration: 0.95, delay, ease: luxeEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  RevealGroup + RevealItem  (staggered children)                             */
/*  Used by Footer, Testimonials, Contact, Knockdown-Rebuild etc.             */
/* -------------------------------------------------------------------------- */

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number; // fraction of the element that must be visible to trigger, 0-1
};

export function RevealGroup({
  children,
  className = "",
  delay = 0,
  stagger = 0.1,
  amount,
}: RevealGroupProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={
        amount !== undefined
          ? { once: true, amount }
          : { once: true, margin: "-60px" }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function RevealItem({ children, className = "", y = 24 }: RevealItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: luxeEase },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FloatGlow – soft ambient floating blob                                     */
/* -------------------------------------------------------------------------- */

type FloatGlowProps = {
  className?: string;
  duration?: number;
  x?: number;
  y?: number;
};

export function FloatGlow({
  className = "",
  duration = 18,
  x = 20,
  y = 15,
}: FloatGlowProps) {
  return (
    <motion.div
      className={className}
      animate={{ x: [0, x, 0], y: [0, y, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  ParallaxScale – used by UpcomingProjectsPreview                            */
/* -------------------------------------------------------------------------- */

type ParallaxScaleProps = {
  children: ReactNode;
  className?: string;
  scaleRange?: [number, number]; // e.g. [1, 1.08]
  yRange?: [string, string];     // e.g. ["0%", "-8%"]
};

export function ParallaxScale({
  children,
  className = "",
  scaleRange = [1, 1.06],
  yRange = ["0%", "-6%"],
}: ParallaxScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const y = useTransform(scrollYProgress, [0, 1], yRange);

  return (
    <motion.div ref={ref} style={{ scale, y }} className={className}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Parallax – simple vertical parallax wrapper, used by Projects page         */
/* -------------------------------------------------------------------------- */

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  range?: number; // px of vertical travel across the scroll range
} & Omit<HTMLMotionProps<"div">, "children" | "className">;

export function Parallax({
  children,
  className = "",
  range = 24,
  ...props
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);

  return (
    <motion.div ref={ref} style={{ y }} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Optional extras you may want later                                         */
/* -------------------------------------------------------------------------- */

export function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: luxeEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
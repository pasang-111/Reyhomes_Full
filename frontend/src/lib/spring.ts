// lib/springs.ts
export const softSpring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 24,
  mass: 0.85,
};

export const snappySpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.6,
};

export const cinematicSpring = {
  type: "spring" as const,
  stiffness: 90,
  damping: 22,
  mass: 1.1,
};

export const magneticSpring = {
  stiffness: 160,
  damping: 16,
  mass: 0.18,
};

export const expandSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 26,
  mass: 0.7,
};
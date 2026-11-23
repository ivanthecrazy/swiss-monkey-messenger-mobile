import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Motion tokens for the sign-in screen — the desktop app's, so both move the same way.
gsap.registerPlugin(useGSAP, CustomEase, SplitText);

CustomEase.create("sm.standard", "M0,0 C0.2,0 0,1 1,1");
CustomEase.create("sm.enter", "M0,0 C0,0 0,1 1,1");
CustomEase.create("sm.exit", "M0,0 C0.3,0 1,1 1,1");
CustomEase.create("sm.glide", "M0,0 C0.4,0.6 0.2,1 1,1");
CustomEase.create("sm.spring", "M0,0 C0.34,1.56 0.64,1 1,1");
CustomEase.create("sm.bounce", "M0,0 C0.14,0 0.24,1.18 0.42,1.12 0.58,1.06 0.7,0.98 1,1");

export const EASE = {
  standard: "sm.standard",
  enter: "sm.enter",
  exit: "sm.exit",
  spring: "sm.spring",
  bounce: "sm.bounce",
  glide: "sm.glide",
} as const;

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches;

export { gsap, SplitText, useGSAP };

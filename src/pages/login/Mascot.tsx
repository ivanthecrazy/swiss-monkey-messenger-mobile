import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { EASE, gsap, prefersReducedMotion } from "../../motion.ts";
import {
  BODY, EAR_L_CLIP, EAR_L_CUT, EAR_L_ORIGIN, EAR_R_CLIP, EAR_R_CUT, EAR_R_ORIGIN, EYE_CENTER,
  HEAD, HEAD_ORIGIN, MOUTH, NOSE_A, NOSE_B, PUPIL_L, PUPIL_R, TUFT_CLIP, TUFT_CUT, TUFT_ORIGIN,
} from "./mascotPaths.ts";

// The Swiss Monkey peeking over the top of the sign-in card. It rises from behind the
// card on mount, then idles: breathes, blinks, glances around, twitches its ears and
// follows the pointer with its eyes. Focusing a password field makes it shut its eyes
// (no peeking); `cheer()` hops on a successful step, `nope()` shakes its head on an error.

export type MascotHandle = { cheer: () => void; nope: () => void };

type Props = {
  color?: string;
  entranceDelay?: number;
  sx?: SxProps<Theme>;
};

const VIEW_W = 459.233;
const MOUTH_ORIGIN = "296 215";
const EYES_ORIGIN = `${EYE_CENTER.x} ${EYE_CENTER.y}`;

const Mascot = forwardRef<MascotHandle, Props>(({ color = "#B7A8FF", entranceDelay = 0.75, sx }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const eyesShut = useRef(false);

  const part = (name: string) => svgRef.current?.querySelector<SVGGElement>(`[data-m="${name}"]`) ?? null;

  useImperativeHandle(ref, () => ({
    cheer: () => {
      if (!svgRef.current || prefersReducedMotion()) return;
      gsap.timeline()
        .to(part("mouth"), { scaleY: 1.35, scaleX: 1.08, svgOrigin: MOUTH_ORIGIN, duration: 0.18, ease: "power2.out" }, 0)
        .to(part("eyes"), { scaleY: 0.35, svgOrigin: EYES_ORIGIN, duration: 0.14, ease: "power2.out" }, 0)
        .to(part("eyes"), { scaleY: eyesShut.current ? 0.1 : 1, duration: 0.3, ease: "power2.out" }, 0.5)
        .to(part("mouth"), { scaleY: 1, scaleX: 1, duration: 0.4, ease: EASE.standard }, 0.6)
        .to(part("root"), { y: -26, duration: 0.22, ease: "power2.out" }, 0)
        .to(part("root"), { y: 0, duration: 0.5, ease: EASE.bounce }, 0.22)
        .to(part("tuft"), { scaleY: 0.8, skewX: 8, svgOrigin: TUFT_ORIGIN, duration: 0.16, ease: "power2.out" }, 0.06)
        .to(part("tuft"), { scaleY: 1, skewX: 0, duration: 1, ease: "elastic.out(1, 0.3)" }, 0.22);
    },
    nope: () => {
      if (!svgRef.current || prefersReducedMotion()) return;
      gsap.timeline()
        .to(part("head"), { rotation: -6, duration: 0.09, ease: "sine.out" })
        .to(part("head"), { rotation: 6, duration: 0.14, ease: "sine.inOut", yoyo: true, repeat: 2 })
        .to(part("head"), { rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" })
        .to(part("mouth"), { scaleX: 0.82, scaleY: 0.8, svgOrigin: MOUTH_ORIGIN, duration: 0.2, ease: "power2.out" }, 0)
        .to(part("mouth"), { scaleX: 1, scaleY: 1, duration: 0.5, ease: EASE.standard }, 0.9);
    },
  }));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const root = part("root");
    const head = part("head");
    const eyes = part("eyes");
    const pupils = part("pupils");
    const mouth = part("mouth");
    const tuft = part("tuft");
    const earL = part("earL");
    const earR = part("earR");
    const noses = [part("noseA"), part("noseB")];

    gsap.set(tuft, { svgOrigin: TUFT_ORIGIN });
    gsap.set(earL, { svgOrigin: EAR_L_ORIGIN });
    gsap.set(earR, { svgOrigin: EAR_R_ORIGIN });
    gsap.set(noses, { transformOrigin: "50% 50%" });
    gsap.set(head, { svgOrigin: HEAD_ORIGIN });
    gsap.set(eyes, { svgOrigin: EYES_ORIGIN });
    gsap.set(mouth, { svgOrigin: MOUTH_ORIGIN });
    if (prefersReducedMotion()) return;

    let alive = true;
    const loops: gsap.core.Animation[] = [];

    const tuftWobble = (dir: number) =>
      gsap.timeline()
        .to(tuft, { skewX: dir * 1.6, duration: 0.3, ease: "sine.out" })
        .to(tuft, { skewX: -dir * 0.6, duration: 0.45, ease: "sine.inOut" })
        .to(tuft, { skewX: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });

    // Entrance: rise from behind the card, pause, pop up the rest of the way, then a
    // little head tilt with the tuft springing back.
    loops.push(
      gsap.timeline({ delay: entranceDelay })
        .fromTo(root, { y: 300 }, { y: 120, duration: 0.45, ease: "power2.out" })
        .to(root, { y: 0, duration: 0.8, ease: "back.out(1.6)" }, "+=0.25")
        .fromTo(head, { rotation: 0 }, { rotation: -7, duration: 0.35, ease: "sine.out", yoyo: true, repeat: 1 }, "-=0.2")
        .fromTo(tuft, { scaleY: 1, skewX: 0 }, { scaleY: 0.82, skewX: -6, duration: 0.18, ease: "sine.out" }, "<-0.35")
        .to(tuft, { scaleY: 1, skewX: 0, duration: 1, ease: "elastic.out(1, 0.3)" }),
    );
    // Breathing.
    loops.push(gsap.to(root, { scale: 1.015, svgOrigin: "300 466", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.9 }));
    loops.push(gsap.to(noses, { scale: 1.2, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.9 }));

    // Glance: tilt the head one way, back, with the tuft lagging behind.
    const glance = () => {
      if (!alive) return;
      const dir = gsap.utils.random([-5, -3, 3, 5]);
      gsap.timeline({ onComplete: () => void gsap.delayedCall(gsap.utils.random(3, 6), glance) })
        .to(head, { rotation: dir, duration: 0.9, ease: "sine.inOut" })
        .to(head, { rotation: 0, duration: 1.1, ease: "sine.inOut" }, "+=1.4")
        .add(tuftWobble(dir), 0.05)
        .add(tuftWobble(-dir), 2.35);
    };

    // Ear twitch: left, right, or both.
    const twitch = () => {
      if (!alive) return;
      const r = Math.random();
      const ears = r < 0.42 ? [earL] : r < 0.84 ? [earR] : [earL, earR];
      const tl = gsap.timeline({ onComplete: () => void gsap.delayedCall(gsap.utils.random(4, 9), twitch) });
      ears.forEach((ear) => {
        const a = ear === earL ? 7 : -7;
        tl.to(ear, { rotation: a, duration: 0.07, ease: "power2.out" }, 0)
          .to(ear, { rotation: a * 0.2, duration: 0.08, ease: "power2.in" }, 0.07)
          .to(ear, { rotation: a * 0.7, duration: 0.06, ease: "power2.out" }, 0.15)
          .to(ear, { rotation: 0, duration: 0.35, ease: "sine.out" }, 0.21);
      });
    };

    // Blink (sometimes twice) — skipped while the eyes are shut for a password.
    const blink = () => {
      if (!alive) return;
      const next = () => void gsap.delayedCall(gsap.utils.random(2.2, 5.5), blink);
      if (eyesShut.current) return next();
      const tl = gsap.timeline({ onComplete: next });
      tl.to(eyes, { scaleY: 0.1, duration: 0.07, ease: "power2.in" }).to(eyes, { scaleY: 1, duration: 0.12, ease: "power2.out" });
      if (Math.random() < 0.25) {
        tl.to(eyes, { scaleY: 0.1, duration: 0.07, ease: "power2.in" }, "+=0.08")
          .to(eyes, { scaleY: 1, duration: 0.12, ease: "power2.out" });
      }
    };

    gsap.delayedCall(3.6, twitch);
    gsap.delayedCall(2.4, glance);
    gsap.delayedCall(2, blink);

    // Eyes follow the pointer (and look at whichever field gets focus).
    const pupilX = gsap.quickTo(pupils, "x", { duration: 0.45, ease: "power3.out" });
    const pupilY = gsap.quickTo(pupils, "y", { duration: 0.45, ease: "power3.out" });
    const lookAt = (x: number, y: number) => {
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / VIEW_W;
      const dx = x - (rect.left + EYE_CENTER.x * scale);
      const dy = y - (rect.top + EYE_CENTER.y * scale);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 500);
      pupilX((dx / dist) * 6 * reach);
      pupilY((dy / dist) * 4 * reach);
    };
    const onMove = (e: PointerEvent) => lookAt(e.clientX, e.clientY);
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.type === "password") {
        eyesShut.current = true;
        gsap.to(eyes, { scaleY: 0.1, duration: 0.18, ease: "power2.inOut", overwrite: true });
        gsap.to(mouth, { scaleX: 0.92, duration: 0.3, ease: "sine.inOut" });
      } else {
        const rect = el.getBoundingClientRect();
        lookAt(rect.left + rect.width * 0.3, rect.top + rect.height / 2);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "password") return;
      eyesShut.current = false;
      gsap.to(eyes, { scaleY: 1, duration: 0.22, ease: "power2.out", overwrite: true });
      gsap.to(mouth, { scaleX: 1, duration: 0.3, ease: "sine.inOut" });
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      alive = false;
      loops.forEach((a) => a.kill());
      gsap.killTweensOf([root, head, eyes, pupils, mouth, tuft, earL, earR, ...noses]);
      gsap.killTweensOf([glance, twitch, blink]);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clip = (name: string) => `url(#${uid}-${name})`;

  return (
    <Box aria-hidden sx={{ pointerEvents: "none", ...sx }}>
      <svg ref={svgRef} viewBox="0 0 459.233 465.93" width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <clipPath id={`${uid}-body`}>
            <path clipRule="evenodd" d="M-60 120 H520 V540 H-60 Z M-60 150 H178 V318 H144 V540 H-60 Z" />
          </clipPath>
          <clipPath id={`${uid}-head`}>
            <path clipRule="evenodd" d={`M0 -60 H520 V520 H0 Z ${TUFT_CUT} ${EAR_L_CUT} ${EAR_R_CUT}`} />
          </clipPath>
          <clipPath id={`${uid}-jaw`}>
            <path d="M300 224 H384 V184 H520 V349 H300 Z" />
          </clipPath>
          <clipPath id={`${uid}-tuft`}><path d={TUFT_CLIP} /></clipPath>
          <clipPath id={`${uid}-earL`}><path d={EAR_L_CLIP} /></clipPath>
          <clipPath id={`${uid}-earR`}><path d={EAR_R_CLIP} /></clipPath>
        </defs>
        <g data-m="root" fill={color}>
          <g clipPath={clip("body")}><path d={BODY} /></g>
          <g data-m="head">
            <g clipPath={clip("head")}><path d={HEAD} /></g>
            {/* The logomark's face is cut by the "S"; mirror the left jaw to complete it. */}
            <g clipPath={clip("jaw")}><path d={HEAD} transform="matrix(-0.957 0 0 1 583.23 0)" /></g>
            <g data-m="tuft"><g clipPath={clip("tuft")}><path d={HEAD} /></g></g>
            <g data-m="earL"><g clipPath={clip("earL")}><path d={HEAD} /></g></g>
            <g data-m="earR"><g clipPath={clip("earR")}><path d={HEAD} /></g></g>
            <g data-m="eyes">
              <g data-m="pupils">
                <path d={PUPIL_L} />
                <path d={PUPIL_R} />
              </g>
            </g>
            <g data-m="noseA"><path d={NOSE_A} /></g>
            <g data-m="noseB"><path d={NOSE_B} /></g>
            <g data-m="mouth"><path d={MOUTH} /></g>
          </g>
        </g>
      </svg>
    </Box>
  );
});

Mascot.displayName = "Mascot";

export default Mascot;

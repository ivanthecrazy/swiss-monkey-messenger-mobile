import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { gsap, prefersReducedMotion } from "../../motion.ts";

// A slowly drifting purple/magenta gradient mesh. Each "pole" is a colour that orbits
// its anchor point; every pixel is an inverse-distance blend of all poles. It is drawn
// on a tiny canvas (48px wide; the desktop's is 80, but a phone is portrait) and blurred up to full size, so it costs next to nothing
// and is capped at 30fps on GSAP's ticker.

type Pole = {
  color: string;
  x: number;
  y: number;
  ax: number;
  ay: number;
  period: number;
  weight?: number;
  phase?: number;
};

const POLES: Pole[] = [
  { color: "#0E0033", x: 0.12, y: 0.88, ax: 0.1, ay: 0.08, period: 31, weight: 1.25, phase: 0.1 },
  { color: "#210066", x: 0.62, y: 0.02, ax: 0.18, ay: 0.08, period: 27, weight: 1, phase: 0.55 },
  { color: "#3A0099", x: 0.48, y: 0.58, ax: 0.2, ay: 0.16, period: 23, weight: 1.15, phase: 0.3 },
  { color: "#5E00FF", x: 0.86, y: 0.3, ax: 0.12, ay: 0.2, period: 29, weight: 0.95, phase: 0.8 },
  { color: "#C42BFF", x: 0.06, y: 0.08, ax: 0.14, ay: 0.12, period: 34, weight: 0.7, phase: 0.2 },
  { color: "#E23BE8", x: 0.94, y: 0.94, ax: 0.1, ay: 0.12, period: 26, weight: 0.55, phase: 0.65 },
  { color: "#7F6AF7", x: 0.3, y: 0.32, ax: 0.16, ay: 0.14, period: 21, weight: 0.22, phase: 0.42 },
];

// Film grain laid over the mesh so the blur doesn't band.
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const SPEED = 1;
const BREATH = 0.18;

const MeshBackground = (props: { "data-sm"?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !canvas.parentElement) return;
    const colors = POLES.map((p) => rgb(p.color));
    let w = 0;
    let h = 0;
    let image: ImageData | null = null;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const aspect = rect.width / Math.max(1, rect.height) || 1.6;
      w = 48;
      h = Math.max(24, Math.round(w / aspect));
      canvas.width = w;
      canvas.height = h;
      image = ctx.createImageData(w, h);
    };
    const draw = (t: number) => {
      if (!image) return;
      const aspect = w / h;
      const px: number[] = [];
      const py: number[] = [];
      const pw: number[] = [];
      POLES.forEach((p, i) => {
        const a = ((t * SPEED) / p.period + (p.phase ?? 0)) * Math.PI * 2;
        px.push((p.x + Math.cos(a) * p.ax) * aspect);
        py.push(p.y + Math.sin(a * 0.83 + i) * p.ay);
        pw.push((p.weight ?? 1) * (1 + BREATH * Math.sin((t * SPEED) / 9 + i * 1.7)));
      });
      const data = image.data;
      let o = 0;
      for (let y = 0; y < h; y++) {
        const v = (y + 0.5) / h;
        for (let x = 0; x < w; x++) {
          const u = ((x + 0.5) / w) * aspect;
          let r = 0;
          let g = 0;
          let b = 0;
          let sum = 0;
          for (let k = 0; k < px.length; k++) {
            const dx = u - px[k];
            const dy = v - py[k];
            const f = pw[k] / Math.pow(dx * dx + dy * dy + 0.02, 1.3);
            r += colors[k][0] * f;
            g += colors[k][1] * f;
            b += colors[k][2] * f;
            sum += f;
          }
          data[o++] = r / sum;
          data[o++] = g / sum;
          data[o++] = b / sum;
          data[o++] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    // Resizing clears the canvas, and the keyboard resizes the page, so redraw at once.
    let shown = 6;
    const observer = new ResizeObserver(() => {
      resize();
      draw(shown);
    });
    resize();
    draw(shown);
    observer.observe(canvas.parentElement);

    // Reduced motion: one still frame.
    if (prefersReducedMotion()) {
      return () => observer.disconnect();
    }

    let last = -1;
    const start = gsap.ticker.time;
    const tick = () => {
      const t = gsap.ticker.time - start + 6;
      if (t - last < 1 / 30) return;
      last = t;
      shown = t;
      draw(t);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      aria-hidden
      {...props}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        bgcolor: "#1A0052",
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          position: "absolute",
          inset: "-6%",
          width: "112%",
          height: "112%",
          filter: "blur(18px) saturate(1.08)",
          transform: "translateZ(0)",
        }}
      />
      <Box sx={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.07, mixBlendMode: "overlay" }} />
    </Box>
  );
};

export default MeshBackground;

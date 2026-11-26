import { FormEvent, ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Box, Button, ButtonBase, InputBase, Link, Typography } from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useAuthFlow } from "@regimenthq/shell-auth";
import { useSignupEnabled } from "../services/signup.ts";
import { PLATFORM_ORIGIN } from "../services/config.ts";
import MeshBackground from "./login/MeshBackground.tsx";
import Mascot, { MascotHandle } from "./login/Mascot.tsx";
import { EASE, FULL_MOTION, REDUCED_MOTION, SplitText, gsap, prefersReducedMotion, useGSAP } from "../motion.ts";

// Sign-in screen, the desktop app's design fitted to a phone: a drifting gradient mesh, a white card with the mascot peeking over
// it, and a choreographed entrance (mesh → card spring → headline letters → fields →
// button). Each auth step re-runs the content part of that entrance, and the card
// glides between step heights. All auth logic stays in @regimenthq/shell-auth.
//
// Phone differences: the mesh stays put while the card scrolls, content keeps clear of
// the notch and home indicator, and on a short page (the keyboard is up) the mascot and
// spacing shrink so the fields and the button stay reachable.

const PURPLE = "#5E00FF";
const SPARK = "#EE35FF";
const TEXT = "#171718";
const TEXT_MUTED = "#45454B";
const BORDER = "#EBEBF1";

// The mascot is 459 units wide; the card is pushed down by the part that shows above it.
const MASCOT_W = { compact: 110, regular: 210 };
const peekHeight = (w: number) => Math.round((262 / 459) * w);
const peekLeft = (w: number) => `calc(50% - ${Math.round((296 / 459) * w)}px)`;
const COMPACT = "@media (max-height: 600px)";
const RESIZE = "240ms ease-out";
const SAFE_TOP = "var(--safe-area-inset-top, env(safe-area-inset-top))";
const SAFE_BOTTOM = "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))";
const PAGE_BG = "#210066";

// Light status/navigation bar icons over the dark mesh; the rest of the app is white.
const setBarStyle = (style: SystemBarsStyle) => {
  if (Capacitor.isNativePlatform()) SystemBars.setStyle({ style }).catch(() => {});
};

const STEP_COPY = {
  credentials: {
    title: "Hey, welcome back!",
    sub: "Sign in to chat with your team and stay on top of your work",
  },
  method: {
    title: "Quick security check",
    sub: "Where should we send your verification code?",
  },
  code: {
    title: "Check your inbox",
    sub: "Enter the verification code we just sent you.",
  },
} as const;

const q = (scope: Element, sel: string) => Array.from(scope.querySelectorAll(sel));

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  enterKeyHint?: "next" | "go";
  inputMode?: "numeric" | "email" | "text";
  large?: boolean;
};

const Field = ({ label, value, onChange, type = "text", large, inputMode, enterKeyHint, ...rest }: FieldProps) => (
  <Box component="label" sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <Typography sx={{ fontSize: 14, color: TEXT_MUTED }}>{label}</Typography>
    <InputBase
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ inputMode, enterKeyHint, spellCheck: false, autoCapitalize: "none", autoCorrect: "off" }}
      {...rest}
      sx={{
        borderRadius: "8px",
        border: `1px solid ${BORDER}`,
        backgroundColor: "#FDFDFE",
        fontSize: large ? 22 : 16,
        color: TEXT,
        transition: "border-color 140ms, box-shadow 140ms, background-color 140ms",
        "&:hover:not(.Mui-focused)": { borderColor: "#D8D8DF" },
        "&.Mui-focused": {
          backgroundColor: "#FFF",
          borderColor: PURPLE,
          boxShadow: "0 0 0 3px #E8E5FF",
        },
        // The app theme gives typed inputs a 48px min-height; this field sets its own.
        "& input, & input[type]": {
          minHeight: 0,
          height: large ? 28 : 20,
          padding: "12px 16px",
          letterSpacing: large ? "0.35em" : undefined,
          fontWeight: large ? 600 : undefined,
          "&::placeholder": { color: "#88888C", opacity: 1, letterSpacing: "normal", fontWeight: 400 },
        },
      }}
    />
  </Box>
);

const MethodOption = ({
  selected, icon, title, subtitle, onClick,
}: { selected: boolean; icon: ReactNode; title: string; subtitle: string; onClick: () => void }) => (
  <ButtonBase
    onClick={onClick}
    role="radio"
    aria-checked={selected}
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "10px",
      p: "16px",
      borderRadius: "12px",
      textAlign: "left",
      border: `1.5px solid ${selected ? PURPLE : BORDER}`,
      backgroundColor: selected ? "#FAFAFF" : "#FFF",
      boxShadow: selected ? "0 0 0 3px #E8E5FF" : "none",
      transition: "border-color 140ms, box-shadow 140ms, background-color 140ms, transform 140ms",
      "&:hover": { borderColor: selected ? PURPLE : "#C7C2FF" },
      "&:active": { transform: "scale(0.98)" },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        display: "grid",
        placeItems: "center",
        color: selected ? "#FFF" : PURPLE,
        backgroundImage: selected ? `linear-gradient(135deg, ${PURPLE}, ${SPARK})` : "none",
        backgroundColor: selected ? undefined : "#E8E5FF",
        transition: "color 140ms, background-color 140ms",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: TEXT_MUTED }}>{subtitle}</Typography>
    </Box>
  </ButtonBase>
);

const Login = () => {
  const navigate = useNavigate();
  const signupEnabled = useSignupEnabled();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<MascotHandle>(null);
  const cardHeight = useRef(0);
  const shownStep = useRef("credentials");

  const {
    step,
    email, setEmail,
    password, setPassword,
    method, setMethod,
    code, setCode,
    loading, error,
    submitCredentials, submitMethod, submitCode,
  } = useAuthFlow({
    // Exit before handing over to the app: the button presses in, the monkey hops,
    // the card and monkey lift away, and the mesh fades out to the white page.
    onAuthenticated: () => {
      const root = rootRef.current;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      document.body.style.backgroundColor = "";
      if (!root || prefersReducedMotion()) {
        navigate("/");
        return;
      }
      mascotRef.current?.cheer();
      gsap.timeline({ onComplete: () => navigate("/") })
        .to(q(root, '[data-sm="cta"]'), { scale: 0.97, duration: 0.08, ease: "power2.out", yoyo: true, repeat: 1 })
        .to(q(root, '[data-sm="stage"]'), { y: -14, scale: 0.98, opacity: 0, duration: 0.32, ease: EASE.exit }, 0.32)
        .to(root, { opacity: 0, duration: 0.25, ease: EASE.exit }, 0.42);
    },
  });

  const copy = step === "code"
    ? { ...STEP_COPY.code, title: method === "sms" ? "Check your phone" : "Check your inbox" }
    : STEP_COPY[step];

  // While this screen is up the bars are light-on-dark and the page behind it is purple,
  // so the keyboard sliding in or out never uncovers a white strip.
  useEffect(() => {
    document.body.style.backgroundColor = PAGE_BG;
    setBarStyle(SystemBarsStyle.Dark);
    return () => {
      document.body.style.backgroundColor = "";
      setBarStyle(SystemBarsStyle.Default);
    };
  }, []);

  // Track the card's height so a step change can glide from the old height to the new.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ro = new ResizeObserver(() => { cardHeight.current = card.offsetHeight; });
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  // Entrance — once, on mount.
  useGSAP(() => {
    const root = rootRef.current!;
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      const headline = root.querySelector('[data-sm="headline"]');
      const split = headline ? SplitText.create(headline, { type: "words,chars", mask: "words" }) : null;
      const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
      tl.fromTo(q(root, '[data-sm="mesh"]'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out", clearProps: "transform" }, 0)
        .fromTo(q(root, '[data-sm="card"]'), { opacity: 0, y: 48, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: EASE.spring }, 0.1);
      if (split) tl.from(split.chars, { yPercent: 110, duration: 0.7, stagger: 0.018, ease: EASE.spring }, 0.4);
      tl.fromTo(q(root, '[data-sm="sub"]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.7)
        .fromTo(q(root, '[data-sm="field"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.75)
        .fromTo(q(root, '[data-sm="cta"]'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: EASE.bounce, clearProps: "transform" }, 0.95);
      return () => split?.revert();
    });
    mm.add(REDUCED_MOTION, () => {
      gsap.fromTo(q(root, '[data-sm="card"], [data-sm="headline"], [data-sm="sub"], [data-sm="field"], [data-sm="cta"]'), { opacity: 0 }, { opacity: 1, duration: 0.3 });
    });
  }, { scope: rootRef });

  // Step change — glide the card to its new height and replay the content entrance.
  // A layout effect so the old height is applied before the browser paints the new step.
  useLayoutEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    mascotRef.current?.cheer();
    if (window.matchMedia(REDUCED_MOTION).matches) {
      gsap.fromTo(q(card, '[data-sm="headline"], [data-sm="sub"], [data-sm="field"], [data-sm="cta"]'), { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }
    const ctx = gsap.context(() => {
      const from = cardHeight.current;
      const to = card.offsetHeight;
      if (from && from !== to) {
        gsap.fromTo(card, { height: from }, { height: to, duration: 0.6, ease: EASE.glide, clearProps: "height" });
      }
      const headline = card.querySelector('[data-sm="headline"]');
      const split = headline ? SplitText.create(headline, { type: "words,chars", mask: "words" }) : null;
      const tl = gsap.timeline({ defaults: { ease: EASE.enter }, onComplete: () => split?.revert() });
      if (split) tl.from(split.chars, { yPercent: 110, duration: 0.6, stagger: 0.016, ease: EASE.spring }, 0.05);
      tl.fromTo(q(card, '[data-sm="sub"]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 }, 0.2)
        .fromTo(q(card, '[data-sm="field"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.25)
        .fromTo(q(card, '[data-sm="cta"]'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: EASE.bounce, clearProps: "transform" }, 0.4);
    }, root);
    return () => ctx.revert();
  }, [step]);

  // Error — the card grows to fit the message, gives a short shake, and the mascot
  // shakes its head. A layout effect for the same reason as the step change.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!error || !card) return;
    mascotRef.current?.nope();
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    const from = cardHeight.current;
    const to = card.offsetHeight;
    if (from && from !== to) {
      gsap.fromTo(card, { height: from }, { height: to, duration: 0.4, ease: EASE.glide, clearProps: "height" });
    }
    gsap.fromTo(card.querySelector('[role="alert"]'), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35, ease: EASE.enter, delay: 0.1 });
    gsap.fromTo(card, { x: 0 }, {
      keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.45, ease: "power1.out", clearProps: "x",
    });
  }, [error]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    // The keyboard's Next on the email field goes to the password.
    if (step === "credentials" && email && !password) {
      cardRef.current?.querySelector<HTMLInputElement>('input[type="password"]')?.focus();
      return;
    }
    if (step === "credentials") submitCredentials();
    else if (step === "method") submitMethod();
    else submitCode();
  };

  const forgotPassword = () => {
    Browser.open({ url: `${PLATFORM_ORIGIN}/users/password/new` }).catch(() => {});
  };

  const ctaLabel = { credentials: "Sign in", method: "Send code", code: "Verify and continue" }[step];

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "relative",
        isolation: "isolate",
        height: "100%",
        overflow: "hidden",
        bgcolor: PAGE_BG,
      }}
    >
      <MeshBackground data-sm="mesh" />

      <Box
        sx={{
          height: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          placeItems: "center",
          px: "20px",
          pt: `calc(24px + ${SAFE_TOP})`,
          pb: `calc(24px + ${SAFE_BOTTOM})`,
          [COMPACT]: { pt: `calc(8px + ${SAFE_TOP})`, pb: `calc(12px + ${SAFE_BOTTOM})` },
        }}
      >
        <Box
          data-sm="stage"
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            pt: `${peekHeight(MASCOT_W.regular)}px`,
            transition: `padding-top ${RESIZE}`,
            [COMPACT]: { pt: `${peekHeight(MASCOT_W.compact)}px` },
          }}
        >
          <Mascot
            ref={mascotRef}
            sx={{
              position: "absolute",
              zIndex: 0,
              top: 0,
              width: MASCOT_W.regular,
              left: peekLeft(MASCOT_W.regular),
              transition: `width ${RESIZE}, left ${RESIZE}`,
              [COMPACT]: { width: MASCOT_W.compact, left: peekLeft(MASCOT_W.compact) },
            }}
          />

          <Box
            ref={cardRef}
            data-sm="card"
            component="form"
            onSubmit={onSubmit}
            noValidate
            sx={{
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
              bgcolor: "#FFF",
              borderRadius: "20px",
              boxShadow: "0 24px 64px rgba(1, 0, 15, 0.35)",
              p: "28px 24px",
              [COMPACT]: { p: "20px 24px" },
            }}
          >
            <Typography
              key={step}
              data-sm="headline"
              component="h2"
              sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", color: TEXT }}
            >
              {copy.title}
            </Typography>
            <Typography data-sm="sub" sx={{ fontSize: 16, color: TEXT_MUTED, mt: "8px", mb: "24px", lineHeight: 1.3, [COMPACT]: { mt: "4px", mb: "16px" } }}>
              {copy.sub}
            </Typography>

            {error && (
              <Box
                role="alert"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  mb: "16px",
                  p: "10px 12px",
                  borderRadius: "8px",
                  bgcolor: "#FEF3F2",
                  color: "#B42318",
                  fontSize: 14,
                }}
              >
                <ErrorOutlineRoundedIcon sx={{ fontSize: 18 }} />
                {error}
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {step === "credentials" && (
                <>
                  <Box data-sm="field">
                    <Field label="Email" type="email" inputMode="email" placeholder="you@practice.com" autoComplete="username" enterKeyHint="next" value={email} onChange={setEmail} />
                  </Box>
                  <Box data-sm="field">
                    <Field label="Password" type="password" placeholder="Your password" autoComplete="current-password" enterKeyHint="go" value={password} onChange={setPassword} />
                  </Box>
                  <Box data-sm="field" sx={{ textAlign: "right", mt: "-4px" }}>
                    <Link component="button" type="button" underline="hover" onClick={forgotPassword} sx={{ fontSize: 14, fontWeight: 500, color: PURPLE, textUnderlineOffset: 3 }}>
                      Forgot password?
                    </Link>
                  </Box>
                </>
              )}

              {step === "method" && (
                <Box data-sm="field" role="radiogroup" sx={{ display: "flex", gap: "12px" }}>
                  <MethodOption
                    selected={method === "email"}
                    onClick={() => setMethod("email")}
                    icon={<MailOutlineRoundedIcon sx={{ fontSize: 20 }} />}
                    title="Email"
                    subtitle="Send it to my inbox"
                  />
                  <MethodOption
                    selected={method === "sms"}
                    onClick={() => setMethod("sms")}
                    icon={<SmsOutlinedIcon sx={{ fontSize: 20 }} />}
                    title="Text message"
                    subtitle="Send it to my phone"
                  />
                </Box>
              )}

              {step === "code" && (
                <Box data-sm="field">
                  <Field label="Verification code" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter code" enterKeyHint="go" value={code} onChange={setCode} autoFocus large />
                </Box>
              )}

              <Button
                data-sm="cta"
                type="submit"
                disabled={loading}
                disableElevation
                fullWidth
                sx={{
                  mt: "4px",
                  height: 48,
                  borderRadius: "999px",
                  textTransform: "none",
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "#FFF",
                  backgroundImage: `linear-gradient(100deg, ${PURPLE} 0%, ${SPARK} 100%)`,
                  transition: "box-shadow 140ms, transform 140ms, opacity 140ms",
                  "&:hover": { boxShadow: "0 8px 28px rgba(238, 53, 255, 0.35)" },
                  "&:active:not(.Mui-disabled)": { transform: "scale(0.97)" },
                  "&.Mui-disabled": { color: "#FFF", opacity: 0.6 },
                }}
              >
                {loading ? "One moment…" : ctaLabel}
              </Button>

              {step === "credentials" && signupEnabled && (
                <Typography sx={{ textAlign: "center", fontSize: 14, color: TEXT_MUTED }}>
                  New to Swiss Monkey?{" "}
                  <Link component="button" type="button" underline="hover" onClick={() => navigate("/signup")} sx={{ fontSize: 14, fontWeight: 500, color: PURPLE, verticalAlign: "baseline", textUnderlineOffset: 3 }}>
                    Sign up
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;

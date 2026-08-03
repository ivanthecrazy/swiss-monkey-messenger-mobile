import { ReactNode, useRef, useState } from "react";
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";

// Lightweight pull-to-refresh for a scrollable list. IS the scroll container, so
// it also forwards the native scroll event (used for infinite-scroll paging).
//
// When the user drags down while already at the top, the content follows the
// finger with resistance; releasing past the threshold fires onRefresh and holds
// a spinner until it settles. No dependency on Ionic — just touch math + MUI.
const THRESHOLD = 64; // px of pull needed to trigger
const MAX_PULL = 96; // px the indicator can travel
const RESISTANCE = 0.5; // finger-to-content movement ratio

type Props = {
  onRefresh: () => Promise<void> | void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

const PullToRefresh = ({ onRefresh, onScroll, children, sx }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0); // current visible offset
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only arm the gesture if the list is scrolled to the very top.
    if (refreshing) return;
    const el = scrollRef.current;
    startY.current = el && el.scrollTop <= 0 ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startY.current === null || refreshing) return;
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) { startY.current = null; setPull(0); return; }

    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPull(0); return; }
    setPull(Math.min(dy * RESISTANCE, MAX_PULL));
  };

  const onTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull < THRESHOLD) { setPull(0); return; }

    setRefreshing(true);
    setPull(THRESHOLD); // rest the spinner at the threshold while loading
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  };

  const active = pull > 0 || refreshing;

  return (
    <Box
      ref={scrollRef}
      onScroll={onScroll}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        position: "relative",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: pull,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: active ? 1 : 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <CircularProgress
          size={22}
          variant={refreshing ? "indeterminate" : "determinate"}
          value={Math.min((pull / THRESHOLD) * 100, 100)}
        />
      </Box>
      <Box
        sx={{
          transform: `translateY(${pull}px)`,
          transition: startY.current === null ? "transform 0.2s ease" : "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;

import { useAnimationControls } from "framer-motion";
import { useEffect } from "react";

export function useEnterAnimation() {
  const controls = useAnimationControls();

  const enter = async (element: HTMLElement | null) => {
    if (!element) return;

    await controls.start({
      opacity: [0, 1],
      scale: [0.5, 1],
      transition: { duration: 0.3 },
    });
  };

  return { enter };
}

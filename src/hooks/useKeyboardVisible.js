import { useEffect, useState } from "react";

export default function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    function handleFocusIn(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        setIsKeyboardVisible(true);
      }
    }

    function handleFocusOut(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        setTimeout(() => {
          const active = document.activeElement;
          if (
            active?.tagName !== "INPUT" &&
            active?.tagName !== "TEXTAREA"
          ) {
            setIsKeyboardVisible(false);
          }
        }, 60);
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    const vv = window.visualViewport;
    function handleResize() {
      if (!vv) return;
      const isShrunk = window.innerHeight - vv.height > 120;
      if (isShrunk) {
        setIsKeyboardVisible(true);
      } else {
        const active = document.activeElement;
        if (
          active?.tagName !== "INPUT" &&
          active?.tagName !== "TEXTAREA"
        ) {
          setIsKeyboardVisible(false);
        }
      }
    }

    if (vv) {
      vv.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (vv) {
        vv.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return isKeyboardVisible;
}

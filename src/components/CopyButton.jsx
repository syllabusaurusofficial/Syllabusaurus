import { useEffect, useRef, useState } from "react";

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Try the selection-based fallback for browsers that deny clipboard access.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  let copied = false;
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }

  if (!copied) {
    throw new Error("Copy command was not available.");
  }
}

export default function CopyButton({ text }) {
  const [status, setStatus] = useState("idle");
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    clearTimeout(resetTimer.current);
    try {
      await copyText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    resetTimer.current = setTimeout(() => setStatus("idle"), 1800);
  };

  return (
    <button className="copy-button" type="button" onClick={handleCopy}>
      {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : "Copy"}
    </button>
  );
}

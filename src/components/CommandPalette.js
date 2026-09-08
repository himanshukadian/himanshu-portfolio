import { useEffect } from "react";
import { ROUTES, navigateTo } from "../utils/cliNav";

// Runs inside the embedded portfolio (the iframe). The full-screen terminal lives
// in the parent window (HostTerminal); this relay forwards open requests, keeps
// single-key site navigation working, and applies navigation messages from the
// host terminal.
function CommandPalette() {
  useEffect(() => {
    const send = (type) => {
      try {
        window.parent && window.parent.postMessage({ type }, "*");
      } catch (e) {
        /* ignore */
      }
    };

    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable === true);
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        send("k9s:open");
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        send("k9s:help");
        return;
      }

      const k = e.key.toLowerCase();
      for (const r of ROUTES) {
        if (k === r.num || (r.aliases || []).includes(k)) {
          e.preventDefault();
          navigateTo(r.to);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);

    const onCustom = (e) => {
      if (e.type === "k9s:command") send("k9s:open");
      else if (e.type === "k9s:help") send("k9s:help");
    };
    window.addEventListener("k9s:command", onCustom);
    window.addEventListener("k9s:help", onCustom);

    const onMessage = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object" || d.type !== "k9s:nav") return;
      navigateTo(d.to);
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("k9s:command", onCustom);
      window.removeEventListener("k9s:help", onCustom);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}

export default CommandPalette;
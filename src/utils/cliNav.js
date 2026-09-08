import { resumeData } from "../data/resume";

export const ROUTES = [
  { cmd: "home", num: "1", aliases: ["h"], label: "home", to: "/" },
  { cmd: "about", num: "2", aliases: ["a"], label: "about", to: "/#about" },
  { cmd: "projects", num: "3", aliases: ["p"], label: "projects", to: "/#projects" },
  { cmd: "resume", num: "4", aliases: ["r"], label: "resume", to: "/#resume" },
  { cmd: "writing", num: "5", aliases: ["w"], label: "writings", to: "/#writing" },
  { cmd: "contact", num: "6", aliases: ["c"], label: "contact", to: "/#contact" },
  { cmd: "github", num: "g", aliases: ["gh"], label: "github", to: resumeData.github, external: true },
];

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  try {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch (e) {
    /* ignore */
  }
}

export function navigateTo(to) {
  if (!to) return;
  if (/^https?:\/\//.test(to)) {
    window.open(to, "_blank", "noopener,noreferrer");
    return;
  }
  if (to === "/") {
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    } else {
      try {
        history.replaceState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (e) {
        /* ignore */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }
  if (to.startsWith("/#")) {
    if (window.location.pathname !== "/") {
      window.location.href = to;
      return;
    }
    scrollToSection(to.slice(2));
    return;
  }
  window.location.href = to;
}

export function findCommand(input) {
  const q = String(input || "").trim().toLowerCase();
  if (!q) return { matches: [] };
  const exact = ROUTES.find(
    (r) => r.cmd === q || r.num === q || (r.aliases || []).includes(q)
  );
  if (exact) return { route: exact, exact: true };
  const matches = ROUTES.filter((r) => r.cmd.startsWith(q));
  if (matches.length === 1) return { route: matches[0], exact: false };
  return { matches };
}

export function suggestions(q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return ROUTES.map((r) => r);
  return ROUTES.filter(
    (r) =>
      r.cmd.startsWith(query) ||
      r.num === query ||
      (r.aliases || []).some((a) => a.startsWith(query))
  );
}
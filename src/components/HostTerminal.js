import React, { useState, useEffect, useRef, useCallback } from "react";
import { resumeData } from "../data/resume";
// Mirrors the on-disk "Himanshu Chaudhary Resume.pdf" (buildwithhimanshu.com).
const VFS = (() => {
  const exp = resumeData.experience || [];
  return {
    "~": {
      "README.md":
        `# ${resumeData.name}\n${resumeData.title}\nBackend • AI • Distributed Systems\n` +
        `Open source: ${resumeData.github}`,
      "about.me": `${resumeData.name} | ${resumeData.location}\n\n${resumeData.summary}`,
      "experience.md": exp
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.duration})\n  - ${e.highlights.join("\n  - ")}`
        )
        .join("\n\n"),
      "techstack.md":
        "Python · Java · AWS · Kafka · Docker · Kubernetes · Microservices · Distributed Systems · Generative AI",
      "contact.md":
        `email: ${resumeData.email}\nphone: ${resumeData.phone}\n` +
        `linkedin: ${resumeData.linkedin}\ngithub: ${resumeData.github}`,
      "resume.pdf":
        "PDF — download it from the site: 'View Resume' (hero) or the resume section.",
      projects: {
        "index.md":
          "6 professional (Amazon, Wayfair) + 3 open-source projects.\nRun: cat projects/priceiq.md",
        "priceiq.md":
          "priceIQ — global price intelligence (github.com/himanshukadian/priceIQ)",
        "speak2chatgpt.md":
          "Speak2ChatGPT — voice-enabled ChatGPT (github.com/himanshukadian/Speak2ChatGPT)",
        "grievance-portal.md":
          "Grievance Portal — NLP routing (github.com/himanshukadian)",
      },
      writing: "writing — see writing & articles at blog.buildwithhimanshu.com",
    },
  };
})();

const BUILTINS = ["cat", "cd", "clear", "date", "echo", "exit", "halo", "help", "ls", "open", "pwd", "resume", "whoami", "writing"];
const ALL_CMDS = [...BUILTINS];

const BACKEND =
  process.env.REACT_APP_BACKEND_URL || "https://himanshu-portfolio-api-e10b4543a453.herokuapp.com";
const HALO_AI_ENDPOINT = BACKEND + "/api/ai/chat";
const ARTICLES_ENDPOINT = BACKEND + "/api/articles";
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const RESUME_PDF =
  (typeof window !== "undefined" ? window.location.origin : "") + "/Himanshu_Chaudhary_Resume.pdf";

const inlineMdPattern =
  /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+?)\*\*|`([^`]+?)`|\*([^*]+?)\*|([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s)\]"']+)/g;

const LINK_STYLE = { color: "#6C63FF", textDecoration: "underline", cursor: "pointer" };

function renderInline(text, keyPrefix = 0) {
  const nodes = [];
  let last = 0;
  let key = keyPrefix;
  let m;
  inlineMdPattern.lastIndex = 0;
  while ((m = inlineMdPattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {m[1]}
        </a>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <a key={key++} href={m[4]} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {m[3]}
        </a>
      );
    } else if (m[5] !== undefined) {
      nodes.push(<strong key={key++}>{m[5]}</strong>);
    } else if (m[6] !== undefined) {
      nodes.push(<code key={key++}>{m[6]}</code>);
    } else if (m[7] !== undefined) {
      nodes.push(<em key={key++}>{m[7]}</em>);
    } else if (m[8] !== undefined) {
      const url = m[8].replace(/[.,;:!?]+$/, "");
      nodes.push(
        <a key={key++} href={url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {url}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderHaloLine(text, keyPrefix) {
  const m = String(text || "").match(/^#{1,6}\s+(.*)$/);
  if (m) {
    return [<strong key={keyPrefix} style={{ display: "block", marginTop: "4px" }}>{renderInline(m[1], keyPrefix + 1)}</strong>];
  }
  return renderInline(text, keyPrefix);
}

const isWritingListIntent = (raw) => {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return false;
  if (/(explain|summar|tell me|about|which|how|why|help|compare|describe|read |more details|what is|what's)/.test(q)) return false;
  return (
    /^(wrting|writin|writing|writings|artical|articles?|articals?|post|posts|blog|blogs|blog posts|what have you written|your articles|your writing|all your writing|all your articles|your blog posts|blogs you've written)$/.test(q) ||
    /^(list|show|show me|all|see|browse|get)\s+(your\s+|all\s+)?(writing|writings|articles?|articals?|posts|blog posts?)\s*$/.test(q)
  );
};

// ---- intro (typed on open) ----
const WELCOME_CMD = { text: "himanshu@portfolio:~$ whoami", cls: "cmd" };

// Important personal info -> white (name brightest), descriptions -> light gray.
const PROFILE_LINES = [
  { text: "", cls: "" },
  { text: resumeData.name, cls: "name" },
  { text: resumeData.title, cls: "accent" },
  { text: "Backend • AI • Distributed Systems", cls: "sec" },
  { text: "", cls: "" },
  { text: "5+ years building scalable systems,", cls: "sec" },
  { text: "AI-powered automation and developer tools.", cls: "sec" },
];

const TRY_LINES = [
  { text: "", cls: "" },
  { text: "Try:", cls: "dim" },
  { text: "  > open projects", cls: "suc" },
  { text: "  > cat experience", cls: "suc" },
  { text: "  > resume", cls: "suc" },
];

const INTRO_LINES = [WELCOME_CMD, ...PROFILE_LINES, ...TRY_LINES];
const INTRO_TEXT = INTRO_LINES.map((l) => l.text).join("\n");

const HALO_INTRO = [
  "HALO",
  "──────────────────────────────────",
  "",
  "AI assistant for Himanshu's portfolio",
  "",
  "You can ask me about:",
  "",
  "•  Experience",
  "•  Projects",
  "•  Technical skills",
  "•  Architecture",
  "•  Career",
  "",
  "Press ESC or type 'exit' to leave the agent.",
];

function resolveFile(segs) {
  const exact = nodeAt(segs);
  if (exact) return exact;
  const last = segs[segs.length - 1];
  if (!last) return null;
  const variants = [last + ".md", last + ".me"];
  for (const v of variants) {
    const target = nodeAt([...segs.slice(0, -1), v]);
    if (target) return target;
  }
  return null;
}

function pathSegments(arg, cwd) {
  const parts = String(arg || "").split("/");
  let segs = arg.startsWith("/") || parts[0] === "~" ? [] : [...cwd];
  for (const p of parts) {
    if (!p || p === ".") continue;
    if (p === "~") {
      segs = [];
      continue;
    }
    if (p === "..") {
      segs.pop();
      continue;
    }
    segs.push(p);
  }
  return segs;
}

function nodeAt(segs) {
  let node = VFS["~"];
  for (const s of segs) {
    if (!node || typeof node === "string") return null;
    node = node[s];
  }
  return node;
}

function HostTerminal({ siteIframeRef }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [typed, setTyped] = useState(0); 
  const [showIntro, setShowIntro] = useState(true);
  const [value, setValue] = useState("");
  const [cwd, setCwd] = useState([]);
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [haloMode, setHaloMode] = useState(false);
  const [haloBusy, setHaloBusy] = useState(false);
  const [haloLog, setHaloLog] = useState([]);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const writingCacheRef = useRef(null);
  const haloHistoryRef = useRef([]);

  const fetchWriting = useCallback(async () => {
    if (writingCacheRef.current && writingCacheRef.current.length) return writingCacheRef.current;
    const res = await fetch(ARTICLES_ENDPOINT);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const body = await res.json();
    const raw =
      body?.data?.articles ?? body?.payload?.articles ?? body?.articles ?? body;
    const list = Array.isArray(raw) ? raw : [];
    const articles = list.filter((a) => a.slug);
    articles.sort((a, b) =>
      a.publishedAt && b.publishedAt
        ? new Date(b.publishedAt) - new Date(a.publishedAt)
        : 0
    );
    writingCacheRef.current = articles;
    return articles;
  }, []);

  const promptStr = `himanshu@portfolio:~${cwd.length ? "/" + cwd.join("/") : ""}$`;
  const haloPrompt = "halo@portfolio:~$";

  const push = useCallback((text, cls = "out") => {
    setLines((prev) => [...prev, { text, cls }]);
  }, []);

  const pushBlock = useCallback((text, cls = "out") => {
    String(text)
      .split("\n")
      .forEach((t) => push(t, cls));
  }, [push]);

  // ---- HALO agent ----
  const logHalo = useCallback((line) => {
    setHaloLog((prev) => [...prev, line]);
  }, []);

  const startHalo = useCallback(() => {
    push("halo@portfolio:~$ halo", "cmd");
    HALO_INTRO.forEach((t) => push(t, t === "HALO" ? "suc" : t.startsWith("•") ? "sec" : t.includes("─") ? "dim" : t.includes("Press") ? "dim" : t === "" || t === "You can ask me about:" ? "" : "sec"));
    setHaloMode(true);
    setHaloBusy(false);
    setHaloLog([]);
  }, [push]);

  const exitHalo = useCallback(() => {
    setHaloMode(false);
    setHaloBusy(false);
    setHaloLog([]);
    push("exited HALO. type 'halo' to return.", "dim");
  }, [push]);

  const askHalo = useCallback(
    async (query) => {
      if (isWritingListIntent(query)) {
        setHaloBusy(true);
        setHaloLog(["fetching articles…"]);
        try {
          const articles = await fetchWriting();
          setHaloLog([]);
          if (!articles.length) {
            push("Halo: no articles found.", "sec");
            return;
          }
          push("", "");
          push("> writing — blog.buildwithhimanshu.com", "cmd");
          push("Himanshu's writing, articles & dev notes:", "sec");
          articles.forEach((a) => {
            const when = a.publishedAt
              ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
                  new Date(a.publishedAt)
                )
              : "—";
            const tag = Array.isArray(a.tags) && a.tags.length
                ? (typeof a.tags[0] === "string" ? a.tags[0] : a.tags[0]?.name)
                : a.tag || null;
            push(`▸ [${a.title}](https://blog.buildwithhimanshu.com/${a.slug})`, "suc");
            push(`    ${when}${tag ? ` · ${tag}` : ""}`, "sec");
          });
          push("click any link to read it in a new tab.", "dim");
        } catch (err) {
          setHaloLog([]);
          push("⚠️ Halo couldn't fetch the blog list — try again in a moment.", "err");
        } finally {
          setHaloBusy(false);
        }
        return;
      }

      setHaloBusy(true);
      setHaloLog(["searching portfolio…"]);
      try {
        const res = await fetch(HALO_AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, chatHistory: haloHistoryRef.current }),
        });
        if (res.status === 429) {
          setHaloLog([]);
          push("💨 rate limited — wait a moment and try again", "err");
          return;
        }
        if (!res.ok) {
          let msg = "";
          try {
            const body = await res.json();
            if (body && body.status === "error" && typeof body.message === "string") {
              msg = body.message;
            }
          } catch (e) {
            msg = "";
          }
          setHaloLog([]);
          push(msg || "⚠️ Halo couldn't reach the assistant service — try again in a moment.", "err");
          return;
        }
        const data = await res.json();
        const text = data.data?.response || data.response || "";
        if (!text) {
          setHaloLog([]);
          push("⚠️ Halo returned an empty response — try again.", "err");
          return;
        }
        setHaloLog([]);
        push("", "");
        pushBlock(text, "sec");
        const sources = data?.data?.writingSources || [];
        if (sources.length > 0) {
          push("sources:", "sec");
          sources.forEach((s) => {
            push(`  ▸ ${s.title}`, "suc");
            push(`    ${s.url}`, "dim");
          });
        }
        const h = haloHistoryRef.current;
        h.push({ type: "user", content: query });
        h.push({ type: "assistant", content: text });
        haloHistoryRef.current = h.slice(-20);
      } catch (err) {
        setHaloLog([]);
        push("⚠️ Halo couldn't reach the assistant service — try again in a moment.", "err");
      } finally {
        setHaloBusy(false);
      }
    },
    [push, pushBlock, fetchWriting]
  );

  const sendHalo = useCallback(
    (v) => {
      const q = String(v || "").trim();
      if (!q) return;
      push(`${haloPrompt} ${q}`, "cmd");
      if (/^(exit|quit|back)$/i.test(q)) {
        exitHalo();
        return;
      }
      if (/^(reset)$/i.test(q)) {
        haloHistoryRef.current = [];
        push("halo conversation cleared", "suc");
        return;
      }
      askHalo(q);
    },
    [haloPrompt, push, exitHalo, askHalo]
  );

  const close = useCallback(() => {
    setHaloMode(false);
    setHaloBusy(false);
    setHaloLog([]);
    setOpen(false);
    setValue("");
    setHistIndex(-1);
    if (siteIframeRef && siteIframeRef.current && siteIframeRef.current.contentWindow) {
      siteIframeRef.current.contentWindow.focus();
    }
  }, [siteIframeRef]);

  const printHelp = useCallback(() => {
    push("Available commands:", "suc");
    push("");
    push("Navigation", "suc");
    push("  cd <dir>     change directory", "sec");
    push("  ls [path]    list files", "sec");
    push("  pwd          print working directory", "sec");
    push("");
    push("Information", "suc");
    push("  whoami       who you're talking to", "sec");
    push("  cat <file>   read a file", "sec");
    push("  date         current date/time", "sec");
    push("");
    push("Actions", "suc");
    push("  clear        clear screen (Ctrl/Cmd+L)", "sec");
    push("  open <file>  view a file or folder", "sec");
    push("  resume       open the resume PDF", "sec");
    push("  halo         ask the AI agent about Himanshu", "sec");
    push("  halo reset   clear the HALO conversation", "sec");
    push("  writing [n]  list blog articles / open one", "sec");
    push("  help         show available commands", "sec");
    push("  exit         back to the website (or ESC)", "sec");
    push("");
    push("Shortcuts: TAB complete · ↑↓ history · ESC exit", "dim");
  }, [push]);

  const openTerminal = useCallback(
    (withHelp) => {
      setLines([]);
      setShowIntro(true);
      setTyped(0);
      setOpen(true);
      if (withHelp) printHelp();
    },
    [printHelp]
  );

  useEffect(() => {
    if (!open) return;
    if (REDUCED_MOTION) {
      setTyped(INTRO_TEXT.length);
      return;
    }
    let n = 0;
    const iv = setInterval(() => {
      n += 2;
      setTyped(n);
      if (n >= INTRO_TEXT.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [open]);

  const exec = useCallback(
    (raw) => {
      const input = String(raw || "").trim();
      if (!input) return;
      push(`${promptStr} ${input}`, "cmd");

      const [cmd, ...args] = input.split(/\s+/);
      const arg = args.join(" ");

      switch (cmd) {
        case "clear":
          setLines([{ text: haloMode ? haloPrompt : promptStr, cls: "cmd" }]);
          setShowIntro(false);
          if (haloMode) setHaloLog([]);
          return;
        case "halo":
          startHalo();
          return;
        case "help":
          printHelp();
          return;
        case "whoami":
          PROFILE_LINES.forEach((l) => push(l.text, l.cls));
          return;
        case "date":
          pushBlock(new Date().toString(), "sec");
          return;
        case "echo":
          pushBlock(arg, "sec");
          return;
        case "resume":
          window.open(RESUME_PDF, "_blank", "noopener,noreferrer");
          push("opening /Himanshu_Chaudhary_Resume.pdf …", "suc");
          return;
        case "exit":
          if (haloMode) {
            exitHalo();
            return;
          }
          close();
          return;
        case "pwd":
          pushBlock("/home/himanshu" + (cwd.length ? "/" + cwd.join("/") : ""), "sec");
          return;
        case "ls":
        case "dir": {
          const segs = arg ? pathSegments(arg, cwd) : cwd;
          const target = nodeAt(segs);
          if (!target || typeof target === "string") {
            push(`ls: cannot access '${arg || "."}': No such file or directory`, "err");
            return;
          }
          const names = Object.keys(target).sort();
          if (!names.length) {
            push("(empty)", "dim");
            return;
          }
          names.forEach((n) => push(typeof target[n] === "object" ? `${n}/` : n));
          return;
        }
        case "cd": {
          const segs = arg ? pathSegments(arg, cwd) : [];
          const target = nodeAt(segs);
          if (!target || typeof target === "string") {
            push(`cd: no such directory: ${arg}`, "err");
            return;
          }
          setCwd(segs);
          return;
        }
        case "cat": {
          if (!arg) {
            push("usage: cat <file>", "err");
            return;
          }
          const segs = pathSegments(arg, cwd);
          const target = resolveFile(segs);
          if (!target) {
            push(`cat: ${arg}: No such file or directory`, "err");
            return;
          }
          if (typeof target === "object") {
            push(`cat: ${arg}: Is a directory`, "err");
            return;
          }
          pushBlock(target, "sec");
          return;
        }
        case "open": {
          if (!arg) {
            push("usage: open <file|dir|site>", "err");
            return;
          }
          const segs = pathSegments(arg, cwd);
          if (segs[segs.length - 1] === "resume.pdf") {
            window.open(RESUME_PDF, "_blank", "noopener,noreferrer");
            push("opening /Himanshu_Chaudhary_Resume.pdf …", "suc");
            return;
          }
          const target = resolveFile(segs);
          if (target && typeof target === "string") {
            pushBlock(target, "sec");
            return;
          }
          if (target && typeof target === "object") {
            const index = target["index.md"];
            if (typeof index === "string") {
              pushBlock(index, "sec");
              return;
            }
            const names = Object.keys(target).sort();
            names.forEach((n) => push(typeof target[n] === "object" ? `${n}/` : n, "sec"));
            return;
          }
          push(`open: cannot open '${arg}'`, "err");
          return;
        }
        case "writing": {
          const wArg = raw.slice("writing".length).trim().toLowerCase();
          const openArticle = (slug, title) => {
            window.open("https://blog.buildwithhimanshu.com/" + slug, "_blank", "noopener,noreferrer");
            push(`opening ${title} …`, "suc");
          };
          const renderWriting = (articles) => {
            push("> writing — blog.buildwithhimanshu.com", "cmd");
            push("Himanshu's writing, articles & dev notes:", "sec");
            articles.forEach((a, i) => {
              push(`[${i + 1}] ${a.title}`, "out");
              const when = a.publishedAt
                ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
                    new Date(a.publishedAt)
                  )
                : "—";
              const tag = Array.isArray(a.tags) && a.tags.length
                  ? (typeof a.tags[0] === "string" ? a.tags[0] : a.tags[0]?.name)
                  : a.tag || null;
              push(`     ${when}${tag ? ` · ${tag}` : ""}`, "sec");
            });
            push("use 'writing <n>' to open an article, e.g. 'writing 1'", "dim");
          };
          const runWriting = async () => {
            if (wArg === "refresh") writingCacheRef.current = null;
            const cached = writingCacheRef.current && writingCacheRef.current.length;
            if (!cached) push("fetching articles…", "sec");
            let articles;
            try {
              articles = await fetchWriting();
            } catch (err) {
              push("writing: couldn't reach the blog API.", "err");
              return;
            }
            if (!articles.length) {
              push("writing: no articles found.", "sec");
              return;
            }
            if (/^\d+$/.test(wArg)) {
              const idx = parseInt(wArg, 10);
              const found = articles[idx - 1];
              if (found) openArticle(found.slug, found.title);
              else push(`writing: no article at index ${idx}`, "err");
              return;
            }
            if (wArg && wArg !== "refresh") {
              const hit = articles.find((a) => String(a.slug).toLowerCase().startsWith(wArg));
              if (hit) {
                openArticle(hit.slug, hit.title);
                return;
              }
            }
            renderWriting(articles);
          };
          runWriting();
          return;
        }
        default: {
          const q = String(cmd).toLowerCase();
          if (BUILTINS.some((b) => b.startsWith(q))) {
            push(`zsh: ${q} needs an argument — try 'help'`, "err");
            return;
          }
          push(`zsh: command not found: ${cmd} — try 'help'`, "err");
        }
      }
    },
    [cwd, promptStr, push, pushBlock, printHelp, close, haloMode, startHalo, exitHalo, fetchWriting]
  );

  // ---------------- completion candidates ----------------
  const buildMatches = useCallback(() => {
    if (!value.trim()) {
      return [...new Set(ALL_CMDS)].slice(0, 12);
    }
    const parts = value.trim().split(/\s+/);
    const prefix = parts[parts.length - 1];
    if (parts.length === 1) {
      return ALL_CMDS.filter((c) => c.startsWith(prefix)).slice(0, 12);
    }
    if (["cat", "cd", "ls", "open"].includes(parts[0])) {
      const dir = nodeAt(cwd);
      if (dir && typeof dir === "object") {
        return Object.keys(dir)
          .filter((n) => n.startsWith(prefix))
          .map((n) => (typeof dir[n] === "object" ? `${n}/` : n))
          .slice(0, 12);
      }
    }
    return [];
  }, [value, cwd]);

  const matches = buildMatches();

  const onInputKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([{ text: haloMode ? haloPrompt : promptStr, cls: "cmd" }]);
      setShowIntro(false);
      if (haloMode) setHaloLog([]);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (haloMode && haloBusy) return;
      const v = value;
      setValue("");
      if (v.trim()) setHistory((h) => [v, ...h.filter((x) => x !== v)].slice(0, 20));
      setHistIndex(-1);
      if (haloMode) sendHalo(v);
      else exec(v);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (matches.length) {
        const comp = matches[0];
        const parts = value.trim().split(/\s+/);
        parts[parts.length - 1] = comp.replace(/\/$/, "");
        setValue(parts.join(" "));
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (haloMode) {
        exitHalo();
        return;
      }
      close();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIndex === -1 ? 0 : Math.min(histIndex + 1, history.length - 1);
      setHistIndex(next);
      setValue(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === -1) return;
      const next = histIndex - 1;
      setHistIndex(next);
      setValue(next === -1 ? "" : history[next]);
      return;
    }
  };

  // Open triggered from the iframe site ('/terminal' button, '/', '?', help).
  useEffect(() => {
    const onMessage = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "k9s:open") openTerminal(false);
      else if (d.type === "k9s:help") openTerminal(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [openTerminal]);

  // Standalone key handling at the desktop level (focus on chrome/desktop).
  useEffect(() => {
    const onKey = (e) => {
      if (open) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable === true);
      if (typing) return;
      if (e.key === "/") {
        e.preventDefault();
        openTerminal(false);
      } else if (e.key === "?") {
        e.preventDefault();
        openTerminal(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openTerminal]);

  useEffect(() => {
    if (open && inputRef.current && !haloBusy) inputRef.current.focus();
  }, [open, haloBusy]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, typed, haloLog, haloBusy]);

  if (!open) return null;

  return (
    <div className="host-terminal-layer" role="presentation" onClick={close}>
      <div
        className="host-terminal-window"
        role="dialog"
        aria-label="Terminal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="resume-terminal-titlebar">
          <div className="resume-terminal-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="resume-terminal-title">
            {haloMode ? "HALO — AI agent — type your question" : "portfolio@himanshu:~/portfolio — bash — 110×40"}
          </div>
          <div className="resume-terminal-title host-terminal-title-right">ESC to exit</div>
        </div>

        <div className="k9s-term-body" ref={bodyRef}>
          {showIntro &&
            INTRO_TEXT.slice(0, typed)
              .split("\n")
              .map((t, i) => (
                <div key={`wi-${i}`} className={`k9s-term-line ${INTRO_LINES[i] ? INTRO_LINES[i].cls : ""}`}>
                  {t}
                  {typed < INTRO_TEXT.length && i === INTRO_TEXT.slice(0, typed).split("\n").length - 1 && (
                    <span className="k9s-term-cursor" />
                  )}
                </div>
              ))}
          {lines.map((l, i) => (
            <div key={i} className={`k9s-term-line ${l.cls || ""}`}>
              {renderHaloLine(l.text, i)}
            </div>
          ))}
          {haloMode &&
            (haloBusy ? (
              <div className="k9s-term-line k9s-term-halo">
                <span className="k9s-term-halo-spinner">●</span>
                {haloLog.length ? haloLog[haloLog.length - 1] : "thinking…"}
              </div>
            ) : (
              haloLog.map((h, i) => (
                <div key={`hl-${i}`} className="k9s-term-line k9s-term-halo sec">
                  {h}
                </div>
              ))
            ))}
        </div>

        {matches.length > 0 && !haloMode && (
          <div className="k9s-term-matchrow">
            {matches.map((m) => (
              <span key={m} className="k9s-term-match">
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="k9s-palette-line">
          <span className="k9s-palette-prompt">
              {haloMode ? (haloBusy ? `${haloPrompt} (busy…)` : haloPrompt) : promptStr}
            </span>
          <input
            ref={inputRef}
            className="k9s-palette-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={haloMode ? (haloBusy ? "HALO is thinking…" : "ask HALO about Himanshu…") : "type a command…"}
            spellCheck={false}
            autoComplete="off"
            disabled={haloBusy}
            aria-label={haloMode ? "HALO question input" : "Command input"}
          />
          <span className="k9s-palette-hints">
            {haloMode ? "enter to ask · exit to leave" : "TAB complete · ↑↓ history · ESC quit"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default HostTerminal;
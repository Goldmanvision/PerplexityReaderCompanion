(() => {
  "use strict";
  if (typeof globalThis.__preaderOpenInspector === "function") {
    globalThis.__preaderOpenInspector();
    return;
  }
  const hostId = "preader-inspector-host";
  const previous = document.getElementById(hostId);
  if (previous) previous.remove();

  function describe(el) {
    if (!el) return null;
    const attrs = {};
    for (const name of [
      "role", "data-testid", "data-message-author-role",
      "data-state", "data-language"
    ]) {
      if (el.hasAttribute(name)) {
        attrs[name] = el.getAttribute(name).slice(0, 180);
      }
    }
    return {
      tag: el.tagName.toLowerCase(),
      classes: Array.from(el.classList).slice(0, 18),
      attributes: attrs
    };
  }

  function capture() {
  const all = Array.from(document.querySelectorAll("pre"));
  const report = {
    inspectorVersion: "0.1.0",
    capturedAt: new Date().toISOString(),
    pageOrigin: location.origin,
    pagePath: location.pathname,
    scope: "Current DOM only; no conversation text or code bodies included.",
    completeness: "Older or virtualized content may be absent.",
    codeElementCount: document.querySelectorAll("code").length,
    readyState: document.readyState,
    alternativeCandidates: Array.from(document.querySelectorAll(
      'code, [class*="code-block"], [class*="codeBlock"], [data-testid*="code"]'
    )).slice(-16).map((el) => ({
      element: describe(el),
      characters: el.textContent.length,
      ancestors: (() => {
        const result = [];
        let node = el.parentElement;
        for (let i = 0; node && i < 5; i++, node = node.parentElement) {
          result.push(describe(node));
        }
        return result;
      })()
    })),
    copyControlCandidates: Array.from(document.querySelectorAll(
      "button, [role='button']"
    )).filter((el) => {
      const label = [
        el.getAttribute("aria-label") || "",
        el.getAttribute("title") || "",
        (el.textContent || "").trim().slice(0, 100)
      ].join(" ");
      return /copy/i.test(label) && !el.closest("#preader-inspector-host");
    }).slice(-16).map((el) => ({
      element: describe(el),
      ancestors: (() => {
        const result = [];
        let node = el.parentElement;
        for (let i = 0; node && i < 6; i++, node = node.parentElement) {
          result.push(describe(node));
        }
        return result;
      })()
    })),
    preCount: all.length,
    sampledLast: Math.min(all.length, 12),
    blocks: all.slice(-12).map((pre, index) => {
      const code = pre.querySelector("code");
      const ancestors = [];
      let parent = pre.parentElement;
      for (let i = 0; parent && i < 7; i++, parent = parent.parentElement) {
        ancestors.push(describe(parent));
      }
      return {
        position: all.length - Math.min(all.length, 12) + index + 1,
        pre: describe(pre),
        code: describe(code),
        characters: (code || pre).textContent.length,
        lines: (code || pre).textContent.split("\n").length,
        visible: pre.getClientRects().length > 0,
        ancestors
      };
    })
  };

  return JSON.stringify(report, null, 2);
  }
  let text = capture();
  const host = document.createElement("div");
  host.id = hostId;
  host.style.cssText =
    "all:initial!important;position:fixed!important;inset:20px!important;" +
    "z-index:2147483647!important;display:block!important;";
  const shadow = host.attachShadow({mode: "open"});
  const style = document.createElement("style");
  style.textContent = `
    :host{color-scheme:dark}
    section{box-sizing:border-box;height:100%;display:flex;flex-direction:column;
      gap:10px;padding:18px;background:#10141a;color:#d5dce6;
      border:2px solid #3d8bd4;border-radius:8px;
      font:14px/1.5 system-ui,sans-serif;box-shadow:0 8px 40px #000}
    h2{font-size:18px;margin:0}
    p{margin:0}
    textarea{box-sizing:border-box;flex:1;min-height:100px;width:100%;
      resize:none;background:#080c10;color:#b7e4c7;border:1px solid #506070;
      padding:12px;font:12px/1.5 Consolas,monospace}
    footer{display:flex;gap:12px;align-items:center}
    button{background:#1e2631;color:#fff;border:1px solid #6485a6;
      padding:7px 14px;border-radius:4px;cursor:pointer;font:inherit}
    button:focus-visible{outline:2px solid #00ffff}
  `;
  const panel = document.createElement("section");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Reader structural inspection");
  const heading = document.createElement("h2");
  heading.textContent = "Perplexity Reader Companion - structural inspection";
  const note = document.createElement("p");
  note.textContent =
    "No code bodies or conversation text included. Review before sharing.";
  const area = document.createElement("textarea");
  area.readOnly = true;
  area.setAttribute("aria-label", "Inspection report");
  area.value = text;
  const footer = document.createElement("footer");
  const copy = document.createElement("button");
  copy.textContent = "Copy report";
  const close = document.createElement("button");
  close.textContent = "Close";
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Report copied.";
    } catch (error) {
      area.focus();
      area.select();
      status.textContent = "Clipboard unavailable. Press Ctrl+C to copy selected report.";
    }
  });
  // Close collapses the inspector instead of removing it.
  const refresh = document.createElement("button");
  refresh.textContent = "Rescan now";
  refresh.addEventListener("click", () => {
    text = capture();
    area.value = text;
    status.textContent = "Fresh snapshot captured. Click Copy report.";
  });
  const reopen = document.createElement("button");
  reopen.textContent = "Inspect / Rescan";
  reopen.style.cssText =
    "position:fixed;right:12px;top:12px;z-index:2147483647;" +
    "background:#10141a;color:#b7e4c7;border:1px solid #6485a6;" +
    "padding:8px 12px;cursor:pointer;";
  reopen.addEventListener("click", () => {
    panel.style.display = "flex";
    host.style.setProperty("inset", "20px", "important");
    host.style.setProperty("pointer-events", "auto", "important");
    reopen.hidden = true;
    text = capture();
    area.value = text;
    status.textContent = "Fresh snapshot captured.";
    copy.focus();
  });
  close.addEventListener("click", () => {
    panel.style.display = "none";
    host.style.setProperty("pointer-events", "none", "important");
    reopen.style.pointerEvents = "auto";
    reopen.hidden = false;
  });
  reopen.hidden = true;
  footer.append(refresh, copy, close, status);
  panel.append(heading, note, area, footer);
  shadow.append(style, panel, reopen);
  document.documentElement.append(host);
  globalThis.__preaderOpenInspector = () => reopen.click();
  reopen.style.setProperty("display", "none", "important");
  close.click();
})();
/* Perplexity Reader Companion: bottom-copy prototype 1 */
(() => {
  "use strict";
  if (globalThis.__preaderBottomCopyInstalled) return;
  globalThis.__preaderBottomCopyInstalled = true;

  const entries = new Map();

  function skipRunConfirm() {
    try { return localStorage.getItem("preader.skipConfirmRun") === "1"; } catch (e) { return false; }
  }

  /* DoDA result-to-prompt: after a run, wait for the host to report new clipboard text, then add it to the composer. Never submits. */
  const RESULT_KEY = "preader.sendResultToPrompt";
  function resultToPromptOn() {
    try { return localStorage.getItem(RESULT_KEY) === "1"; } catch (e) { return false; }
  }
  function autoSendOn() {
    try { return localStorage.getItem("preader.autoSendResult") === "1"; } catch (e) { return false; }
  }
  globalThis.__dodaResultToPrompt = async function (runResp, statusEl) {
    const say = (s) => { if (statusEl) { statusEl.textContent = s; } };
    if (!resultToPromptOn()) { return; }
    if (!runResp || !runResp.ok || !runResp.sha256) { return; }
    if (globalThis.__dodaResultBusy) { say("A result wait is already in progress."); return; }
    globalThis.__dodaResultBusy = true;
    try {
      const notSha = String(runResp.sha256);
      for (let i = 0; i < 4; i++) {
        say("Waiting for the script to put its output on the clipboard (" + (i * 25) + " s)...");
        const r = await iseSend({action: "await-clipboard", notSha256: notSha, timeoutMs: 25000});
        if (!r || !r.ok) { say("Result wait failed: " + ((r && r.error) || "unknown error") + ". Nothing inserted."); return; }
        if (r.changed && typeof r.text === "string") {
          const found = Array.from(document.querySelectorAll('div[role="textbox"][contenteditable="true"][data-lexical-editor="true"]')).filter((el) => el.getClientRects().length > 0 && !el.closest("#preader-toolbar-host"));
          if (found.length !== 1) { say("Result received (" + r.chars + " characters) but the composer was not found or not unique. Nothing inserted. The text is still on the clipboard."); return; }
          const c = found[0];
          const had = (c.textContent || "").trim().length > 0;
          const text = (had ? "\n\n" : "") + r.text;
          const before = (c.textContent || "").length;
          c.focus();
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(c);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
          try {
            const dt = new DataTransfer();
            dt.setData("text/plain", text);
            c.dispatchEvent(new ClipboardEvent("paste", {clipboardData: dt, bubbles: true, cancelable: true}));
          } catch (e) {}
          await new Promise((res) => setTimeout(res, 150));
          let ok = (c.textContent || "").length > before;
          if (!ok) { ok = document.execCommand("insertText", false, text); }
          if (ok && autoSendOn() && !had) {
            const getSubmit = () => {
              const s = Array.from(document.querySelectorAll('button[aria-label="Submit"]')).filter((el) => el.getClientRects().length > 0);
              return s.length === 1 ? s[0] : null;
            };
            const t0 = Date.now();
            let btn = getSubmit();
            while ((!btn || btn.disabled) && Date.now() - t0 < 2000) {
              await new Promise((res) => setTimeout(res, 50));
              btn = getSubmit();
            }
            if (!btn) { say("Inserted " + r.chars + " characters but the Submit button was not found or not unique. Not sent."); return; }
            if (btn.disabled) { say("Inserted " + r.chars + " characters but Submit did not enable. Not sent; the text is in the composer."); return; }
            if ((c.textContent || "").replace(/\s+/g, "") !== r.text.replace(/\s+/g, "")) { say("Composer text differs from the result. Not sent; the text is in the composer."); return; }
            btn.click();
            say("Sent " + r.chars + " characters of script output. Delivery is not verified.");
            return;
          }
          say(ok ? "Inserted " + r.chars + " characters of script output into the prompt box. Not submitted" + (autoSendOn() && had ? " (a draft was present, so it was not sent)." : ".") : "Insert was not accepted. The text is still on the clipboard.");
          return;
        }
      }
      say("The script did not change the clipboard within about 100 seconds. Nothing inserted.");
    } catch (error) {
      say("Result wait failed. Nothing inserted.");
    } finally {
      globalThis.__dodaResultBusy = false;
    }
  };

  function iseSend(payload) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({type: "doda-ise", payload}, (resp) => {
          if (chrome.runtime.lastError) { resolve({ok: false, error: chrome.runtime.lastError.message}); return; }
          resolve(resp || {ok: false, error: "No reply."});
        });
      } catch (error) {
        resolve({ok: false, error: "Extension was reloaded. Refresh this page. " + error.message});
      }
    });
  }
  let timer = 0;

  function findCode(pre) {
    const figure = pre.querySelector("figure");
    if (!figure || !figure.querySelector("figcaption")) return null;
    const codes = figure.querySelectorAll("code");
    return codes.length === 1 ? codes[0] : null;
  }

  function addControl(pre) {
    const host = document.createElement("div");
    host.setAttribute("data-preader-bottom-copy", "1");
    host.style.cssText = "display:block;margin:4px 0 12px;";
    const shadow = host.attachShadow({mode: "open"});

    const style = document.createElement("style");
    style.textContent = `
      :host{color-scheme:dark}
      .bar{display:flex;align-items:center;justify-content:flex-end;
        flex-wrap:wrap;gap:10px;background:#10141a;color:#d5dce6;
        border:1px solid #3d536a;border-radius:4px;padding:7px 10px;
        font:13px/1.5 system-ui,sans-serif}
      button{background:#1e2631;color:#b7e4c7;border:1px solid #6485a6;
        border-radius:4px;padding:5px 12px;cursor:pointer;font:inherit}
      button:hover{border-color:#00ffff;color:#fff}
      button:focus-visible{outline:2px solid #00ffff;outline-offset:2px}
      button:disabled{opacity:.6;cursor:wait}
      .status{overflow-wrap:anywhere}
      textarea{box-sizing:border-box;display:block;width:100%;
        min-height:150px;background:#080c10;color:#b7e4c7;
        border:1px solid #6485a6;font:12px/1.5 Consolas,monospace}
      [hidden]{display:none!important}
    `;

    const bar = document.createElement("div");
    bar.className = "bar";
    const status = document.createElement("span");
    status.className = "status";
    status.setAttribute("role", "status");

    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Copy this block";
    copy.title = "Copy this block's current code text; does not execute it";

    const fallback = document.createElement("textarea");
    fallback.hidden = true;
    fallback.readOnly = true;
    fallback.setAttribute("aria-label", "Code text for manual copying");

    copy.addEventListener("click", async () => {
      const code = pre.isConnected ? findCode(pre) : null;
      if (!code) {
        status.textContent = "Block changed or is unavailable. Nothing copied.";
        return;
      }
      const text = code.textContent;
      if (!text) {
        status.textContent = "Block is empty. Nothing copied.";
        return;
      }

      fallback.hidden = true;
      fallback.value = "";
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(text);
        const changed = !code.isConnected || code.textContent !== text;
        status.textContent =
          `Copied ${text.length.toLocaleString()} characters / ` +
          `${text.split("\n").length.toLocaleString()} lines.` +
          (changed ? " Block changed during copying; review before use." : "");
      } catch (error) {
        fallback.value = text;
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
        status.textContent =
          "Clipboard write failed. Press Ctrl+C to copy the selected code.";
      } finally {
        copy.disabled = false;
      }
    });

        const run = document.createElement("button");
    run.type = "button";
    run.textContent = "Run in ISE";
    run.title = "Confirm, then replace the contents of the selected tab in the oldest open PowerShell ISE window with this block and run it (ISE must be idle; unsaved text in that tab is lost)";
    run.addEventListener("click", async () => {
      const code = pre.isConnected ? findCode(pre) : null;
      if (!code) { status.textContent = "Block changed or is unavailable. Nothing sent."; return; }
      const text = code.textContent;
      if (!text || !text.trim()) { status.textContent = "Block is empty. Nothing sent."; return; }
      const lineCount = text.split("\n").length;
      const firstLine = (text.split("\n").find((l) => l.trim()) || "").trim().slice(0, 120);
      const ok = skipRunConfirm() || window.confirm("Run this block in PowerShell ISE?\n\n" + lineCount + " lines, " + text.length + " characters.\nFirst line: " + firstLine + "\n\nIt replaces the contents of the selected tab in the oldest open ISE window. Unsaved text in that tab is lost. ISE must be idle.");
      if (!ok) { status.textContent = "Cancelled. Nothing sent."; return; }
      run.disabled = true;
      if (globalThis.__dodaResultBusy) { status.textContent = "A result wait is in progress. Nothing sent."; run.disabled = false; return; }
      status.textContent = "Sending to ISE...";
      const resp = await iseSend({action: "run", code: text, execute: true});
      status.textContent = resp.ok ? "Sent " + resp.chars + " characters to ISE (pid " + resp.isePid + ") and pressed F5." : "Not sent: " + (resp.error || "unknown error");
      if (resp.ok && globalThis.__dodaResultToPrompt) { await globalThis.__dodaResultToPrompt(resp, status); }
      run.disabled = false;
    });
    bar.append(status, copy, run);
    shadow.append(style, bar, fallback);
    pre.insertAdjacentElement("afterend", host);
    entries.set(pre, host);
  }

  function scan() {
    timer = 0;
    for (const [pre, host] of entries) {
      if (!pre.isConnected || !findCode(pre)) {
        host.remove();
        entries.delete(pre);
      }
    }
    for (const pre of document.querySelectorAll("pre")) {
      if (!findCode(pre)) continue;
      const host = entries.get(pre);
      if (!host) {
        addControl(pre);
      } else if (pre.nextElementSibling !== host) {
        pre.insertAdjacentElement("afterend", host);
      }
    }
  }

  function schedule() {
    if (!timer) timer = setTimeout(scan, 250);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  scan();
})();

/* Perplexity Reader Companion: fixed-toolbar prototype 1 */
(() => {
  "use strict";
  if (globalThis.__preaderToolbarInstalled) return;
  globalThis.__preaderToolbarInstalled = true;

  const host = document.createElement("div");
  host.id = "preader-toolbar-host";
  host.style.cssText =
    "all:initial!important;position:fixed!important;" +
    "left:0!important;right:0!important;top:0!important;" +
    "z-index:2147483646!important;display:block!important;";
  const shadow = host.attachShadow({mode: "open"});
  const style = document.createElement("style");
  style.textContent = `
    :host{color-scheme:dark}
    section{box-sizing:border-box;width:100%;padding:8px 14px;
      background:#10141a;color:#d5dce6;border:1px solid #6485a6;
      border-radius:0;box-shadow:0 3px 14px #0008;
      font:12px/1.45 system-ui,sans-serif}
    nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    strong{color:#b7e4c7;margin-right:4px}
    button{background:#1e2631;color:#d5dce6;border:1px solid #6485a6;
      border-radius:6px;padding:6px 14px;min-width:46px;min-height:42px;cursor:pointer;font:inherit;font-size:20px;line-height:1;font-family:"Segoe UI Symbol","Segoe UI Emoji",system-ui,sans-serif}
    button:hover{border-color:#00ffff}
    button:focus-visible{outline:2px solid #00ffff;outline-offset:2px}
    button:disabled{opacity:.6;cursor:wait}
    p{margin:6px 0 0;overflow-wrap:anywhere;font-size:14px}
    textarea{box-sizing:border-box;width:100%;height:150px;margin-top:6px;
      background:#080c10;color:#b7e4c7;font:12px/1.5 Consolas,monospace}
    select{background:#1e2631;color:#d5dce6;border:1px solid #6485a6;border-radius:6px;padding:6px 10px;font:inherit;font-size:18px;min-height:42px;max-width:190px;cursor:pointer}
    select:focus-visible{outline:2px solid #00ffff;outline-offset:2px}
    button[aria-label="Stop"]:disabled{cursor:default}
    nav + nav{margin-top:8px}
    nav > button,nav > select{flex:1 1 0;min-width:46px;max-width:none}
    [hidden]{display:none!important}
  `;

  const panel = document.createElement("section");
  panel.setAttribute("aria-label", "Perplexity Companion toolbar");
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Companion actions");
  const title = document.createElement("strong");
  title.textContent = "Companion";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const idle =
    "Loaded DOM only; assistant ownership and response completion unverified.";
  status.textContent = idle;
  const fallback = document.createElement("textarea");
  fallback.readOnly = true;
  fallback.hidden = true;
  fallback.setAttribute("aria-label", "Code for manual copying");

    function iseSend(payload) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({type: "doda-ise", payload}, (resp) => {
          if (chrome.runtime.lastError) { resolve({ok: false, error: chrome.runtime.lastError.message}); return; }
          resolve(resp || {ok: false, error: "No reply."});
        });
      } catch (error) {
        resolve({ok: false, error: "Extension was reloaded. Refresh this page. " + error.message});
      }
    });
  }
  function button(label, action) {
    const el = document.createElement("button");
    el.type = "button";
    el.textContent = label;
    el.addEventListener("click", action);
    return el;
  }

  function lastBlock() {
    const matches = Array.from(document.querySelectorAll("pre"))
      .map((pre) => {
        const figure = pre.querySelector("figure");
        if (!figure || !figure.querySelector("figcaption")) return null;
        const codes = figure.querySelectorAll("code");
        if (codes.length !== 1 || !pre.getClientRects().length) return null;
        return {pre, code: codes[0]};
      }).filter(Boolean);
    return matches.length ? matches[matches.length - 1] : null;
  }

  const jump = button("Jump to last loaded block", () => {
    const target = lastBlock();
    if (!target) {
      status.textContent = "No matching rendered code block is loaded.";
      return;
    }
    target.pre.scrollIntoView({behavior: "smooth", block: "center"});
    status.textContent =
      "Jumped to last matching loaded block. Clipboard unchanged.";
  });

  const clear = button("Clear feedback", () => {
    fallback.hidden = true;
    fallback.value = "";
    status.textContent = idle;
    for (const blockHost of document.querySelectorAll(
      '[data-preader-bottom-copy="1"]'
    )) {
      const root = blockHost.shadowRoot;
      if (!root) continue;
      for (const message of root.querySelectorAll('[role="status"]')) {
        message.textContent = "";
      }
      for (const area of root.querySelectorAll("textarea")) {
        area.value = "";
        area.hidden = true;
      }
    }
  });

  const inspect = button("Inspector", () => {
    if (typeof globalThis.__preaderOpenInspector === "function") {
      globalThis.__preaderOpenInspector();
    } else {
      status.textContent = "Inspector unavailable. Reload the extension and page.";
    }
  });

  const QUICK_REPLIES = [
    { label: "\u{1F44D}", title: "Insert and send: yes / approved / go", text: "yes / approved / go" },
    { label: "\u2705", title: "Insert and send: All tests successful.", text: "All tests successful." },
    { label: "\u23ED", title: "Insert and send: next", text: "next" }
  ];

  function findComposer() {
    const found = Array.from(document.querySelectorAll(
      'div[role="textbox"][contenteditable="true"][data-lexical-editor="true"]'
    )).filter((el) => el.getClientRects().length > 0 && !el.closest("#preader-toolbar-host"));
    return found.length === 1 ? found[0] : null;
  }

  function findSubmit() {
    const found = Array.from(document.querySelectorAll('button[aria-label="Submit"]'))
      .filter((el) => el.getClientRects().length > 0);
    return found.length === 1 ? found[0] : null;
  }

  function waitFor(test, ms) {
    return new Promise((resolve) => {
      const start = Date.now();
      (function poll() {
        const value = test();
        if (value) { resolve(value); return; }
        if (Date.now() - start >= ms) { resolve(null); return; }
        setTimeout(poll, 50);
      })();
    });
  }

  let quickBusy = false;
  async function quickReply(reply) {
    if (quickBusy) { status.textContent = "A quick reply is already in progress. Nothing sent."; return; }
    quickBusy = true;
    try {
      const composer = findComposer();
      if (!composer) { status.textContent = "Composer not found or not unique. Nothing sent."; return; }
      if (!findSubmit()) { status.textContent = "Submit button not found. Nothing inserted or sent."; return; }
      if ((composer.textContent || "").trim().length > 0) {
        status.textContent = "Draft present in the composer. Nothing inserted or sent.";
        return;
      }
      composer.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(composer);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      const inserted = document.execCommand("insertText", false, reply.text);
      if (!inserted) { status.textContent = "Insert was not accepted. Nothing sent."; return; }
      const submit = await waitFor(() => {
        const b = findSubmit();
        return b && !b.disabled ? b : null;
      }, 2000);
      if (!submit) {
        status.textContent = "Text inserted but Submit did not enable. Nothing sent; the text is still in the composer.";
        return;
      }
      if ((composer.textContent || "").trim() !== reply.text) {
        status.textContent = "Composer text changed unexpectedly. Nothing sent.";
        return;
      }
      submit.click();
      status.textContent = "Sent: " + reply.text + ". Delivery is not verified.";
    } catch (error) {
      status.textContent = "Quick reply failed. Nothing further was done.";
    } finally {
      quickBusy = false;
    }
  }

  const quickButtons = QUICK_REPLIES.map((reply) => {
    const el = button(reply.label, () => quickReply(reply));
    el.title = reply.title;
    el.setAttribute("aria-label", reply.title);
    return el;
  });

  const CHROME_KEY = "preaderHideSiteChrome";
  const CHROME_CSS = 'aside:has(nav[aria-label="Sidebar navigation"]),div[class~="h-headerHeight"]{display:none!important}';
  let chromeStyle = null;

  function chromeMatches() {
    const side = Array.from(document.querySelectorAll("aside")).filter(
      (a) => a.querySelector('nav[aria-label="Sidebar navigation"]')).length;
    const head = document.querySelectorAll('div[class~="h-headerHeight"]').length;
    return {side, head};
  }

  function setChrome(on) {
    if (on) {
      if (!chromeStyle) {
        chromeStyle = document.createElement("style");
        chromeStyle.id = "preader-hide-site-chrome";
        chromeStyle.textContent = CHROME_CSS;
        document.documentElement.append(chromeStyle);
      }
    } else if (chromeStyle) {
      chromeStyle.remove();
      chromeStyle = null;
    }
    try { localStorage.setItem(CHROME_KEY, on ? "1" : "0"); } catch (error) {}
    sym(chromeBtn, on ? "\u229E" : "\u229F", on ? "Show site UI" : "Hide site UI");
    const m = chromeMatches();
    status.textContent = (on ? "Site rail and header hidden. " : "Site rail and header shown. ") +
      "Matched: side rail " + m.side + ", header " + m.head + ".";
  }

  const chromeBtn = button("Hide site UI", () => setChrome(!chromeStyle));
  chromeBtn.title = "Hide or show Perplexity's left rail and thread header";
  let chromeSaved = null;
  try { chromeSaved = localStorage.getItem(CHROME_KEY); } catch (error) {}
  if (chromeSaved === "1") setChrome(true);
  const RA_RATES = [0.8, 1, 1.25, 1.5, 1.75, 2];
  const RA = {state: "idle", epoch: 0, units: [], i: 0, lastEl: null, styled: false,
    rate: 1, voiceName: null};
  try {
    const savedRate = parseFloat(localStorage.getItem("preaderRaRate"));
    if (RA_RATES.includes(savedRate)) RA.rate = savedRate;
    RA.voiceName = localStorage.getItem("preaderRaVoice");
  } catch (error) {}
  const raSupported = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  const raHighlight = !!(window.CSS && window.CSS.highlights && window.Highlight);

  function raVoices() {
    let all = [];
    try { all = window.speechSynthesis.getVoices() || []; } catch (error) {}
    const en = all.filter((v) => /^en([-_]|$)/i.test(v.lang));
    const rank = (v) => (/^en[-_]US/i.test(v.lang) ? 0 : 2) + (/Natural/i.test(v.name) ? 0 : 1);
    const list = en.slice().sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    return list.length ? list : all;
  }

  function raVoice() {
    const list = raVoices();
    return list.find((v) => v.name === RA.voiceName) || list[0] || null;
  }

  function raClear() {
    if (raHighlight) { try { window.CSS.highlights.delete("ra-word"); } catch (error) {} }
  }

  function raMap(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement &&
        node.parentElement.closest('pre,button,script,style,[aria-hidden="true"]'))
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const parts = [];
    let text = "";
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const value = node.nodeValue;
      if (!value) continue;
      parts.push({node, start: text.length, end: text.length + value.length});
      text += value;
    }
    return {el, text, parts};
  }

  function raSplit(text) {
    const out = [];
    let i = 0;
    const n = text.length;
    while (i < n) {
      let end = Math.min(n, i + 220);
      if (end < n) {
        const win = text.slice(i, end);
        const m = Math.max(win.lastIndexOf(". "), win.lastIndexOf("? "),
          win.lastIndexOf("! "), win.lastIndexOf("; "), win.lastIndexOf(", "));
        if (m > 60) {
          end = i + m + 2;
        } else {
          const sp = win.lastIndexOf(" ");
          if (sp > 60) end = i + sp + 1;
        }
      }
      const piece = text.slice(i, end);
      if (piece.trim()) out.push({start: i, text: piece});
      i = end;
    }
    return out;
  }

  function raMark(map, idx) {
    if (map.el !== RA.lastEl) {
      RA.lastEl = map.el;
      map.el.scrollIntoView({behavior: "smooth", block: "center"});
    }
    if (!raHighlight) return;
    const part = map.parts.find((p) => idx >= p.start && idx < p.end);
    if (!part) return;
    const m = /^\S+/.exec(map.text.slice(idx, part.end));
    const len = m ? m[0].length : 1;
    const range = document.createRange();
    range.setStart(part.node, idx - part.start);
    range.setEnd(part.node, idx - part.start + len);
    window.CSS.highlights.set("ra-word", new window.Highlight(range));
  }

  function raUi() {
    sym(raPlay, RA.state === "playing" ? "\u275A\u275A" : "\u25B6\uFE0E", RA.state === "idle" ? "Read aloud" : (RA.state === "playing" ? "Pause" : "Resume"));
    raStopBtn.disabled = RA.state === "idle";
    raSpeed.textContent = RA.rate + "\u00D7";
  }

  function raStop(message) {
    RA.epoch++;
    try { window.speechSynthesis.cancel(); } catch (error) {}
    RA.state = "idle";
    RA.units = [];
    RA.lastEl = null;
    raClear();
    raUi();
    if (message) status.textContent = message;
  }

  function raSpeak(ep, i) {
    if (ep !== RA.epoch) return;
    if (i >= RA.units.length) { raStop("Finished reading."); return; }
    RA.i = i;
    const unit = RA.units[i];
    const ut = new window.SpeechSynthesisUtterance(unit.text);
    ut.rate = RA.rate;
    const voice = raVoice();
    if (voice) { ut.voice = voice; ut.lang = voice.lang; }
    ut.onboundary = (ev) => {
      if (ep === RA.epoch && unit.map && typeof ev.charIndex === "number") {
        raMark(unit.map, unit.start + ev.charIndex);
      }
    };
    ut.onend = () => { if (ep === RA.epoch) raSpeak(ep, i + 1); };
    ut.onerror = (ev) => {
      if (ep !== RA.epoch) return;
      if (ev.error === "interrupted" || ev.error === "canceled") return;
      raStop("Speech error: " + ev.error + ". Reading stopped.");
    };
    if (unit.map) raMark(unit.map, unit.start);
    window.speechSynthesis.speak(ut);
  }

  function raStart() {
    if (!raSupported) { status.textContent = "Speech synthesis is not available on this page."; return; }
    if (raVoices().length === 0) { status.textContent = "No voices loaded yet. Try again in a moment."; return; }
    const sel = window.getSelection();
    const selText = sel && !sel.isCollapsed ? sel.toString().trim() : "";
    const units = [];
    let source = "";
    if (selText) {
      for (const c of raSplit(selText)) units.push({map: null, start: c.start, text: c.text});
      source = "selected text, no word highlight";
    } else {
      const roots = Array.from(document.querySelectorAll('div[class~="prose"]'))
        .filter((el) => !el.closest("#preader-toolbar-host"));
      const root = roots.length ? roots[roots.length - 1] : null;
      if (!root) { status.textContent = "No prose block is loaded. Nothing to read."; return; }
      const sel2 = "p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th";
      const blocks = Array.from(root.querySelectorAll(sel2))
        .filter((el) => !el.closest("pre") && !el.querySelector(sel2));
      for (const el of blocks) {
        const map = raMap(el);
        if (!map.text.trim()) continue;
        for (const c of raSplit(map.text)) units.push({map, start: c.start, text: c.text});
      }
      source = "last loaded prose block, assistant ownership unverified, code blocks skipped";
    }
    if (!units.length) { status.textContent = "Nothing readable found."; return; }
    raStop(null);
    if (!RA.styled) {
      const s = document.createElement("style");
      s.id = "preader-ra-style";
      s.textContent = "::highlight(ra-word){background-color:#ffd54a;color:#000}";
      document.documentElement.append(s);
      RA.styled = true;
    }
    RA.units = units;
    RA.state = "playing";
    const ep = RA.epoch;
    raUi();
    const v = raVoice();
    status.textContent = "Reading " + units.length + " chunks from " + source + ". Speed " + RA.rate + "\u00D7. Escape stops.";
    try { window.speechSynthesis.cancel(); window.speechSynthesis.resume(); } catch (error) {}
    setTimeout(() => raSpeak(ep, 0), 60);
  }

  const raPlay = button("Read aloud", () => {
    if (RA.state === "idle") {
      raStart();
    } else if (RA.state === "playing") {
      try { window.speechSynthesis.pause(); } catch (error) {}
      RA.state = "paused";
      raUi();
      status.textContent = "Paused.";
    } else {
      try { window.speechSynthesis.resume(); } catch (error) {}
      RA.state = "playing";
      raUi();
      status.textContent = "Resumed.";
    }
  });
  const raStopBtn = button("Stop", () => raStop("Stopped."));
  const raSpeed = button(RA.rate + "\u00D7", () => {
    RA.rate = RA_RATES[(RA_RATES.indexOf(RA.rate) + 1) % RA_RATES.length];
    try { localStorage.setItem("preaderRaRate", String(RA.rate)); } catch (error) {}
    raUi();
    status.textContent = "Speed " + RA.rate + "\u00D7. Applies from the next chunk.";
  });
  raSpeed.title = "Reading speed (click to change)";
  const raVoiceSel = document.createElement("select");
  raVoiceSel.setAttribute("aria-label", "Voice");
  raVoiceSel.title = "Voice (English voices only)";
  function raVoiceLabel(v) {
    return v.name.replace(/^Microsoft\s+/, "").replace(/\s+-\s+English\s+\((.*)\)\s*$/, " \u00B7 $1");
  }
  function raFillVoices() {
    const list = raVoices();
    const cur = raVoice();
    raVoiceSel.textContent = "";
    const head = document.createElement("option");
    head.value = "";
    head.textContent = "Voice";
    head.hidden = true;
    raVoiceSel.append(head);
    for (const v of list) {
      const opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = (cur && v.name === cur.name ? "\u2713 " : "\u2003") + raVoiceLabel(v);
      raVoiceSel.append(opt);
    }
    raVoiceSel.selectedIndex = 0;
  }
  function raSyncVoices() {
    if (raVoiceSel.options.length !== raVoices().length + 1) raFillVoices();
  }
  raVoiceSel.addEventListener("change", () => {
    if (!raVoiceSel.value) return;
    RA.voiceName = raVoiceSel.value;
    try { localStorage.setItem("preaderRaVoice", RA.voiceName); } catch (error) {}
    status.textContent = "Voice changed. Applies from the next chunk.";
    raFillVoices();
  });
  raVoiceSel.addEventListener("focus", raSyncVoices);
  raVoiceSel.addEventListener("mousedown", raSyncVoices);
  try { window.speechSynthesis.addEventListener("voiceschanged", raFillVoices); } catch (error) {}
  raFillVoices();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && RA.state !== "idle") raStop("Stopped.");
  });
  window.addEventListener("pagehide", () => {
    try { window.speechSynthesis.cancel(); } catch (error) {}
  });
  function raStarts() {
    const s = [];
    RA.units.forEach((u, j) => {
      if (j === 0 || u.map !== RA.units[j - 1].map) s.push(j);
    });
    return s;
  }

  function raJump(dir) {
    if (RA.state === "idle" || !RA.units.length) {
      status.textContent = "Not reading. Start Read aloud first.";
      return;
    }
    if (!RA.units[RA.i].map) {
      status.textContent = "Selected text is a single passage.";
      return;
    }
    const starts = raStarts();
    let cur = 0;
    for (let k = 0; k < starts.length; k++) {
      if (starts[k] <= RA.i) cur = k;
    }
    let target;
    if (dir > 0) {
      if (cur + 1 >= starts.length) { status.textContent = "This is the last passage."; return; }
      target = cur + 1;
    } else {
      target = RA.i > starts[cur] ? cur : Math.max(0, cur - 1);
    }
    RA.epoch++;
    const ep = RA.epoch;
    try { window.speechSynthesis.cancel(); window.speechSynthesis.resume(); } catch (error) {}
    RA.state = "playing";
    RA.lastEl = null;
    raClear();
    raUi();
    status.textContent = "Passage " + (target + 1) + " of " + starts.length + ".";
    setTimeout(() => raSpeak(ep, starts[target]), 60);
  }

  const raPrev = button("\u25C2\u00B6", () => raJump(-1));
  const raNext = button("\u00B6\u25B8", () => raJump(1));

  function sym(el, glyph, label) {
    el.textContent = glyph;
    el.title = label;
    el.setAttribute("aria-label", label);
  }
  sym(jump, "\u21A7", "Jump to last loaded block");
  sym(clear, "\u232B", "Clear feedback");
  sym(inspect, "\u25CE", "Inspector");
  sym(raStopBtn, "\u25A0", "Stop");
  sym(raPrev, "\u25C2\u00B6", "Previous passage");
  sym(raNext, "\u00B6\u25B8", "Next passage");
  sym(chromeBtn, chromeStyle ? "\u229E" : "\u229F", chromeStyle ? "Show site UI" : "Hide site UI");
  raUi();
  function scrollParentOf(el) {
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 4) return p;
    }
    const root = document.scrollingElement;
    return root && root.scrollHeight > root.clientHeight + 4 ? root : null;
  }

  const jumpBottom = button("\u21CA", () => {
    const prose = Array.from(document.querySelectorAll('div[class~="prose"]'))
      .filter((el) => !el.closest("#preader-toolbar-host"));
    const anchor = prose.length ? prose[prose.length - 1] : document.body;
    const box = scrollParentOf(anchor);
    if (!box) { status.textContent = "No scrollable thread container found."; return; }
    box.scrollTo({top: box.scrollHeight, behavior: "smooth"});
    status.textContent = "Scrolled to the bottom of the loaded thread.";
  });
  sym(jumpBottom, "\u21CA", "Jump to bottom of page");

  const DOCK_KEY = "preaderDock";
  const DOCK_SEL = '#root div[class~="h-dvh"][class~="flex"][class~="isolate"]';
  let dockMode = "top";
  let dockWant = "bottom";
  let dockStyle = null;
  let dockObserver = null;

  function dockBarHeight() {
    document.documentElement.style.setProperty(
      "--preader-bar-h", Math.ceil(panel.getBoundingClientRect().height) + "px");
  }

  function setDock(mode, quiet) {
    let bottom = mode === "bottom";
    const matches = document.querySelectorAll(DOCK_SEL).length;
    if (bottom && matches !== 1) {
      bottom = false;
      if (!quiet) {
        status.textContent = "Bottom dock unavailable: layout selector matched " + matches +
          " elements. Toolbar stays at the top.";
      }
    }
    dockMode = bottom ? "bottom" : "top";
    host.style.setProperty("top", bottom ? "auto" : "0", "important");
    host.style.setProperty("bottom", bottom ? "0" : "auto", "important");
    panel.style.boxShadow = bottom ? "0 -3px 14px #0008" : "0 3px 14px #0008";
    if (bottom) {
      if (!dockStyle) {
        dockStyle = document.createElement("style");
        dockStyle.id = "preader-dock-style";
        dockStyle.textContent = DOCK_SEL +
          "{height:calc(100dvh - var(--preader-bar-h, 0px))!important;min-height:0!important}";
        document.documentElement.append(dockStyle);
      }
      dockBarHeight();
      if (!dockObserver && window.ResizeObserver) {
        dockObserver = new ResizeObserver(() => { if (dockMode === "bottom") dockBarHeight(); });
        dockObserver.observe(panel);
      }
    } else {
      if (dockStyle) { dockStyle.remove(); dockStyle = null; }
      document.documentElement.style.removeProperty("--preader-bar-h");
    }
    sym(dockBtn, bottom ? "\u25B2" : "\u25BC",
      bottom ? "Dock toolbar at top" : "Dock toolbar at bottom");
    if (!quiet && mode === dockMode) {
      status.textContent = bottom ? "Toolbar docked at the bottom." : "Toolbar docked at the top.";
    }
    if (mode === dockMode) {
      try { localStorage.setItem(DOCK_KEY, dockMode); } catch (error) {}
    }
  }

  const dockBtn = button("\u25BC", () => {
    dockWant = dockMode === "bottom" ? "top" : "bottom";
    setDock(dockWant, false);
  });
  try { dockWant = localStorage.getItem(DOCK_KEY) || "bottom"; } catch (error) {}
  setDock(dockWant, true);
  let dockTries = 0;
  (function dockPoll() {
    if (dockWant !== "bottom" || dockMode === "bottom" || dockTries++ > 40) return;
    setDock("bottom", true);
    if (dockMode !== "bottom") setTimeout(dockPoll, 500);
  })();
  const SUG_KEY = "preaderHideSuggest";
  const SUG_ROW = 'div[class~="isolate"][class~="-mx-3"][class~="flex"][class~="items-start"]';
  let sugOn = true;
  let sugStyle = null;
  let sugTimer = 0;
  let sugObserver = null;
  let sugCount = 0;

  function sugBlocks() {
    const rows = Array.from(document.querySelectorAll(SUG_ROW)).filter((row) => {
      if (row.closest("#preader-toolbar-host")) return false;
      const len = (row.innerText || "").length;
      return row.querySelectorAll("button").length === 1 &&
        row.querySelectorAll("svg").length === 1 && len >= 5 && len <= 160 &&
        row.getBoundingClientRect().height <= 64;
    });
    const parents = new Set(rows.map((r) => r.parentElement));
    const blocks = [];
    for (const p of parents) {
      const mine = rows.filter((r) => r.parentElement === p);
      const sum = mine.reduce((n, r) => n + (r.innerText || "").length, 0);
      let block = p;
      while (block.parentElement && block.parentElement.children.length === 1 &&
        (block.parentElement.innerText || "").length <= sum + 40) {
        block = block.parentElement;
      }
      if ((block.innerText || "").length <= sum + 40) blocks.push(block);
    }
    return blocks;
  }

  function sugScan() {
    sugTimer = 0;
    for (const el of document.querySelectorAll('[data-preader-hide="1"]')) {
      el.removeAttribute("data-preader-hide");
    }
    sugCount = 0;
    if (!sugOn) return;
    for (const block of sugBlocks()) {
      block.setAttribute("data-preader-hide", "1");
      sugCount++;
    }
  }

  function sugSchedule() {
    if (sugTimer) return;
    sugTimer = setTimeout(sugScan, 300);
  }

  function setSuggest(on, quiet) {
    sugOn = on;
    if (on && !sugStyle) {
      sugStyle = document.createElement("style");
      sugStyle.id = "preader-hide-suggest-style";
      sugStyle.textContent = '[data-preader-hide="1"]{display:none!important}';
      document.documentElement.append(sugStyle);
    }
    if (on && !sugObserver) {
      sugObserver = new MutationObserver(sugSchedule);
      sugObserver.observe(document.body || document.documentElement, {childList: true, subtree: true});
    }
    if (!on && sugObserver) { sugObserver.disconnect(); sugObserver = null; }
    sugScan();
    try { localStorage.setItem(SUG_KEY, on ? "1" : "0"); } catch (error) {}
    sym(suggestBtn, on ? "\u2298" : "\u2299",
      on ? "Show suggested follow-ups" : "Hide suggested follow-ups");
    if (!quiet) {
      status.textContent = on
        ? "Suggested follow-ups hidden. Matched blocks: " + sugCount + "."
        : "Suggested follow-ups shown.";
    }
  }

  const suggestBtn = button("\u2298", () => setSuggest(!sugOn, false));
  let sugSaved = "1";
  try { sugSaved = localStorage.getItem(SUG_KEY) || "1"; } catch (error) {}
  setSuggest(sugSaved !== "0", true);
  const runLast = button("Run last block", async () => {
    const target = lastBlock();
    if (!target || !target.code.isConnected) { status.textContent = "No matching rendered code block is loaded. Nothing sent."; return; }
    const text = target.code.textContent;
    if (!text || !text.trim()) { status.textContent = "Last block is empty. Nothing sent."; return; }
    const lineCount = text.split("\n").length;
    const firstLine = (text.split("\n").find((l) => l.trim()) || "").trim().slice(0, 120);
    const ok = readFlag(SKIP_RUN_KEY) || window.confirm("Run the last code block in PowerShell ISE?\n\n" + lineCount + " lines, " + text.length + " characters.\nFirst line: " + firstLine + "\n\nIt replaces the contents of the selected tab in the oldest open ISE window. Unsaved text in that tab is lost. ISE must be idle.");
    if (!ok) { status.textContent = "Cancelled. Nothing sent."; return; }
    const again = lastBlock();
    if (!again || again.code.textContent !== text) { status.textContent = "Last block changed while confirming. Nothing sent."; return; }
    runLast.disabled = true;
    if (globalThis.__dodaResultBusy) { status.textContent = "A result wait is in progress. Nothing sent."; runLast.disabled = false; return; }
    status.textContent = "Sending last block to ISE...";
    const resp = await iseSend({action: "run", code: text, execute: true});
    status.textContent = resp.ok ? "Sent last block, " + resp.chars + " characters, to ISE (pid " + resp.isePid + ") and pressed F5." : "Not sent: " + (resp.error || "unknown error");
    if (resp.ok && globalThis.__dodaResultToPrompt) { await globalThis.__dodaResultToPrompt(resp, status); }
    runLast.disabled = false;
  });
  sym(runLast, "\u26A1\uFE0E", "Run last block in ISE");
  const SKIP_RUN_KEY = "preader.skipConfirmRun";
  function readFlag(key) {
    try { return localStorage.getItem(key) === "1"; } catch (e) { return false; }
  }
  function flagButton(key, onLabel, offLabel, tip) {
    const b = button(offLabel, () => {
      const next = !readFlag(key);
      try { localStorage.setItem(key, next ? "1" : "0"); } catch (e) {}
      paint();
      status.textContent = (next ? "Confirmation skipped for " : "Confirmation on for ") + tip + ".";
    });
    function paint() {
      const on = readFlag(key);
      b.textContent = on ? onLabel : offLabel;
      b.setAttribute("aria-pressed", String(on));
    }
    b.title = "Toggle the confirmation dialog for " + tip + ". Off means one click runs the code.";
    paint();
    return b;
  }
  const skipRunBtn = flagButton(SKIP_RUN_KEY, "ISE runs: no confirm", "ISE runs: confirm", "Run in ISE and Run last block");
    const SEND_RESULT_KEY = "preader.sendResultToPrompt";
  const sendResultBtn = button("Result to prompt: off", () => {
    const next = !readFlag(SEND_RESULT_KEY);
    try { localStorage.setItem(SEND_RESULT_KEY, next ? "1" : "0"); } catch (e) {}
    paintResult();
    status.textContent = next ? "After ISE runs, new clipboard output will be added to the prompt box (not submitted)." : "Results will not be sent to the prompt box.";
  });
  function paintResult() {
    const on = readFlag(SEND_RESULT_KEY);
    sendResultBtn.textContent = on ? "Result to prompt: on" : "Result to prompt: off";
    sendResultBtn.setAttribute("aria-pressed", String(on));
  }
  sendResultBtn.title = "After Run in ISE or Run last block, wait for the script to copy its output, then add it to the prompt box. Does not submit. Off by default.";
  paintResult();

    const AUTO_SEND_KEY = "preader.autoSendResult";
  const autoSendBtn = button("Auto-send result: off", () => {
    const next = !readFlag(AUTO_SEND_KEY);
    if (next && !window.confirm("Auto-send submits script output to Perplexity without a review step. It needs Result to prompt on, an empty prompt box, and a unique enabled Submit button.\n\nTurn auto-send on?")) { status.textContent = "Auto-send left off."; return; }
    try { localStorage.setItem(AUTO_SEND_KEY, next ? "1" : "0"); } catch (e) {}
    paintAuto();
    status.textContent = next ? "Auto-send on: results are submitted after insert when the checks pass." : "Auto-send off: results are inserted only.";
  });
  function paintAuto() {
    const on = readFlag(AUTO_SEND_KEY);
    autoSendBtn.textContent = on ? "Auto-send result: on" : "Auto-send result: off";
    autoSendBtn.setAttribute("aria-pressed", String(on));
  }
  autoSendBtn.title = "After a result is inserted into an empty prompt box, click Submit when the checks pass. Needs Result to prompt on. Off by default.";
  paintAuto();

  const settingsRow = document.createElement("nav");
  settingsRow.setAttribute("aria-label", "Companion settings");
  settingsRow.hidden = true;
  settingsRow.append(chromeBtn, dockBtn, suggestBtn, raVoiceSel, raSpeed, clear, skipRunBtn, sendResultBtn, autoSendBtn, inspect);
  const settingsBtn = button("\u2699\uFE0E", () => {
    settingsRow.hidden = !settingsRow.hidden;
    settingsBtn.setAttribute("aria-expanded", String(!settingsRow.hidden));
  });
  sym(settingsBtn, "\u2699\uFE0E", "Settings");
  settingsBtn.setAttribute("aria-expanded", "false");
  nav.append(jump, jumpBottom, runLast, ...quickButtons, raPlay, raStopBtn, raPrev, raNext, settingsBtn);
  panel.append(nav, settingsRow, status, fallback);
  shadow.append(style, panel);
  document.documentElement.append(host);
})();

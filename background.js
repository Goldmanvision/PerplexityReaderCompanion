chrome.action.onClicked.addListener(async (tab) => {
  try {
    const url = new URL(tab.url || "");
    if (url.protocol !== "https:" ||
        !["perplexity.ai", "www.perplexity.ai"].includes(url.hostname)) {
      await chrome.action.setBadgeText({tabId: tab.id, text: "SITE"});
      return;
    }
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ["inspect.js"]
    });
    await chrome.action.setBadgeText({tabId: tab.id, text: ""});
  } catch (error) {
    console.error("Reader inspector:", error);
    if (tab.id) {
      await chrome.action.setBadgeText({tabId: tab.id, text: "ERR"});
    }
  }
});

/* DoDA ISE runner relay (added 2026-11-25): perplexity.ai tabs of this extension only; actions peek, run, run-clipboard. */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== "doda-ise" || sender.id !== chrome.runtime.id || !sender.tab) return false;
  let host = "";
  try { host = new URL(sender.tab.url || "").hostname; } catch (e) {}
  if (host !== "perplexity.ai" && host !== "www.perplexity.ai") {
    sendResponse({ok: false, error: "Not a Perplexity page."});
    return false;
  }
  const p = msg.payload || {};
  if (["peek", "run", "run-clipboard", "await-clipboard"].indexOf(p.action) < 0) {
    sendResponse({ok: false, error: "Action not allowed."});
    return false;
  }
  const out = {action: p.action};
  if (p.action === "run") { out.code = String(p.code || ""); out.execute = p.execute === true; }
  if (p.action === "run-clipboard") { out.expectSha256 = String(p.expectSha256 || ""); out.execute = p.execute === true; }
  if (p.action === "await-clipboard") { out.notSha256 = String(p.notSha256 || ""); out.timeoutMs = Number(p.timeoutMs) || 25000; }
  chrome.runtime.sendNativeMessage("com.doda.ise_runner", out, (resp) => {
    if (chrome.runtime.lastError) { sendResponse({ok: false, error: chrome.runtime.lastError.message}); return; }
    sendResponse(resp || {ok: false, error: "No reply from host."});
  });
  return true;
});

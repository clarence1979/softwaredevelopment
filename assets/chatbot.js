/*! Digital Vector — Study Assistant (client-side, no API key)
 *  Search mode (BM25) works everywhere. If Ollama is running locally
 *  (http://localhost:11434) it upgrades to full sentence answers.
 *  Built for Clarence's Solutions.  */
(function () {
  "use strict";
  if (window.__DV_CHAT__) return;            // guard double-load
  if (window.self !== window.top) return;    // don't render inside the hub's iframe
  window.__DV_CHAT__ = true;

  /* ---------- locate self / paths ---------- */
  var me = document.currentScript ||
    [].slice.call(document.querySelectorAll("script")).filter(function (s) {
      return /chatbot\.js(\?|$)/.test(s.src);
    })[0];
  var SELF = (me && me.src) || location.href;
  var ASSET_BASE = new URL(".", SELF);            // .../assets/
  var SITE_ROOT = new URL("../", SELF);           // site root
  var CORPUS_URL = new URL("chatbot-corpus.js", ASSET_BASE).href;
  var OLLAMA = "http://localhost:11434";
  var LOGO = "data:image/png;base64,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";
  var CAP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#b9a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-5"/></svg>';

  function hubReady(){ try { return (typeof openSub==='function') && (typeof openTab==='function') && (typeof UNITS!=='undefined'); } catch(e){ return false; } }
  function url2unit(){ var o={}; try { if (typeof UNITS!=='undefined') for (var k in UNITS) o[UNITS[k]]=k; } catch(e){} return o; }

  /* ---------- tiny helpers ---------- */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function tokenise(t) { return (String(t).toLowerCase().match(/[a-z0-9]+/g)) || []; }

  /* ---------- BM25 retriever ---------- */
  function BM25(chunks) {
    this.chunks = chunks; this.N = chunks.length;
    this.k1 = 1.5; this.b = 0.75;
    this.docs = new Array(this.N); this.len = new Array(this.N);
    var df = Object.create(null), total = 0;
    for (var i = 0; i < this.N; i++) {
      var toks = tokenise(chunks[i][1]);
      this.len[i] = toks.length; total += toks.length;
      var tf = Object.create(null), seen = Object.create(null);
      for (var j = 0; j < toks.length; j++) {
        var w = toks[j]; tf[w] = (tf[w] || 0) + 1;
        if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; }
      }
      this.docs[i] = tf;
    }
    this.avgdl = total / Math.max(1, this.N);
    this.idf = Object.create(null);
    for (var t in df) this.idf[t] = Math.log(1 + (this.N - df[t] + 0.5) / (df[t] + 0.5));
  }
  BM25.prototype.search = function (q, k) {
    var qt = tokenise(q); if (!qt.length) return [];
    var sc = new Float64Array(this.N);
    for (var i = 0; i < this.N; i++) {
      var tf = this.docs[i], dl = this.len[i], s = 0;
      for (var j = 0; j < qt.length; j++) {
        var t = qt[j], f = tf[t]; if (!f) continue;
        var idf = this.idf[t] || 0;
        s += idf * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * dl / this.avgdl));
      }
      sc[i] = s;
    }
    var idx = []; for (var m = 0; m < this.N; m++) if (sc[m] > 0) idx.push(m);
    idx.sort(function (a, b) { return sc[b] - sc[a]; });
    return idx.slice(0, k || 5).map(function (i) { return { i: i, score: sc[i] }; });
  };

  /* ---------- state ---------- */
  var corpus = null, bm25 = null, indexing = false;
  var ollama = { available: false, model: null, models: [] };

  /* ---------- corpus load + index ---------- */
  function loadCorpus(cb) {
    if (corpus) return cb();
    if (window.DV_CHAT_CORPUS) { corpus = window.DV_CHAT_CORPUS; return cb(); }
    var s = el("script", { src: CORPUS_URL });
    s.onload = function () { corpus = window.DV_CHAT_CORPUS; cb(); };
    s.onerror = function () { cb(new Error("corpus load failed")); };
    document.head.appendChild(s);
  }
  function ensureIndex(cb) {
    if (bm25) return cb();
    if (indexing) return setTimeout(function () { ensureIndex(cb); }, 80);
    indexing = true;
    loadCorpus(function (err) {
      if (err || !corpus) { indexing = false; return cb(err || new Error("no corpus")); }
      // build off the main paint
      setTimeout(function () {
        bm25 = new BM25(corpus.chunks); indexing = false; cb();
      }, 10);
    });
  }

  /* ---------- Ollama (optional, local) ---------- */
  function detectOllama(cb) {
    var ctl = new AbortController(); var to = setTimeout(function () { ctl.abort(); }, 1600);
    fetch(OLLAMA + "/api/tags", { signal: ctl.signal })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        clearTimeout(to);
        var models = (j && j.models ? j.models.map(function (m) { return m.name; }) : []);
        ollama.models = models;
        ollama.available = models.length > 0;
        if (ollama.available) {
          var pref = models.filter(function (n) { return /llama3|llama-3|qwen|mistral|phi/i.test(n); })[0];
          ollama.model = pref || models[0];
        } else ollama.model = null;
        cb && cb();
      })
      .catch(function () { clearTimeout(to); ollama.available = false; ollama.model = null; cb && cb(); });
  }

  /* ---------- one-command local-AI setup ---------- */
  function osType() {
    var p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
    if (/win/.test(p)) return "win";
    if (/mac|iphone|ipad/.test(p)) return "mac";
    return "linux";
  }
  function ollamaCmd() {
    var os = osType();
    if (os === "win") return "winget install --id Ollama.Ollama -e --accept-source-agreements; $env:Path=[Environment]::GetEnvironmentVariable('Path','Machine')+';'+[Environment]::GetEnvironmentVariable('Path','User'); [Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS','*','User'); $env:OLLAMA_ORIGINS='*'; ollama pull llama3.2; Get-Process '*ollama*' -EA SilentlyContinue | Stop-Process -Force; ollama serve";
    if (os === "mac") return "brew install ollama; OLLAMA_ORIGINS='*' ollama serve & sleep 4; ollama pull llama3.2";
    return "curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2 && OLLAMA_ORIGINS='*' ollama serve";
  }
  function ollamaScript() {
    var os = osType();
    if (os === "win") return { name: "setup-ollama.ps1", mime: "text/plain",
      body: "# Clarence's Solutions - local AI setup\nwinget install --id Ollama.Ollama -e --accept-source-agreements\n# Refresh PATH so this session can see the freshly-installed 'ollama'\n$env:Path=[Environment]::GetEnvironmentVariable('Path','Machine')+';'+[Environment]::GetEnvironmentVariable('Path','User')\n# Allow the study-guide page to reach Ollama (persists for future restarts)\n[Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS','*','User')\n$env:OLLAMA_ORIGINS='*'\nollama pull llama3.2\n# Restart the server so it serves with the new setting, then keep it running\nGet-Process '*ollama*' -EA SilentlyContinue | Stop-Process -Force\nWrite-Host 'Starting Ollama - keep this window open.'\nollama serve\n" };
    if (os === "mac") return { name: "setup-ollama.command", mime: "text/x-shellscript",
      body: "#!/bin/bash\n# Clarence's Solutions - local AI setup\nif ! command -v ollama >/dev/null 2>&1; then\n  if command -v brew >/dev/null 2>&1; then brew install ollama; else open https://ollama.com/download; fi\nfi\nexport OLLAMA_ORIGINS='*'\n(ollama serve &)\nsleep 4\nollama pull llama3.2\necho 'Ollama is running - keep this window open.'\n" };
    return { name: "setup-ollama.sh", mime: "text/x-shellscript",
      body: "#!/bin/bash\n# Clarence's Solutions - local AI setup\nif ! command -v ollama >/dev/null 2>&1; then curl -fsSL https://ollama.com/install.sh | sh; fi\nexport OLLAMA_ORIGINS='*'\n(ollama serve &)\nsleep 4\nollama pull llama3.2\necho 'Ollama is running - keep this terminal open.'\n" };
  }
  function copyCmd() {
    var t = ollamaCmd(), btn = document.getElementById("dvc-copy");
    function ok() { if (btn) { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy"; }, 1600); } }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok, fallbackCopy); }
      else fallbackCopy();
    } catch (e) { fallbackCopy(); }
    function fallbackCopy() {
      var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch (e) {} ta.remove();
    }
  }
  function dlScript() {
    var sc = ollamaScript(), blob = new Blob([sc.body], { type: sc.mime }), u = URL.createObjectURL(blob);
    var a = el("a", { href: u, download: sc.name }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 1500);
  }
  var autoTimer = null, autoUntil = 0;
  function startAutoDetect() {
    if (autoTimer) return; autoUntil = Date.now() + 10 * 60 * 1000;
    var w = document.getElementById("dvc-wait"); if (w) w.style.display = "inline-flex";
    autoTimer = setInterval(function () {
      if (Date.now() > autoUntil || ollama.available) { stopAutoDetect(); return; }
      detectOllama(function () {
        if (ollama.available) {
          stopAutoDetect(); renderStatus(); toggleHelp(false);
          addMsg("bot", "\u2705 Local AI is on \u2014 <b>" + esc(ollama.model) + "</b>. I'll write full answers now. Ask me anything!");
        }
      });
    }, 3000);
  }
  function stopAutoDetect() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    var w = document.getElementById("dvc-wait"); if (w) w.style.display = "none";
  }

  function buildPrompt(q, hits) {
    var ctx = hits.map(function (h) {
      var p = corpus.pages[corpus.chunks[h.i][0]];
      return "[Source: " + p.t + " — " + p.u + "]\n" + corpus.chunks[h.i][1];
    }).join("\n\n");
    return "You are the study assistant for a VCE Software Development learning site. " +
      "Answer the question using ONLY the excerpts below. Be clear and concise, use Australian English, " +
      "and write in full sentences suitable for a Year 11/12 student. If the answer is not in the excerpts, " +
      "say you couldn't find it on the site. End with 'Sources:' and the page title(s) you used.\n\n" +
      "=== SITE EXCERPTS ===\n" + ctx + "\n\n=== QUESTION ===\n" + q + "\n\n=== ANSWER ===\n";
  }
  function generate(q, hits, onToken) {
    var prompt = buildPrompt(q, hits);
    return fetch(OLLAMA + "/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: ollama.model, prompt: prompt, stream: true })
    }).then(function (resp) {
      if (!resp.ok || !resp.body) throw new Error("HTTP " + resp.status);
      var reader = resp.body.getReader(), dec = new TextDecoder(), buf = "", full = "";
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return full;
          buf += dec.decode(r.value, { stream: true });
          var nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            var line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
            if (!line) continue;
            try { var o = JSON.parse(line); if (o.response) { full += o.response; onToken(full); } } catch (e) {}
          }
          return pump();
        });
      }
      return pump();
    });
  }

  /* ---------- linking results back into the app ---------- */
  function openResult(rel) {
    if (hubReady()) {
      if (rel === "index.html") { openTab("welcome"); return true; }
      var k = url2unit()[rel];
      var m = k && k.match(/^(prog|ad|de|cyber)-(kk\d\d)$/);
      if (m) { openTab(m[1]); openSub(m[1], m[2]); return true; }
    }
    window.open(new URL(rel, SITE_ROOT).href, "_blank", "noopener");
    return false;
  }

  /* ---------- UI ---------- */
  var panel, msgs, input, statusPill, launcher, helpBox, sendBtn, greeted = false;

  function addMsg(role, html) {
    var row = el("div", { class: "dvc-msg dvc-" + role });
    if (role === "bot") row.appendChild(el("div", { class: "dvc-ava" }, CAP));
    var b = el("div", { class: "dvc-bub" }, html);
    row.appendChild(b);
    msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
    return b;
  }

  function sourceCards(hits) {
    var seen = {}, out = [];
    hits.forEach(function (h) {
      if (out.length >= 5) return;
      var pi = corpus.chunks[h.i][0]; if (seen[pi]) return; seen[pi] = 1;
      var p = corpus.pages[pi];
      var snip = corpus.chunks[h.i][1];
      snip = snip.length > 240 ? snip.slice(0, 240) + "…" : snip;
      out.push('<a class="dvc-card" href="#" data-rel="' + esc(p.u) + '">' +
        '<span class="dvc-card-t">' + esc(p.t) + '</span>' +
        '<span class="dvc-card-s">' + esc(snip) + '</span>' +
        '<span class="dvc-card-u">' + esc(p.u) + ' ›</span></a>');
    });
    return out.join("");
  }

  function answer(q) {
    ensureIndex(function (err) {
      if (err) { addMsg("bot", "I couldn't load the site index. Make sure <code>assets/chatbot-corpus.js</code> is published next to the pages."); return; }
      var hits = bm25.search(q, 14);
      if (!hits.length) {
        addMsg("bot", "I couldn't find anything about that on the site. Try different keywords — for example a key-knowledge term like <em>threat modelling</em>, <em>binary search</em> or <em>Gantt chart</em>.");
        return;
      }
      var top = hits.slice(0, 5);  // for LLM context
      if (ollama.available && ollama.model) {
        var bub = addMsg("bot", '<span class="dvc-think">Thinking with local model <b>' + esc(ollama.model) + '</b>…</span>');
        generate(q, top, function (txt) { bub.innerHTML = mdLite(txt); msgs.scrollTop = msgs.scrollHeight; })
          .then(function (full) {
            bub.innerHTML = mdLite(full || "") +
              '<div class="dvc-srchead">Pages used</div>' + sourceCards(hits);
            wireCards(bub); msgs.scrollTop = msgs.scrollHeight;
          })
          .catch(function (e) {
            ollama.available = false; renderStatus();
            bub.innerHTML = '<div class="dvc-note">Local model unavailable (' + esc(e.message) +
              ') — showing search results instead.</div>' + retrievalHTML(q, top);
            wireCards(bub);
          });
      } else {
        var b = addMsg("bot", retrievalHTML(q, hits));
        wireCards(b);
      }
    });
  }

  function retrievalHTML(q, hits) {
    return '<div class="dvc-intro">Here are the most relevant pages I found for <b>' + esc(q) +
      '</b>:</div>' + sourceCards(hits) +
      '<div class="dvc-tip">💡 Want these written up as a full answer? <a href="#" class="dvc-enable">Set up local AI</a> — one command, runs on your machine, free.</div>';
  }

  function wireCards(scope) {
    [].forEach.call(scope.querySelectorAll(".dvc-card"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); var kept = openResult(a.getAttribute("data-rel"));
        if (kept) closePanel();
      });
    });
    [].forEach.call(scope.querySelectorAll(".dvc-enable"), function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); toggleHelp(true); });
    });
  }

  // very small markdown -> html (paragraphs, bold, lists, code)
  function mdLite(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    var lines = t.split(/\n/), out = [], inList = false;
    lines.forEach(function (ln) {
      if (/^\s*[-*]\s+/.test(ln)) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + ln.replace(/^\s*[-*]\s+/, "") + "</li>");
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        if (ln.trim()) out.push("<p>" + ln + "</p>");
      }
    });
    if (inList) out.push("</ul>");
    return out.join("");
  }

  function renderStatus() {
    if (!statusPill) return;
    if (ollama.available && ollama.model) {
      statusPill.className = "dvc-pill on";
      statusPill.innerHTML = '<span class="dot"></span>Local AI · ' + esc(ollama.model);
    } else {
      statusPill.className = "dvc-pill off";
      statusPill.innerHTML = '<span class="dot"></span>Search mode';
    }
  }

  function toggleHelp(force) {
    var open = force != null ? force : helpBox.style.display === "none";
    helpBox.style.display = open ? "block" : "none";
    if (open) { var c = document.getElementById("dvc-cmd-text"); if (c) c.textContent = ollamaCmd(); copyCmd(); startAutoDetect(); }
    else stopAutoDetect();
  }

  function send() {
    var q = input.value.trim(); if (!q) return;
    addMsg("user", esc(q)); input.value = ""; input.style.height = "auto";
    answer(q);
  }

  function greet() {
    if (greeted) return; greeted = true;
    ensureIndex(function () {
      var n = corpus ? corpus.pages.length : 0;
      addMsg("bot",
        "Hi! I'm your study assistant. I've read <b>" + n + " pages</b> of this site — every chapter and key-knowledge module.<br><br>" +
        "Ask me anything, e.g. <em>“what is threat modelling?”</em> or <em>“difference between alpha and beta testing”</em>. " +
        "I'll point you to the right pages. " +
        (ollama.available
          ? "Local AI is on, so I'll also write a full answer."
          : 'For full sentence answers, <a href="#" class="dvc-enable">set up local AI</a> — one command, free, no API key.'));
      wireCards(msgs);
    });
  }

  function openPanel() {
    panel.classList.add("open"); launcher.classList.add("hidden");
    setTimeout(function () { input && input.focus(); }, 60);
    greet();
    detectOllama(renderStatus);
  }
  function closePanel() { panel.classList.remove("open"); launcher.classList.remove("hidden"); stopAutoDetect(); }

  /* ---------- build DOM ---------- */
  function build() {
    var css = document.createElement("style");
    css.textContent = CSS;
    document.head.appendChild(css);

    launcher = el("button", { id: "dvc-launch", "aria-label": "Open study assistant" },
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span>Ask this site</span>');
    launcher.addEventListener("click", openPanel);

    panel = el("div", { id: "dvc-panel", role: "dialog", "aria-label": "Study assistant" });
    panel.innerHTML =
      '<div class="dvc-head">' +
        '<img class="dvc-logo" src="' + LOGO + '" alt="Clarence\'s Solutions">' +
        '<div class="dvc-htxt"><div class="dvc-title">Study Assistant</div>' +
        '<button class="dvc-pill off" id="dvc-status"><span class="dot"></span>Search mode</button></div>' +
        '<button class="dvc-x" id="dvc-x" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="dvc-help" id="dvc-help" style="display:none">' +
        '<div class="dvc-help-t">Switch on full-sentence answers</div>' +
        '<div class="dvc-help-sub">Run this once. It installs Ollama, allows this page, pulls a model and starts it — then I turn on by myself.</div>' +
        '<div class="dvc-cmd"><code id="dvc-cmd-text"></code><button class="dvc-copy" id="dvc-copy">Copy</button></div>' +
        '<div class="dvc-help-row">' +
          '<button class="dvc-btn" id="dvc-dl">Download setup script</button>' +
          '<span class="dvc-wait" id="dvc-wait"><span class="dvc-spin"></span>Waiting for Ollama…</span>' +
        '</div>' +
        '<div class="dvc-help-n">A web page can\'t silently install software on your computer, so this single command does it for you. Everything runs locally — no API key, no cloud.</div>' +
      '</div>' +
      '<div class="dvc-msgs" id="dvc-msgs"></div>' +
      '<div class="dvc-compose">' +
        '<textarea id="dvc-input" rows="1" placeholder="Ask about any topic on the site…"></textarea>' +
        '<button id="dvc-send" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>' +
        '</button>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    msgs = panel.querySelector("#dvc-msgs");
    input = panel.querySelector("#dvc-input");
    sendBtn = panel.querySelector("#dvc-send");
    statusPill = panel.querySelector("#dvc-status");
    helpBox = panel.querySelector("#dvc-help");

    panel.querySelector("#dvc-x").addEventListener("click", closePanel);
    statusPill.addEventListener("click", function () { toggleHelp(); });
    panel.querySelector("#dvc-copy").addEventListener("click", copyCmd);
    panel.querySelector("#dvc-dl").addEventListener("click", dlScript);
    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto"; input.style.height = Math.min(120, input.scrollHeight) + "px";
    });

    // raise launcher above the hub status bar when on the hub
    if (hubReady()) document.body.classList.add("dvc-hub");
  }

  /* ---------- styles ---------- */
  var CSS = [
"#dvc-launch{position:fixed;right:22px;bottom:22px;z-index:2147483000;display:inline-flex;align-items:center;gap:9px;",
"padding:12px 18px 12px 14px;border:0;border-radius:999px;cursor:pointer;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",
"color:#fff;background:linear-gradient(135deg,#7c5cff,#5b3fd1);box-shadow:0 10px 28px rgba(91,63,209,.45);transition:transform .15s,box-shadow .15s,opacity .2s}",
"#dvc-launch:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(91,63,209,.55)}",
"#dvc-launch.hidden{opacity:0;pointer-events:none;transform:translateY(8px)}",
"body.dvc-hub #dvc-launch{bottom:40px}",
"#dvc-panel{position:fixed;right:22px;bottom:22px;z-index:2147483001;width:390px;max-width:calc(100vw - 28px);height:72vh;max-height:680px;",
"display:flex;flex-direction:column;opacity:0;transform:translateY(14px) scale(.98);pointer-events:none;transition:opacity .18s,transform .18s;",
"background:rgba(20,21,28,.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#e9eaf2;border:1px solid rgba(255,255,255,.12);",
"border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.5);overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}",
"#dvc-panel.open{opacity:1;transform:none;pointer-events:auto}",
"body.dvc-hub #dvc-panel{bottom:40px}",
".dvc-head{display:flex;align-items:center;gap:11px;padding:13px 12px 13px 15px;background:linear-gradient(120deg,rgba(124,92,255,.22),rgba(91,63,209,.05));border-bottom:1px solid rgba(255,255,255,.10)}",
".dvc-logo{height:22px;width:auto;display:block;background:#fff;border-radius:5px;padding:3px 6px;box-shadow:0 1px 3px rgba(0,0,0,.3)}",
".dvc-htxt{flex:1;min-width:0}.dvc-title{font-weight:700;font-size:14.5px;letter-spacing:.2px}",
".dvc-pill{margin-top:4px;display:inline-flex;align-items:center;gap:6px;border:0;cursor:pointer;font:600 11px/1 inherit;padding:4px 9px;border-radius:999px;color:#fff}",
".dvc-pill .dot{width:7px;height:7px;border-radius:50%;display:inline-block}",
".dvc-pill.on{background:rgba(34,192,139,.18);color:#5ef0b6}.dvc-pill.on .dot{background:#22c08b;box-shadow:0 0 0 3px rgba(34,192,139,.18)}",
".dvc-pill.off{background:rgba(255,196,77,.16);color:#ffd98a}.dvc-pill.off .dot{background:#ffc44d}",
".dvc-x{background:transparent;border:0;color:#aab;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:8px}",
".dvc-x:hover{background:rgba(255,255,255,.08);color:#fff}",
".dvc-help{padding:13px 15px;background:rgba(124,92,255,.08);border-bottom:1px solid rgba(255,255,255,.10);font-size:12.5px;color:#d7d9e6}",
".dvc-help-t{font-weight:700;margin-bottom:6px;color:#fff}.dvc-help ol{margin:0 0 9px;padding-left:18px;line-height:1.5}",
".dvc-help code{background:rgba(255,255,255,.10);padding:1px 6px;border-radius:5px;font-size:11.5px}",
".dvc-help a{color:#b9a6ff}.dvc-help-row{display:flex;gap:10px;align-items:center}.dvc-help-n{margin-top:9px;font-size:11px;color:#9a9db0;line-height:1.45}",
".dvc-help-sub{font-size:12px;color:#cdd0e0;margin-bottom:9px;line-height:1.5}",
".dvc-cmd{display:flex;align-items:stretch;background:#0e0f15;border:1px solid rgba(255,255,255,.14);border-radius:9px;overflow:hidden;margin-bottom:10px}",
".dvc-cmd code{flex:1;min-width:0;padding:9px 11px;font:600 11px/1.5 'Cascadia Code',Consolas,monospace;color:#d7d9e6;white-space:pre-wrap;word-break:break-all}",
".dvc-copy{flex:0 0 auto;border:0;border-left:1px solid rgba(255,255,255,.14);background:rgba(124,92,255,.2);color:#cbb9ff;font:700 11px/1 inherit;padding:0 13px;cursor:pointer}",
".dvc-copy:hover{background:rgba(124,92,255,.34);color:#fff}",
".dvc-wait{display:none;align-items:center;gap:7px;font-size:11.5px;color:#ffd98a;white-space:nowrap}",
".dvc-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,217,138,.35);border-top-color:#ffd98a;display:inline-block;animation:dvc-rot .8s linear infinite}",
"@keyframes dvc-rot{to{transform:rotate(360deg)}}",
".dvc-btn{border:0;cursor:pointer;font:600 12px/1 inherit;padding:8px 13px;border-radius:9px;background:linear-gradient(135deg,#7c5cff,#5b3fd1);color:#fff}",
".dvc-btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.2);color:#cdd0e0;text-decoration:none;display:inline-flex;align-items:center}",
".dvc-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}",
".dvc-msgs::-webkit-scrollbar{width:8px}.dvc-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:8px}",
".dvc-msg{display:flex;gap:9px;align-items:flex-start}.dvc-user{justify-content:flex-end}",
".dvc-ava{flex:0 0 26px;width:26px;height:26px;border-radius:8px;background:rgba(124,92,255,.18);display:flex;align-items:center;justify-content:center;overflow:hidden}",
".dvc-ava img{width:22px;height:auto}",
".dvc-bub{max-width:80%;padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;word-wrap:break-word}",
".dvc-bot .dvc-bub{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-top-left-radius:5px}",
".dvc-user .dvc-bub{background:linear-gradient(135deg,#6c4cff,#5b3fd1);color:#fff;border-top-right-radius:5px}",
".dvc-bub p{margin:0 0 8px}.dvc-bub p:last-child{margin:0}.dvc-bub ul{margin:6px 0;padding-left:18px}.dvc-bub li{margin:2px 0}",
".dvc-bub code{background:rgba(255,255,255,.12);padding:1px 5px;border-radius:5px;font-size:12px}",
".dvc-bub a{color:#b9a6ff}.dvc-think{color:#b6b9cc;font-style:italic}",
".dvc-intro{margin-bottom:9px}.dvc-srchead,.dvc-tip,.dvc-note{font-size:12px}",
".dvc-srchead{margin:11px 0 6px;color:#9a9db0;text-transform:uppercase;letter-spacing:.5px;font-weight:700;font-size:10.5px}",
".dvc-card{display:block;margin:7px 0;padding:9px 11px;border-radius:11px;background:rgba(124,92,255,.10);border:1px solid rgba(124,92,255,.22);text-decoration:none;color:inherit;transition:background .12s,border-color .12s}",
".dvc-card:hover{background:rgba(124,92,255,.2);border-color:rgba(124,92,255,.45)}",
".dvc-card-t{display:block;font-weight:700;font-size:12.5px;color:#efeeff}",
".dvc-card-s{display:block;font-size:11.5px;color:#b9bccb;margin:3px 0 4px;line-height:1.4}",
".dvc-card-u{display:block;font-size:10.5px;color:#8e7be6;font-family:'Cascadia Code',Consolas,monospace}",
".dvc-tip{margin-top:11px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);color:#a9acbe}.dvc-tip a,.dvc-enable{color:#b9a6ff;cursor:pointer}",
".dvc-note{margin-bottom:8px;color:#ffd98a}",
".dvc-compose{display:flex;gap:8px;align-items:flex-end;padding:11px 12px;border-top:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18)}",
".dvc-compose textarea{flex:1;resize:none;max-height:120px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;",
"border-radius:12px;padding:10px 12px;font:400 13.5px/1.4 inherit;outline:none}.dvc-compose textarea:focus{border-color:rgba(124,92,255,.6)}",
"#dvc-send{flex:0 0 40px;width:40px;height:40px;border:0;border-radius:11px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7c5cff,#5b3fd1);display:flex;align-items:center;justify-content:center}",
"#dvc-send:hover{filter:brightness(1.08)}",
"@media (max-width:480px){#dvc-panel{right:8px;left:8px;bottom:8px;width:auto;height:78vh}#dvc-launch span{display:none}#dvc-launch{padding:14px;right:16px;bottom:16px}body.dvc-hub #dvc-launch{bottom:44px}}"
  ].join("");

  /* ---------- go ---------- */
  function init() { build(); detectOllama(renderStatus); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

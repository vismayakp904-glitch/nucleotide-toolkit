let modules = [];
let current = null;

const $ = (id) => document.getElementById(id);
const COLORS = { A: "#3a9b5c", T: "#d9534f", G: "#e0a030", C: "#3b78c2", U: "#8e5bb5" };
const PAIR = { A: "T", T: "A", G: "C", C: "G" };
const BONDS = { A: 2, T: 2, G: 3, C: 3 };
const SVGNS = "http://www.w3.org/2000/svg";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- tiny DOM helpers ---------- */
function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function s(tag, attrs, text) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text !== undefined) e.textContent = text;
  return e;
}
const baseColor = (b) => COLORS[b] || "#8a989f";
const complementOf = (seq) => [...seq].map((b) => PAIR[b] || "?").join("");

/* ---------- hero: rotating double helix ---------- */
function startHero() {
  const c = $("hero");
  const ctx = c.getContext("2d");
  const seq = "GATTACAGCTTAGCCGATAGCTAACGTTGCATCGGATATCGCGAATTCTAGC";
  let w = 0, h0 = 0;

  function size() {
    const dpr = window.devicePixelRatio || 1;
    w = c.clientWidth; h0 = c.clientHeight;
    c.width = w * dpr; c.height = h0 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h0);
    const step = 17, n = Math.floor((w - 16) / step), mid = h0 / 2, R = h0 * 0.34;
    const top = [], bot = [];
    for (let i = 0; i < n; i++) {
      const x = 12 + i * step, a = i * 0.34 + t * 0.0011;
      const sn = Math.sin(a), z = Math.cos(a);
      top.push({ x, y: mid + R * sn, z });
      bot.push({ x, y: mid - R * sn, z: -z });
    }
    // rungs
    for (let i = 0; i < n; i++) {
      const b = seq[i % seq.length];
      const g = ctx.createLinearGradient(0, top[i].y, 0, bot[i].y);
      g.addColorStop(0, baseColor(b));
      g.addColorStop(1, baseColor(PAIR[b]));
      ctx.strokeStyle = g;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(top[i].x, top[i].y); ctx.lineTo(bot[i].x, bot[i].y); ctx.stroke();
    }
    // backbones
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2.5;
    [[top, "#0d5c63"], [bot, "#7fb4b9"]].forEach(([pts, col]) => {
      ctx.strokeStyle = col;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    });
    // base dots, sized by depth
    for (let i = 0; i < n; i++) {
      const b = seq[i % seq.length];
      [[top[i], b], [bot[i], PAIR[b]]].forEach(([p, base]) => {
        ctx.fillStyle = baseColor(base);
        ctx.globalAlpha = 0.65 + 0.35 * ((p.z + 1) / 2);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.2 + 2.2 * ((p.z + 1) / 2), 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
  }
  function loop(t) { draw(t); requestAnimationFrame(loop); }

  size();
  window.addEventListener("resize", () => { size(); if (reduceMotion) draw(0); });
  if (reduceMotion) draw(0); else requestAnimationFrame(loop);
}

/* ---------- reusable visual pieces ---------- */
function badge(text, kind) { return h("span", "badge" + (kind ? " " + kind : ""), text); }

function legend(seqs) {
  const present = new Set(seqs.join(""));
  const letters = ["A", "T", "G", "C"];
  if (present.has("U")) letters.splice(1, 1, "U");
  const box = h("div", "legend");
  letters.forEach((b) => {
    const item = h("span");
    const dot = h("i"); dot.style.background = baseColor(b);
    item.append(dot, b);
    box.appendChild(item);
  });
  return box;
}

// row of coloured base tiles. opts: marks (Set, mismatches), sites (Set, highlighted), limit
function tileRow(seq, opts = {}) {
  const limit = opts.limit || 300;
  const row = h("div", "tiles");
  [...seq.slice(0, limit)].forEach((b, i) => {
    const cell = h("div", "cell");
    const tile = h("div", "tile", b);
    tile.style.setProperty("--i", i);
    tile.style.background = baseColor(b);
    tile.title = "Base " + b + " at index " + i;
    if (opts.sites && opts.sites.size) tile.classList.add(opts.sites.has(i) ? "site" : "dim");
    if (opts.marks && opts.marks.has(i)) tile.classList.add("mark");
    cell.append(tile, h("span", "idx", i % 10 === 0 ? String(i) : ""));
    row.appendChild(cell);
  });
  return row;
}

// double-helix style ladder: top strand paired with bottom strand
function helix(top, bottom, limit = 40) {
  const n = Math.min(top.length, bottom.length, limit);
  const dx = 30, pad = 40, mid = 70, W = pad * 2 + (n - 1) * dx, H = 140;
  const half = (x) => 25 + 11 * Math.cos(((x - pad) / dx) * 0.8);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
    "aria-label": "DNA double strand showing base pairs" });

  // backbones
  [-1, 1].forEach((sign, k) => {
    let d = "";
    for (let x = pad - 14; x <= W - pad + 14; x += 3) d += (d ? "L" : "M") + x + " " + (mid + sign * half(x)).toFixed(1);
    svg.appendChild(s("path", { d, fill: "none", stroke: k ? "#7fb4b9" : "#0d5c63", "stroke-width": 3, "stroke-linecap": "round" }));
  });

  for (let i = 0; i < n; i++) {
    const x = pad + i * dx, hh = half(x), y1 = mid - hh, y2 = mid + hh;
    const g = s("g");
    g.appendChild(s("title", {}, top[i] + " pairs with " + bottom[i] + " (" + (BONDS[top[i]] || "?") + " hydrogen bonds)"));
    const bonds = BONDS[top[i]] || 2, gap = 4.5;
    for (let b = 0; b < bonds; b++) {
      const bx = x + (b - (bonds - 1) / 2) * gap;
      g.appendChild(s("line", { x1: bx, y1: y1 + 8, x2: bx, y2: y2 - 8, stroke: "#9aa9af", "stroke-width": 1.5 }));
    }
    [[y1, top[i]], [y2, bottom[i]]].forEach(([y, base]) => {
      g.appendChild(s("circle", { cx: x, cy: y, r: 11, fill: baseColor(base) }));
      g.appendChild(s("text", { x, y: y + 4, "text-anchor": "middle", "font-size": 12, "font-weight": 600, fill: "#fff" }, base));
    });
    svg.appendChild(g);
  }
  [["5′", 10, mid - half(pad) + 4], ["3′", 10, mid + half(pad) + 4],
   ["3′", W - 10, mid - half(W - pad) + 4], ["5′", W - 10, mid + half(W - pad) + 4]].forEach(([t, x, y], i) =>
    svg.appendChild(s("text", { x, y, "text-anchor": i < 2 ? "start" : "end", "font-size": 12, fill: "#5b6b73" }, t)));

  const wrap = h("div", "helix-scroll");
  wrap.appendChild(svg);
  return wrap;
}

function limitNote(total, shown) {
  return total > shown ? h("p", "note", "Showing the first " + shown + " of " + total + " bases.") : null;
}

/* ---------- one visual per module (built from the script's printed output) ---------- */
const VIS = {
  1: percentVisual, 2: percentVisual,
  3: compareVisual, 4: sitesVisual, 5: lengthVisual,
  6: reverseVisual, 7: complementVisual, 8: mutationVisual, 9: proteinVisual,
  10: digestVisual,
};

function percentVisual(inp, out, id) {
  const found = [...out.matchAll(/Percentage of (\w): ([\d.]+)/g)];
  if (!found.length) return null;
  const box = h("div");
  const gc = found.filter(([, b]) => b === "G" || b === "C").reduce((a, [, , v]) => a + parseFloat(v), 0);
  const sum = h("div", "summary");
  sum.append(badge("GC content " + gc.toFixed(1) + "%", "ok"), badge(inp[0].length + " bases"));
  box.appendChild(sum);
  const bars = h("div", "bars");
  found.forEach(([, b, v]) => {
    const row = h("div", "bar");
    const name = h("span", "name", b); name.style.background = baseColor(b);
    const track = h("div", "track"), fill = h("div", "fill");
    fill.style.background = baseColor(b);
    fill.dataset.w = Math.min(100, parseFloat(v));
    track.appendChild(fill);
    row.append(name, track, h("span", "val", parseFloat(v).toFixed(1) + "%"));
    bars.appendChild(row);
  });
  box.append(bars, legend(inp));
  requestAnimationFrame(() => requestAnimationFrame(() =>
    box.querySelectorAll(".fill").forEach((f) => (f.style.width = f.dataset.w + "%"))));
  return box;
}

function compareVisual(inp, out) {
  if (!/identical/.test(out)) return null;
  const [a, b] = inp, same = !/not identical/.test(out), box = h("div");
  const marks = new Set();
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) marks.add(i);
  const sum = h("div", "summary");
  sum.appendChild(same ? badge("Identical", "ok") : badge("Not identical", "bad"));
  if (!same) sum.appendChild(badge(marks.size + " difference" + (marks.size === 1 ? "" : "s"), "warn"));
  box.append(sum, h("div", "vrow-label", "Required sequence"), tileRow(a, { marks }),
    h("div", "vrow-label", "Sequence to compare"), tileRow(b, { marks }), legend(inp));
  return box;
}

function sitesVisual(inp, out) {
  const m = /Number of cuts: (\d+)/.exec(out);
  if (!m) return null;
  const [dna, target] = inp, sites = new Set(), starts = [];
  for (const f of out.matchAll(/Found \w+ at index (\d+)/g)) {
    const st = +f[1]; starts.push(st);
    for (let k = 0; k < target.length; k++) sites.add(st + k);
  }
  const box = h("div"), sum = h("div", "summary");
  sum.append(badge(m[1] + " cut site" + (m[1] === "1" ? "" : "s"), +m[1] ? "ok" : "warn"), badge("Looking for " + target));
  box.append(sum, tileRow(dna, { sites }));
  if (starts.length) {
    const chips = h("div", "chips");
    starts.forEach((st) => chips.appendChild(h("span", "chip", "index " + st + " to " + (st + target.length - 1))));
    box.appendChild(chips);
  }
  box.append(legend(inp));
  const note = limitNote(dna.length, 300); if (note) box.appendChild(note);
  return box;
}

function lengthVisual(inp, out) {
  const m = /Length of sequence is: (\d+)/.exec(out);
  if (!m) return null;
  const box = h("div"), big = h("div", "summary"), c = h("div", "bigcount", m[1] + " ");
  c.appendChild(h("small", "", "bases"));
  big.appendChild(c);
  box.append(big, tileRow(inp[0]), legend(inp));
  const note = limitNote(inp[0].length, 300); if (note) box.appendChild(note);
  return box;
}

function complementVisual(inp, out) {
  const m = /Complementary strand: (\w+)/.exec(out);
  if (!m) return null;
  const box = h("div"), sum = h("div", "summary");
  sum.append(badge("Hydrogen bonds: A-T has 2, G-C has 3"), badge(inp[0].length + " base pairs"));
  box.append(sum, helix(inp[0], m[1]), legend(inp));
  const note = limitNote(inp[0].length, 40); if (note) box.appendChild(note);
  return box;
}

function reverseVisual(inp, out) {
  const m = /Reverse complement: (\w+)/.exec(out);
  if (!m) return null;
  const pal = /Palindrome DNA/.test(out), box = h("div"), sum = h("div", "summary");
  sum.append(pal ? badge("Palindromic", "ok") : badge("Not palindromic", "warn"));
  box.append(sum, h("div", "vrow-label", "Original strand and its complement"),
    helix(inp[0], complementOf(inp[0])),
    h("div", "vrow-label", "Reverse complement (read 5′ to 3′)"), tileRow(m[1]), legend(inp));
  const note = limitNote(inp[0].length, 40); if (note) box.appendChild(note);
  return box;
}

function mutationVisual(inp, out) {
  const muts = [...out.matchAll(/Mutation at index: (\d+) (\w) -> (\w)/g)];
  if (!muts.length && !/No mutations/.test(out)) return null;
  const marks = new Set(muts.map((x) => +x[1])), box = h("div"), sum = h("div", "summary");
  sum.appendChild(muts.length ? badge(muts.length + " mutation" + (muts.length === 1 ? "" : "s"), "bad") : badge("No mutations", "ok"));
  box.append(sum, h("div", "vrow-label", "Reference"), tileRow(inp[0], { marks }),
    h("div", "vrow-label", "Sequence checked"), tileRow(inp[1], { marks }));
  if (muts.length) {
    const chips = h("div", "chips");
    muts.forEach(([, i, a, b]) => chips.appendChild(h("span", "chip", "index " + i + ": " + a + " → " + b)));
    box.appendChild(chips);
  }
  box.append(legend(inp));
  return box;
}

function proteinVisual(inp, out) {
  const st = /Start position \(0-based\): (\d+)/.exec(out), pr = /Protein sequence: ([A-Z]*)/.exec(out);
  if (!st || !pr) return null;
  const dna = inp[0], start = +st[1], protein = pr[1], stopFound = /Stop codon found/.test(out);
  const box = h("div"), sum = h("div", "summary");
  sum.append(badge(protein.length + " amino acid" + (protein.length === 1 ? "" : "s"), "ok"),
    badge("Start at index " + start), stopFound ? badge("Stop codon found") : badge("No stop codon", "warn"));
  box.appendChild(sum);

  const wrap = h("div", "codons");
  if (start > 0) wrap.appendChild(h("span", "leader", dna.slice(0, start) + " …"));
  const addCodon = (i, label, cls) => {
    const codon = h("div", "codon " + (cls || "")), tri = h("div", "triplet");
    codon.style.setProperty("--i", i);
    [...dna.slice(start + 3 * i, start + 3 * i + 3)].forEach((b) => {
      const sp = h("span", "", b); sp.style.background = baseColor(b); tri.appendChild(sp);
    });
    codon.append(tri, h("div", "aa", label));
    wrap.appendChild(codon);
  };
  [...protein].forEach((aa, i) => addCodon(i, aa, i === 0 ? "start" : ""));
  if (stopFound) addCodon(protein.length, "Stop", "stop");
  box.append(wrap);
  const chain = h("p", "note", "Protein: " + (protein || "(empty)"));
  box.append(chain, legend(inp));
  return box;
}


function gel(sizes) {
  const W = 150, H = 230, x0 = 20, lw = 60, top = 44, bot = 208;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": "Simulated gel with one band per fragment" });
  svg.appendChild(s("rect", { x: 0, y: 0, width: W, height: H, rx: 6, fill: "#1d2b33" }));
  svg.appendChild(s("rect", { x: x0, y: 16, width: lw, height: 10, rx: 2, fill: "#0e171c" }));
  svg.appendChild(s("text", { x: x0 + lw / 2, y: 38, "text-anchor": "middle", "font-size": 9, fill: "#8aa0a8" }, "sample"));
  const lo = Math.log10(Math.max(1, Math.min(...sizes) * 0.6)), hi = Math.log10(Math.max(...sizes) * 1.4);
  const bands = [...new Set(sizes)]
    .map((n) => ({ n, y: bot - ((Math.log10(n) - lo) / (hi - lo || 1)) * (bot - top) }))
    .sort((a, b) => a.y - b.y);
  let lastLabel = -99;
  bands.forEach((b) => {
    svg.appendChild(s("rect", { x: x0 + 4, y: b.y - 3, width: lw - 8, height: 6, rx: 2, fill: "#9fe3ee" }));
    const ly = Math.max(b.y + 3, lastLabel + 12);
    lastLabel = ly;
    svg.appendChild(s("text", { x: x0 + lw + 8, y: ly, "font-size": 10, fill: "#c9d6db" }, b.n + " bp"));
  });
  const wrap = h("div");
  wrap.append(h("div", "vrow-label", "Simulated gel"), svg);
  return wrap;
}

function digestVisual(inp, out) {
  const enz = /Selected enzyme: (\w+)/.exec(out), site = /Recognition site: (\w+)/.exec(out);
  if (!enz || !site) return null;
  const box = h("div"), sum = h("div", "summary");
  sum.append(badge(enz[1]), badge("Site " + site[1]));
  if (/No restriction site found/.test(out)) {
    sum.appendChild(badge("No site found, DNA stays uncut", "warn"));
    box.append(sum, tileRow(inp[0]), legend(inp));
    return box;
  }
  const sizes = [...out.matchAll(/Fragment size: (\d+) bp/g)].map((m) => +m[1]);
  const frags = [...out.matchAll(/Fragment \d+ : (\w+)/g)].map((m) => m[1]);
  if (!sizes.length) return null;
  sum.append(badge((sizes.length - 1) + " cut" + (sizes.length === 2 ? "" : "s"), "ok"), badge(sizes.length + " fragments"));

  const left = h("div", "left"), map = h("div", "fragmap");
  sizes.forEach((n, i) => {
    const seg = h("div", "seg", n + " bp");
    seg.style.flexGrow = n;
    seg.style.background = i % 2 ? "#3f8f96" : "#0d5c63";
    seg.title = "Fragment " + (i + 1) + ": " + n + " bp";
    map.appendChild(seg);
  });
  left.append(h("div", "vrow-label", "Fragment map (dashed lines are cuts)"), map);
  frags.forEach((f, i) => {
    left.append(h("div", "vrow-label", "Fragment " + (i + 1) + " (" + f.length + " bp)"), tileRow(f, { limit: 120 }));
  });
  const digest = h("div", "digest");
  digest.append(left, gel(sizes));
  box.append(sum, digest, legend(inp));
  return box;
}

function renderVisual(id, inputs, output) {
  const wrap = $("visualWrap"), box = $("visual");
  box.innerHTML = "";
  let node = null;
  try {
    node = VIS[id](inputs.map((v) => v.toUpperCase().replace(/\s+/g, "")), output, id);
  } catch (e) { node = null; }
  if (node) box.appendChild(node);
  wrap.hidden = !node;
}

/* ---------- app wiring ---------- */
async function init() {
  const res = await fetch("/api/modules");
  modules = await res.json();
  const nav = $("nav");
  modules.forEach((m) => {
    const b = document.createElement("button");
    b.textContent = m.id + ". " + m.title;
    b.dataset.id = m.id;
    b.addEventListener("click", () => select(m.id));
    nav.appendChild(b);
  });
  $("run").addEventListener("click", run);
  $("example").addEventListener("click", fillExample);
  $("clear").addEventListener("click", clearAll);
  startHero();
  select(1);
}

function select(id) {
  current = modules.find((m) => m.id === id);
  document.querySelectorAll("nav button").forEach((b) =>
    b.setAttribute("aria-current", String(Number(b.dataset.id) === id)));
  $("title").textContent = current.title;
  $("description").textContent = current.description;

  const box = $("fields");
  box.innerHTML = "";
  current.fields.forEach((f, i) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const label = document.createElement("label");
    label.htmlFor = "f" + i;
    label.textContent = f.label;
    let input;
    if (f.type === "select") {
      input = document.createElement("select");
      f.options.forEach((o) => input.appendChild(new Option(o, o)));
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = f.placeholder;
      input.autocomplete = "off";
      input.spellcheck = false;
    }
    input.id = "f" + i;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
    wrap.append(label, input);
    box.appendChild(wrap);
  });
  $("visualWrap").hidden = true;
  showOutput("Your result will appear here.", "empty");
}

function showOutput(text, kind) {
  const out = $("output");
  out.textContent = text;
  out.className = "output" + (kind ? " " + kind : "");
}

function fillExample() {
  current.fields.forEach((f, i) => { $("f" + i).value = f.example; });
}

function clearAll() {
  current.fields.forEach((f, i) => {
    const el = $("f" + i);
    if (f.type === "select") el.selectedIndex = 0; else el.value = "";
  });
  $("visualWrap").hidden = true;
  showOutput("Your result will appear here.", "empty");
  $("f0").focus();
}

async function run() {
  const inputs = current.fields.map((_, i) => $("f" + i).value.trim());
  if (inputs.some((v) => !v)) {
    $("visualWrap").hidden = true;
    showOutput("Please fill in every field before running.", "error");
    return;
  }
  const btn = $("run");
  btn.disabled = true;
  btn.textContent = "Running...";
  try {
    const res = await fetch("/api/run/" + current.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs }),
    });
    const data = await res.json();
    showOutput(data.output, data.ok ? "" : "error");
    if (data.ok) renderVisual(current.id, inputs, data.output); else $("visualWrap").hidden = true;
  } catch (e) {
    $("visualWrap").hidden = true;
    showOutput("Could not reach the server. Is app.py still running?", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Run";
  }
}

init();

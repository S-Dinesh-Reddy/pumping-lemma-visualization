/* =====================================================
   Pumping Lemma Visualization — script.js
   Language : L = { ww | w ∈ {a,b}* }
   Default  : s = "abab",  x="a",  y="b",  z="ab"
===================================================== */

// ── Active decomposition (may be updated by custom input) ──────────────────
let state = {
  x: "a",
  y: "b",
  z: "ab",
  p: 4          // pumping length = |s|
};

// ══════════════════════════════════════════════════════════════════════════════
//  CORE FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * isInL(s) — returns true iff s ∈ L = { ww }
 * A string belongs to L if it has even length and its two halves are equal.
 */
function isInL(s) {
  if (s.length === 0 || s.length % 2 !== 0) return false;
  const mid = s.length / 2;
  return s.slice(0, mid) === s.slice(mid);
}

/**
 * Decompose a string s ∈ L into (x, y, z) such that:
 *   |xy| ≤ p,  |y| ≥ 1
 * We fix y to the second character of s (index 1) to keep demo readable.
 */
function decompose(s) {
  // x = s[0], y = s[1], z = s[2..]
  return {
    x: s[0],
    y: s[1],
    z: s.slice(2),
    p: s.length
  };
}

/**
 * buildColoredString — renders the final-string div
 * Parts: { x, y, z } mapped to colour classes cx / cy / cz
 */
function buildColoredString(xPart, yPart, zPart) {
  const wrap = document.getElementById("finalString");
  wrap.innerHTML = "";

  const addChars = (str, cls) => {
    for (const ch of str) {
      const span = document.createElement("span");
      span.className = `fc ${cls}`;
      span.textContent = ch;
      // stagger animation
      span.style.animationDelay = `${wrap.children.length * 35}ms`;
      wrap.appendChild(span);
    }
  };

  addChars(xPart, "fc-x");
  addChars(yPart, "fc-y");
  addChars(zPart, "fc-z");
}

/**
 * addStep — appends a step row to #stepsList
 */
function addStep(num, label, value, statusClass) {
  const list = document.getElementById("stepsList");
  const item = document.createElement("div");
  item.className = "step-item";
  item.style.animationDelay = `${(num - 1) * 80}ms`;
  item.innerHTML = `
    <div class="step-num">${num}</div>
    <div>
      <span class="step-label">${label} &rarr; </span>
      <span class="step-value ${statusClass}">${value}</span>
    </div>
  `;
  list.appendChild(item);
}

/**
 * updateDecompUI — refresh the visual xyz segments and legend
 */
function updateDecompUI() {
  document.getElementById("xChars").textContent = state.x;
  document.getElementById("yChars").textContent = state.y;
  document.getElementById("zChars").textContent = state.z;
  document.getElementById("xVal").textContent   = state.x;
  document.getElementById("yVal").textContent   = state.y;
  document.getElementById("zVal").textContent   = state.z;

  const s = state.x + state.y + state.z;
  const w = s.length % 2 === 0 ? s.slice(0, s.length / 2) : "?";
  document.getElementById("activeString").textContent = s;
  document.getElementById("wLabel").textContent  = w;
  document.getElementById("wwLabel").textContent = s;
  document.getElementById("lenLabel").textContent = s.length;
}

/**
 * showResult — renders the result card for any simulation
 * @param {string} title
 * @param {string[]} steps  — array of { label, value, cls }
 * @param {string} xPart, yPart, zPart — coloured final string
 * @param {boolean} valid
 */
function showResult(title, steps, xPart, yPart, zPart, valid) {
  const card  = document.getElementById("resultCard");
  const pill  = document.getElementById("validityPill");
  const rTitle= document.getElementById("resultTitle");
  const list  = document.getElementById("stepsList");

  // Reset + re-trigger animation
  card.classList.remove("pop");
  card.classList.add("hidden");
  list.innerHTML = "";
  void card.offsetWidth;

  rTitle.textContent = title;
  card.classList.remove("hidden");
  card.classList.add("pop");

  steps.forEach((s, i) => addStep(i + 1, s.label, s.value, s.cls));

  buildColoredString(xPart, yPart, zPart);

  pill.textContent = valid ? "✅ Valid (in L)" : "❌ Invalid (not in L)";
  pill.className = `validity-pill ${valid ? "valid" : "invalid"}`;
}

/**
 * updateConditions — marks the four Pumping Lemma conditions
 * pass/fail after pumping (or just initialized after decomp)
 */
function updateConditions(pumped) {
  const { x, y, z, p } = state;
  const xy = x + y;

  const set = (id, statusId, pass, label) => {
    const li = document.getElementById(id);
    const st = document.getElementById(statusId);
    li.classList.remove("pass", "fail");
    li.classList.add(pass ? "pass" : "fail");
    st.textContent = label;
  };

  // Condition 1: s = xyz — always true after decomposition
  set("cond1", "s1", true, "✓ Pass");

  // Condition 2: |xy| ≤ p
  set("cond2", "s2", xy.length <= p, xy.length <= p ? "✓ Pass" : "✗ Fail");

  // Condition 3: |y| > 0
  set("cond3", "s3", y.length > 0, y.length > 0 ? "✓ Pass" : "✗ Fail");

  // Condition 4: pumped string in L (only relevant after pump)
  if (pumped !== null) {
    const cond4Pass = isInL(pumped);
    set("cond4", "s4", cond4Pass, cond4Pass ? "✓ Pass" : "✗ Fail");
    const verdict = document.getElementById("condVerdict");
    verdict.classList.toggle("hidden", cond4Pass);
  } else {
    // Just decomposition — reset cond4 to neutral
    const li = document.getElementById("cond4");
    const st = document.getElementById("s4");
    li.classList.remove("pass", "fail");
    st.textContent = "—";
    document.getElementById("condVerdict").classList.add("hidden");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  BUTTON HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

/* Show Decomposition */
document.getElementById("btnDecomp").addEventListener("click", () => {
  const { x, y, z } = state;
  const s = x + y + z;
  const valid = isInL(s);

  showResult(
    "Decomposition  —  s = xyz",
    [
      { label: "Step 1: Original string", value: `"${s}"`,                    cls: "step-ok" },
      { label: "Step 2: Set x",           value: `"${x}"  (blue)`,             cls: ""        },
      { label: "Step 3: Set y",           value: `"${y}"  (red, pumped part)`, cls: ""        },
      { label: "Step 4: Set z",           value: `"${z}"  (green)`,            cls: ""        },
      { label: "Step 5: Validation",      value: valid ? `✅ "${s}" ∈ L` : `❌ "${s}" ∉ L`, cls: valid ? "step-ok" : "step-fail" }
    ],
    x, y, z,
    valid
  );

  updateConditions(null);
});

/* Pump i = 2 */
document.getElementById("btnPump2").addEventListener("click", () => {
  const { x, y, z } = state;
  const yPumped = y.repeat(2);
  const pumped  = x + yPumped + z;
  const valid   = isInL(pumped);

  const mid   = pumped.length % 2 === 0 ? pumped.length / 2 : -1;
  const half1 = mid > 0 ? pumped.slice(0, mid) : "N/A";
  const half2 = mid > 0 ? pumped.slice(mid)    : "N/A";
  const halves = mid > 0 ? `"${half1}" vs "${half2}"` : "Odd length — cannot split";

  showResult(
    "Pump  i = 2  →  xy²z",
    [
      { label: "Step 1: Original",  value: `"${x + y + z}"`,                    cls: "step-ok"   },
      { label: "Step 2: Pump y×2", value: `y² = "${yPumped}"`,                  cls: ""          },
      { label: "Step 3: Build",     value: `xy²z = "${pumped}"  (len ${pumped.length})`, cls: "" },
      { label: "Step 4: Check halves", value: halves,                            cls: ""          },
      { label: "Step 5: Validation", value: valid ? `✅ "${pumped}" ∈ L` : `❌ "${pumped}" ∉ L`, cls: valid ? "step-ok" : "step-fail" }
    ],
    x, yPumped, z,
    valid
  );

  updateConditions(pumped);
});

/* Pump i = 3 */
document.getElementById("btnPump3").addEventListener("click", () => {
  const { x, y, z } = state;
  const yPumped = y.repeat(3);
  const pumped  = x + yPumped + z;
  const valid   = isInL(pumped);

  const mid   = pumped.length % 2 === 0 ? pumped.length / 2 : -1;
  const half1 = mid > 0 ? pumped.slice(0, mid) : "N/A";
  const half2 = mid > 0 ? pumped.slice(mid)    : "N/A";
  const halves = mid > 0
    ? `"${half1}" vs "${half2}" — ${half1 === half2 ? "Equal ✅" : "Not equal ❌"}`
    : "Odd length — cannot split ❌";

  showResult(
    "Pump  i = 3  →  xy³z",
    [
      { label: "Step 1: Original",     value: `"${x + y + z}"`,                       cls: "step-ok"   },
      { label: "Step 2: Pump y×3",     value: `y³ = "${yPumped}"`,                    cls: ""          },
      { label: "Step 3: Build",        value: `xy³z = "${pumped}"  (len ${pumped.length})`, cls: ""   },
      { label: "Step 4: Check halves", value: halves,                                  cls: ""          },
      { label: "Step 5: Validation",   value: valid ? `✅ "${pumped}" ∈ L` : `❌ "${pumped}" ∉ L`, cls: valid ? "step-ok" : "step-fail" }
    ],
    x, yPumped, z,
    valid
  );

  updateConditions(pumped);
});

// ══════════════════════════════════════════════════════════════════════════════
//  CUSTOM INPUT
// ══════════════════════════════════════════════════════════════════════════════

document.getElementById("btnTest").addEventListener("click", () => {
  const raw = document.getElementById("customInput").value.trim().toLowerCase();
  const fb  = document.getElementById("inputFeedback");

  // ── Validate ────────────────────────────────────────────────────────────
  if (raw.length === 0) {
    showFeedback(fb, "err", "⚠ Please enter a string.");
    return;
  }

  if (!/^[ab]+$/.test(raw)) {
    showFeedback(fb, "err", `⚠ Invalid input: Only characters 'a' and 'b' are allowed.`);
    return;
  }

  if (raw.length % 2 !== 0) {
    showFeedback(fb, "err", `⚠ Invalid input: String length must be even (length = ${raw.length}).`);
    return;
  }

  if (!isInL(raw)) {
    const mid = raw.length / 2;
    showFeedback(fb, "err",
      `⚠ Invalid input: "${raw}" ∉ L = {ww} — halves "${raw.slice(0,mid)}" ≠ "${raw.slice(mid)}".`);
    return;
  }

  // ── Accepted ────────────────────────────────────────────────────────────
  showFeedback(fb, "ok", `✅ Accepted! "${raw}" ∈ L — running simulation…`);

  // Update state
  state = decompose(raw);
  updateDecompUI();

  // Auto-show decomposition
  setTimeout(() => {
    document.getElementById("btnDecomp").click();
  }, 300);
});

/* Allow Enter key in input */
document.getElementById("customInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btnTest").click();
});

function showFeedback(el, type, msg) {
  el.className = `input-feedback ${type}`;
  el.textContent = msg;
}

// ══════════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════════
updateDecompUI();

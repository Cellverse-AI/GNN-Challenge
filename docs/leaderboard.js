/* Bioink GNN Challenge Leaderboard UI */

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = [];
    let cur = "", inQ = false;
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur);
    const obj = {};
    header.forEach((h, idx) => obj[h] = (cols[idx] ?? "").trim());
    rows.push(obj);
  }
  return rows;
}

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  const now = new Date();
  return (now - d) / (1000 * 60 * 60 * 24);
}

const state = {
  rows: [],
  filtered: [],
  sortKey: "combined_nmae",
  sortDir: "asc",
  hiddenCols: new Set(),
};

function renderTable() {
  const tbody = document.querySelector("#tbl tbody");
  tbody.innerHTML = "";
  const rows = state.filtered;

  rows.forEach((r, idx) => {
    const tr = document.createElement("tr");
    const rank = idx + 1;

    const cells = [
      ["rank", rank],
      ["team", r.team],
      ["model_type", r.model_type],
      ["combined_nmae", parseFloat(r.combined_nmae).toFixed(6)],
      ["pressure_nmae", parseFloat(r.pressure_nmae).toFixed(6)],
      ["temperature_nmae", parseFloat(r.temperature_nmae).toFixed(6)],
      ["speed_nmae", parseFloat(r.speed_nmae).toFixed(6)],
      ["timestamp_utc", r.timestamp_utc],
      ["notes", r.notes || ""],
    ];

    cells.forEach(([k, v]) => {
      const td = document.createElement("td");
      td.dataset.key = k;
      td.textContent = v;
      if (k === "rank") td.classList.add("rank");
      if (k.includes("nmae")) td.classList.add("nmae");
      if (state.hiddenCols.has(k)) td.style.display = "none";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  document.querySelectorAll("#tbl thead th").forEach(th => {
    const k = th.dataset.key;
    th.style.display = state.hiddenCols.has(k) ? "none" : "";
  });

  document.getElementById("status").textContent =
    rows.length ? `${rows.length} result(s)` : "No results";
}

function applyFilters() {
  const q = document.getElementById("search").value.toLowerCase().trim();
  const modelType = document.getElementById("modelFilter").value;
  const date = document.getElementById("dateFilter").value;

  let rows = [...state.rows];

  if (modelType !== "all") {
    rows = rows.filter(r => (r.model_type || "").toLowerCase() === modelType);
  }

  if (date !== "all") {
    const maxDays = (date === "last30") ? 30 : 180;
    rows = rows.filter(r => daysAgo(r.timestamp_utc) <= maxDays);
  }

  if (q) {
    rows = rows.filter(r => {
      const hay = `${r.team} ${r.model_type} ${r.notes} ${r.timestamp_utc}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const k = state.sortKey;
  const dir = state.sortDir === "asc" ? 1 : -1;
  rows.sort((a, b) => {
    let av = a[k], bv = b[k];
    if (k.includes("nmae") || k === "rank") {
      av = parseFloat(av); bv = parseFloat(bv);
      if (isNaN(av)) av = Infinity;
      if (isNaN(bv)) bv = Infinity;
      return (av - bv) * dir;
    }
    av = (av ?? "").toString().toLowerCase();
    bv = (bv ?? "").toString().toLowerCase();
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  state.filtered = rows;
  renderTable();
}

function setupColumnToggles() {
  const cols = [
    ["rank", "Rank"],
    ["team", "Team"],
    ["model_type", "Model Type"],
    ["combined_nmae", "NMAE"],
    ["pressure_nmae", "Pressure"],
    ["temperature_nmae", "Temp"],
    ["speed_nmae", "Speed"],
    ["timestamp_utc", "Date"],
    ["notes", "Notes"],
  ];
  const wrap = document.getElementById("columnToggles");
  wrap.innerHTML = "";
  cols.forEach(([k, label]) => {
    const id = `col_${k}`;
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !state.hiddenCols.has(k);
    cb.id = id;
    cb.addEventListener("change", () => {
      if (cb.checked) state.hiddenCols.delete(k);
      else state.hiddenCols.add(k);
      renderTable();
    });
    lab.appendChild(cb);
    const sp = document.createElement("span");
    sp.textContent = label;
    lab.appendChild(sp);
    wrap.appendChild(lab);
  });
}

function setupSorting() {
  document.querySelectorAll("#tbl thead th").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.key;
      if (!k) return;
      if (state.sortKey === k) {
        state.sortDir = (state.sortDir === "asc") ? "desc" : "asc";
      } else {
        state.sortKey = k;
        state.sortDir = (k.includes("nmae") || k === "rank") ? "asc" : "asc";
      }
      applyFilters();
    });
  });
}

async function main() {
  const status = document.getElementById("status");
  try {
    let rows;

    // 1. Try embedded data (fastest, works offline/local)
    if (window.LEADERBOARD_DATA) {
      rows = window.LEADERBOARD_DATA;
    }
    // 2. Fallback to fetch (for legacy support or if JS unavailable)
    else {
      // Fetch colocated CSV
      const res = await fetch("leaderboard.csv", { cache: "no-store" });
      const txt = await res.text();
      rows = parseCSV(txt);
    }

    const cleaned = rows
      .filter(r => r.team)
      .map(r => ({
        timestamp_utc: r.timestamp_utc,
        team: r.team,
        model_type: (r.model_type || "").toLowerCase(),
        combined_nmae: r.combined_nmae,
        pressure_nmae: r.pressure_nmae,
        temperature_nmae: r.temperature_nmae,
        speed_nmae: r.speed_nmae,
        notes: r.notes || "",
      }));

    state.rows = cleaned;

    setupColumnToggles();
    setupSorting();

    document.getElementById("search").addEventListener("input", applyFilters);
    document.getElementById("modelFilter").addEventListener("change", applyFilters);
    document.getElementById("dateFilter").addEventListener("change", applyFilters);

    state.sortKey = "combined_nmae";
    state.sortDir = "asc";
    applyFilters();
  } catch (e) {
    console.error(e);
    if (window.location.protocol === "file:") {
      status.innerHTML = `
        <strong>Error: Cannot load leaderboard data directly from file system.</strong><br><br>
        Browser security blocks fetch requests from <code>file://</code> URLs.<br>
        To view locally, run a simple server:<br><br>
        <code>python -m http.server</code><br><br>
        Then open: <a href="http://localhost:8000/leaderboard.html">http://localhost:8000/leaderboard.html</a>
      `;
    } else {
      status.textContent = "Failed to load leaderboard.csv. Check console for details.";
    }
  }
}

main();

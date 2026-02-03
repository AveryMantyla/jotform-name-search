let NAMES = [];

async function loadNames() {
  const res = await fetch("./names.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load names.json: ${res.status}`);
  NAMES = await res.json();

  const status = document.getElementById("status");
  if (status) status.textContent = `Loaded ${NAMES.length} names`;
  console.log("Loaded names:", NAMES.length);
}

function attachSearch() {
  const input = document.getElementById("q");
  const results = document.getElementById("results");

  if (!input || !results) {
    throw new Error("Missing #q input or #results container in index.html");
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (q.length < 2) return;

    const matches = NAMES
      .filter(n => String(n).toLowerCase().includes(q))
      .slice(0, 20);

    for (const name of matches) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = name;
      btn.style.display = "block";
      btn.style.margin = "2px 0";

      btn.onclick = () => {
        input.value = name;
        results.innerHTML = "";

        // Only send data if we're inside Jotform widget context
        if (window.JFCustomWidget && typeof window.JFCustomWidget.sendData === "function") {
          window.JFCustomWidget.sendData({ value: name });
        }
      };

      results.appendChild(btn);
    }
  });
}

async function startStandalone() {
  await loadNames();
  attachSearch();
}

function startInJotform() {
  window.JFCustomWidget.subscribe("ready", async function () {
    await loadNames();
    attachSearch();
  });

  // Optional hook
  window.JFCustomWidget.subscribe("submit", function () {
    // no-op
  });
}

// Decide mode
if (window.JFCustomWidget && typeof window.JFCustomWidget.subscribe === "function") {
  startInJotform();
} else {
  startStandalone().catch(err => {
    console.error(err);
    const results = document.getElementById("results");
    if (results) results.textContent = "Error: " + err.message;
  });
}

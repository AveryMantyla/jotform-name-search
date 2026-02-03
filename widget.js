let NAMES = [];

async function loadNames() {
  const res = await fetch("./names.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load names.json: ${res.status}`);
  NAMES = await res.json();
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

      btn.onclick = () => {
        input.value = name;
        results.innerHTML = "";

        // Only send data if we're actually inside Jotform
        if (window.JFCustomWidget && typeof window.JFCustomWidget.sendData === "function") {
          window.JFCustomWidget.sendData({ value: name });
        }
      };

      results.appendChild(btn);
      results.appendChild(document.createElement("br"));
    }
  });
}

async function startStandalone() {
  await loadNames();
  attachSearch();
}

function startInJotform() {
  // Jotform calls "ready" once the widget is loaded in the form
  window.JFCustomWidget.subscribe("ready", async function () {
    await loadNames();
    attachSearch();
  });

  // Optional: if you want to validate before submit, you can use "submit"
  window.JFCustomWidget.subscribe("submit", function () {
    // no-op
  });
}

// Decide mode:
if (window.JFCustomWidget && typeof window.JFCustomWidget.subscribe === "function") {
  startInJotform();
} else {
  // Not inside Jotform — run standalone so you can test on GitHub Pages
  startStandalone().catch(err => {
    console.error(err);
    const results = document.getElementById("results");
    if (results) results.textContent = "Error: " + err.message;
  });
}

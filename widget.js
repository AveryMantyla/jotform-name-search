let NAMES = [];

JFCustomWidget.subscribe("ready", async function () {
  // Load names list hosted on GitHub Pages (same origin as this widget page)
  const res = await fetch("./names.json", { cache: "no-store" });
  NAMES = await res.json(); // ["Aaliyah Darling", "Ryan Furner", ...]

  JFCustomWidget.subscribe("submit", function () {
    // optional: validation could happen here
  });
});

const input = document.getElementById("q");
const results = document.getElementById("results");

input.addEventListener("input", () => {
  const q = input.value.trim().toLowerCase();
  results.innerHTML = "";
  if (q.length < 2) return;

  const matches = NAMES
    .filter(n => n.toLowerCase().includes(q))
    .slice(0, 20);

  for (const name of matches) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = name;
    btn.onclick = () => {
      input.value = name;
      results.innerHTML = "";

      // Push value into Jotform field
      JFCustomWidget.sendData({ value: name });
    };
    results.appendChild(btn);
    results.appendChild(document.createElement("br"));
  }
});

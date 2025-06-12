const input = document.getElementById("location-bar-in-search");
let originalValue = "Mountain View, CA";
const focusPlaceholder = "Neighborhood, city or zip";

input.value = originalValue;

input.addEventListener("focus", () => {
  if (input.value === originalValue) {
    input.value = "";
  }
  input.placeholder = focusPlaceholder;
  input.classList.add("placeholder-focus");
  input.classList.remove("placeholder-default");
});

input.addEventListener("blur", () => {
  if (input.value.trim() === "") {
    input.value = originalValue;
  }
  input.classList.remove("placeholder-focus");
  input.classList.add("placeholder-default");
});

const form = document.getElementById("search-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim().toLowerCase();
  const inEvents = window.location.pathname.includes("/events/");

  if (value === "mountain view, ca" || value === "mountain viev, ca") {
    const path = inEvents
      ? "mountain-view.html"
      : "./events/mountain-view.html";
    window.location.href = path;
    return;
  }

  if (value === "new york" || value === "new york, ny") {
    const path = inEvents ? "new-york.html" : "./events/new-york.html";
    window.location.href = path;
    return;
  }
});

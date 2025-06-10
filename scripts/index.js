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

import { stateAbbreviationsUS } from "./stateAbbreviationsUS.js";

// const input = document.getElementById("location-bar-in-search");

// const originalPlaceholder = "Mountain View, CA";
// const focusPlaceholder = "Neighborhood, city or zip";

// input.addEventListener("focus", () => {
//   input.placeholder = focusPlaceholder;
//   input.classList.add("placeholder-focus");
//   input.classList.remove("placeholder-default");
// });

// input.addEventListener("blur", () => {
//   input.placeholder = originalPlaceholder;
//   input.classList.remove("placeholder-focus");
//   input.classList.add("placeholder-default");
// });

const input = document.getElementById("location-bar-in-search");

let originalValue = "";
const focusPlaceholder = "Neighborhood, city or zip";

function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
  return fetch(url).then((res) => res.json());
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      reverseGeocode(latitude, longitude)
        .then((data) => {
          const addr = data.address || {};
          const city =
            addr.city || addr.town || addr.village || addr.hamlet || "";
          const countryCode = addr.country_code
            ? addr.country_code.toUpperCase()
            : "";
          const stateFull = addr.state || addr.region || "";

          let locationText = "";

          if (countryCode === "US" && stateFull) {
            const stateAbbrev = stateAbbreviationsUS[stateFull] || "";

            if (city && stateAbbrev) {
              locationText = `${city}, ${stateAbbrev}`;
            } else if (city && stateFull) {
              locationText = `${city}, ${stateFull}`;
            } else {
              locationText = "Mountain View, CA";
            }
          } else if (city && countryCode) {
            locationText = `${city}, ${countryCode}`;
          } else if (city) {
            locationText = city;
          } else if (countryCode) {
            locationText = countryCode;
          } else {
            locationText = "Mountain View, CA";
          }

          originalValue = locationText;
          input.value = locationText;
        })
        .catch((err) => {
          console.log(err);
          originalValue = "Unable to determine location";
          input.value = originalValue;
        });
    },
    (error) => {
      console.log(error);
      originalValue = "Location unavailable";
      input.value = originalValue;
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  originalValue = "Mountain View, CA";
  input.value = originalValue;
}

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

const eventList = document.querySelector(".events-list");
const mapPanel = document.querySelector(".map-panel");
const mapContainer = document.getElementById("map");
const showMapBtn = document.getElementById("show-map-btn");
const mapOverlay = document.querySelector(".map-promo-overlay");
const minimizeMapBtn = document.getElementById("minimize-map-btn");
const typeFilter = document.getElementById("filter-type");
const distanceFilter = document.getElementById("filter-distance");
const categoryFilter = document.getElementById("filter-category");
const dateFilter = document.getElementById("filter-date");
const allFilters = [typeFilter, distanceFilter, categoryFilter, dateFilter];

const PLACEHOLDER_IMG = "../images/events/loading.webp";

let eventsData = [];

async function fetchEvents() {
  try {
    const resp = await fetch("../data/events.json");
    if (!resp.ok) throw new Error("Network response was not ok");
    const data = await resp.json();

    const slug = window.location.pathname
      .split("/")
      .pop()
      .replace(/\.html$/, "");

    const filtered = data.filter((ev) => ev.city === slug);

    await new Promise((res) => setTimeout(res, 200));
    eventsData = filtered.map((ev) => ({ ...ev, date: new Date(ev.date) }));
  } catch (err) {
    console.log("Failed to fetch events", err);
    if (typeof eventsStore !== "undefined") {
      eventsData = eventsStore;
    }
  }
}

function populateDateOptions() {
  const unique = Array.from(
    new Set(eventsData.map((ev) => ev.date.toISOString().slice(0, 10)))
  ).sort();

  dateFilter.innerHTML = '<option value="any">Any date</option>';
  unique.forEach((str) => {
    const d = new Date(str);
    const month = d
      .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
      .toUpperCase();
    const day = d.getUTCDate();
    const opt = document.createElement("option");
    opt.value = str;
    opt.textContent = `${day} ${month}`;
    dateFilter.appendChild(opt);
  });
}

function renderLoadingPlaceholders(count = 3) {
  eventList.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const placeholder = `
      <article class="event-card">
        <div class="image-overlay">
          <img src="${PLACEHOLDER_IMG}" alt="Loading" class="event-image" />
        </div>
        <div class="event-content">
          <div class="event-time"><span>Loading...</span></div>
          <h3 class="event-title">Loading...</h3>
        </div>
      </article>
    `;
    eventList.insertAdjacentHTML("beforeend", placeholder);
  }
}

let map;
let markers = [];
let mapInitialized = false;

function initMap() {
  let center = [40.73, -73.93];
  const firstWithCoords = eventsData.find((e) => e.coords);
  if (firstWithCoords) {
    center = [firstWithCoords.coords.lat, firstWithCoords.coords.lng];
  }

  map = L.map(mapContainer).setView(center, 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

function updateMapMarkers(eventsToRender) {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  eventsToRender.forEach((ev) => {
    if (ev.coords) {
      const marker = L.marker(ev.coords).addTo(map).bindPopup(ev.title);
      markers.push(marker);
    }
  });
}

function formatEventDate(date) {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };

  let formatted = date.toLocaleString("en-US", options);
  formatted = formatted.replace(/, (?=[^,]*$)/, " \u00B7 ");
  return `${formatted} UTC`;
}

function renderEvents(filteredEvents) {
  eventList.innerHTML = "";
  if (filteredEvents.length === 0) {
    eventList.innerHTML = "<p>No events found for these criteria.</p>";
    return;
  }
  filteredEvents.forEach((ev) => {
    const distanceText = ev.distance
      ? `<p class="event-category">${ev.category} (${ev.distance} km)</p>`
      : `<p class="event-category">${ev.category}</p>`;
    const attendeesText = ev.attendees
      ? `<span>${ev.attendees} ${
          ev.attendees === 1 ? "attendee" : "attendees"
        }</span>`
      : "";
    const eventCardHTML = `
      <article class="event-card">
        <div class="image-overlay"><img src="${ev.image}" alt="${
      ev.title
    }" class="event-image" /></div>
        <div class="event-content">
          <div class="event-time"><span>${formatEventDate(ev.date)}</span></div>
          <h3 class="event-title">${ev.title}</h3>
          ${distanceText}
          <div class="event-attendees">${attendeesText}</div>
        </div>
      </article>
    `;
    eventList.insertAdjacentHTML("beforeend", eventCardHTML);
  });
}

function updateFilterStyles() {
  allFilters.forEach((selectElement) => {
    const wrapper = selectElement.parentElement;
    if (selectElement.value !== "any") {
      wrapper.classList.add("filter-active");
    } else {
      wrapper.classList.remove("filter-active");
    }
  });
}

function applyFilters() {
  let filtered = eventsData;
  const type = typeFilter.value;
  const distance = distanceFilter.value;
  const category = categoryFilter.value;
  const dateVal = dateFilter.value;

  if (type !== "any") filtered = filtered.filter((e) => e.type === type);
  if (category !== "any")
    filtered = filtered.filter((e) => e.category === category);
  if (distance !== "any") {
    const dist = parseInt(distance);
    filtered = filtered.filter((e) => e.distance && e.distance <= dist);
  }
  if (dateVal !== "any") {
    filtered = filtered.filter(
      (e) => e.date.toISOString().slice(0, 10) === dateVal
    );
  }

  renderEvents(filtered);
  if (mapInitialized) {
    updateMapMarkers(filtered);
  }
  updateFilterStyles();
}

showMapBtn.addEventListener("click", () => {
  mapOverlay.classList.add("hidden");
  mapPanel.classList.add("expanded");
  if (!mapInitialized) {
    initMap();
    mapInitialized = true;
    applyFilters();
  }
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 400);
});

minimizeMapBtn.addEventListener("click", () => {
  mapPanel.classList.remove("expanded");
  mapOverlay.classList.remove("hidden");
});

allFilters.forEach((select) => {
  const wrapper = select.parentElement;

  select.addEventListener("change", () => {
    applyFilters();

    select.blur();
  });

  select.addEventListener("focus", () => {
    wrapper.classList.add("focused");
  });

  select.addEventListener("blur", () => {
    setTimeout(() => wrapper.classList.remove("focused"), 100);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  renderLoadingPlaceholders();
  await fetchEvents();
  populateDateOptions();
  applyFilters();
});

console.log("JS loaded");

// Initialize map
const map = L.map('map').setView([30.2686, 78.0108], 16);

// Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// -----------------------------
// Icons
// -----------------------------
const hospitalIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  iconSize: [32, 32]
});

const selectedHospitalIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32]
});

// -----------------------------
// Hospitals
// -----------------------------
const hospitals = [
  { name: "Hospital1", coords: [30.272866215169035, 78.00777104418394] },
  { name: "Hospital2", coords: [30.263867762600423, 78.01647005982332] }
];

let hospitalMarkers = [];

hospitals.forEach(h => {
  const marker = L.marker(h.coords, { icon: hospitalIcon })
    .addTo(map)
    .bindPopup("🏥 " + h.name);

  hospitalMarkers.push({ name: h.name, marker: marker });
});

// -----------------------------
// Dynamic Routing
// -----------------------------
let routeLayer = null;
let accidentMarker = null;

// Click event
map.on("click", function(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  console.log("Accident:", lat, lng);

  // Remove old marker
  if (accidentMarker) map.removeLayer(accidentMarker);

  // Red circle accident
  accidentMarker = L.circleMarker([lat, lng], {
    radius: 10,
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.8
  }).addTo(map)
    .bindPopup("🚨 Accident Location")
    .openPopup();

  // Fetch route
  fetch(`http://127.0.0.1:5000/route?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {

      const latlngs = data.path.map(coord => [coord[0], coord[1]]);

      // Remove old route
      if (routeLayer) map.removeLayer(routeLayer);

      // Draw route
      routeLayer = L.polyline(latlngs, {
        color: 'red',
        weight: 5
      }).addTo(map);

      map.fitBounds(routeLayer.getBounds());

      // Highlight hospital
      hospitalMarkers.forEach(h => {
        if (h.name === data.hospital) {
          h.marker.setIcon(selectedHospitalIcon);
        } else {
          h.marker.setIcon(hospitalIcon);
        }
      });

      // Update UI
      document.getElementById("info").innerHTML =
        `🚑 Hospital: ${data.hospital}<br>
         📏 Distance: ${data.distance} km<br>
         ⏱ Time: ${data.time} mins`;
    })
    .catch(err => {
      console.error(err);
      alert("Backend not running!");
    });
});

// -----------------------------
// Reset function
// -----------------------------
function resetMap() {
  if (routeLayer) map.removeLayer(routeLayer);
  if (accidentMarker) map.removeLayer(accidentMarker);

  document.getElementById("info").innerHTML =
    "Click on map to report accident";
}
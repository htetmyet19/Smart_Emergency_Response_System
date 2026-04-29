console.log("JS loaded");

// -----------------------------
// 🗺️ Initialize Map
// -----------------------------
const map = L.map('map').setView([30.2686, 78.0108], 16);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// -----------------------------
// 🎨 Icons
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
// 🏥 Hospitals
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
// 🚑 Routing Variables
// -----------------------------
let routeLayer = null;
let accidentMarker = null;

// -----------------------------
// 📍 Click Event
// -----------------------------
map.on("click", function(e) {

  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  console.log("Accident:", lat, lng);

  // Remove old accident marker
  if (accidentMarker) map.removeLayer(accidentMarker);

  // Add new accident marker
  accidentMarker = L.circleMarker([lat, lng], {
    radius: 10,
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.8
  }).addTo(map)
    .bindPopup("🚨 Accident Location")
    .openPopup();

  // -----------------------------
  // 🌐 Fetch backend
  // -----------------------------
  fetch(`http://127.0.0.1:5000/route?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {

      console.log("Response:", data);

      // -----------------------------
      // 🧠 GRAPH VISUALIZATION
      // -----------------------------
      document.getElementById('graph').innerHTML = "";

      const cy = cytoscape({
        container: document.getElementById('graph'),

        elements: [
          ...data.graph.nodes,
          ...data.graph.edges
        ],

        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)',
              'color': '#000',
              'text-valign': 'center',
              'text-halign': 'center'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc'
            }
          }
        ],

        layout: {
          name: 'cose'   // better layout
        }
      });

      // 🔥 SAFE A* PATH HIGHLIGHT
      if (data.node_path) {
        cy.nodes().forEach(n => {
          if (data.node_path.includes(n.id())) {
            n.style('background-color', 'red');
          }
        });
      } else {
        console.error("node_path missing from backend!");
      }

      // -----------------------------
      // 🗺️ DRAW ROUTE ON MAP
      // -----------------------------
      const latlngs = data.path.map(coord => [coord[0], coord[1]]);

      if (routeLayer) map.removeLayer(routeLayer);

      routeLayer = L.polyline(latlngs, {
        color: 'red',
        weight: 5
      }).addTo(map);

      map.fitBounds(routeLayer.getBounds());

      // -----------------------------
      // 🏥 Highlight Selected Hospital
      // -----------------------------
      hospitalMarkers.forEach(h => {
        if (h.name === data.hospital) {
          h.marker.setIcon(selectedHospitalIcon);
        } else {
          h.marker.setIcon(hospitalIcon);
        }
      });

      // -----------------------------
      // 📊 Update Info Panel
      // -----------------------------
      document.getElementById("info").innerHTML =
        `🚑 Hospital: ${data.hospital}<br>
         📏 Distance: ${data.distance} km<br>
         ⏱ Time: ${data.time} mins`;
    })
    .catch(err => {
      console.error(err);
      alert("Backend not running or error occurred!");
    });
});

// -----------------------------
// 🔄 Reset Function
// -----------------------------
function resetMap() {

  if (routeLayer) map.removeLayer(routeLayer);
  if (accidentMarker) map.removeLayer(accidentMarker);

  document.getElementById("info").innerHTML =
    "Click on map to report accident";

  document.getElementById('graph').innerHTML = "";
}
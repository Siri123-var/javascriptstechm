
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const placesList = document.getElementById('places-list');
const form = document.getElementById('add-place-form');
const input = document.getElementById('place-input');

let places = [];

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏳️';
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

async function geocodePlace(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      country_code: data[0].address?.country_code
    };
  }
  return null;
}


async function addPlace(place) {
  const geo = await geocodePlace(place);
  if (!geo) {
    alert('Place not found!');
    return;
  }
  const marker = L.marker([geo.lat, geo.lon]).addTo(map)
    .bindPopup(`<b>${place}</b><br>${geo.display_name}`);
  places.push({ place, ...geo, marker, visited: false });
  renderList();
  map.setView([geo.lat, geo.lon], 4, { animate: true });
}


function renderList() {
  placesList.innerHTML = '';
  places.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = item.visited ? 'visited' : '';
    li.innerHTML = `
      <span class="flag">${getFlagEmoji(item.country_code)}</span>
      <span>${item.place}</span>
      <button title="Mark as visited">${item.visited ? '✅' : '📍'}</button>
      <button title="Remove">🗑️</button>
    `;
    li.children[2].onclick = () => {
      item.visited = !item.visited;
      if (item.visited) {
        item.marker.setIcon(L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', iconSize: [32, 32] }));
      } else {
        item.marker.setIcon(new L.Icon.Default());
      }
      renderList();
    };
   
    li.children[3].onclick = () => {
      map.removeLayer(item.marker);
      places.splice(idx, 1);
      renderList();
    };
    placesList.appendChild(li);
  });
}

form.onsubmit = e => {
  e.preventDefault();
  addPlace(input.value.trim());
  input.value = '';
};
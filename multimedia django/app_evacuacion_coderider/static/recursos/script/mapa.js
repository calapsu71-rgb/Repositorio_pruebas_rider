document.addEventListener('DOMContentLoaded', () => {
  const contenedorMapa = document.getElementById('mapa');
  if (!contenedorMapa) return;

  // 1. Inicializar mapa en Popayán
  const map = L.map('mapa', {
    center: [2.4419, -76.6063],
    zoom: 15
  });

  // 2. Cargar servidor de mapas OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // 3. Forzar al navegador a renderizar las imágenes del mapa
  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  // 4. Marcador inicial
  L.marker([2.4419, -76.6063])
    .addTo(map)
    .bindPopup('<b>Punto de Evacuación Principal</b>')
    .openPopup();

  // 5. Botón de geolocalización y mapa
  const btnRuta = document.getElementById('btn-ruta');
  if (btnRuta) {
    btnRuta.addEventListener('click', () => {
      map.invalidateSize();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.setView([lat, lng], 16);

            L.marker([lat, lng])
              .addTo(map)
              .bindPopup('<b>📍 Tu ubicación actual</b>')
              .openPopup();
          },
          (err) => console.warn('GPS no disponible:', err.message)
        );
      }

      if (typeof URL_GEO !== 'undefined') {
        fetch(URL_GEO)
          .then((res) => res.json())
          .then((data) => {
            const capaRuta = L.geoJSON(data, {
              style: { color: '#d9534f', weight: 5 }
            }).addTo(map);
            map.fitBounds(capaRuta.getBounds());
          })
          .catch((err) => console.error('Error GeoJSON:', err));
      }
    });
  }
});
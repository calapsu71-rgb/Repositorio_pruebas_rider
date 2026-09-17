document.addEventListener("DOMContentLoaded", () => {
    // 1. Reloj de actualización
    const updateTime = () => {
        document.getElementById('sync-time').textContent = new Date().toLocaleTimeString();
    };
    updateTime();

    // 2. Inicialización del Mapa
    const map = L.map('map', { zoomControl: false }).setView([4.0, -75.0], 5);
    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileLayers = {
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }),
        street: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
    };
    tileLayers.dark.addTo(map);

    document.getElementById('layerFilter').addEventListener('change', (e) => {
        Object.values(tileLayers).forEach(layer => map.removeLayer(layer));
        tileLayers[e.target.value].addTo(map);
    });

    let geojsonLayer = L.geoJson().addTo(map);
    
    // Configuración visual por magnitudes
    const styleConfig = {
        low: { color: '#10B981' },      // Verde < 3.0
        moderate: { color: '#EAB308' }, // Amarillo 3.0-4.5
        strong: { color: '#F97316' },   // Naranja 4.5-6.0
        severe: { color: '#EF4444' }    // Rojo >= 6.0
    };

    function getMarkerStyle(mag) {
        if (mag >= 6.0) return styleConfig.severe;
        if (mag >= 4.5) return styleConfig.strong;
        if (mag >= 3.0) return styleConfig.moderate;
        return styleConfig.low;
    }

    // 3. Inicializar Gráfica Chart.js
    let magChart;
    const ctx = document.getElementById('magnitudeChart').getContext('2d');
    
    function updateChart(data) {
        const counts = { low: 0, moderate: 0, strong: 0, severe: 0 };
        data.features.forEach(f => {
            const mag = f.properties.mag;
            if (mag >= 6.0) counts.severe++;
            else if (mag >= 4.5) counts.strong++;
            else if (mag >= 3.0) counts.moderate++;
            else counts.low++;
        });

        const chartData = [counts.low, counts.moderate, counts.strong, counts.severe];

        if (magChart) {
            magChart.data.datasets[0].data = chartData;
            magChart.update();
        } else {
            magChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['< 3.0', '3.0 - 4.5', '4.5 - 6.0', '≥ 6.0'],
                    datasets: [{
                        data: chartData,
                        backgroundColor: [styleConfig.low.color, styleConfig.moderate.color, styleConfig.strong.color, styleConfig.severe.color],
                        borderWidth: 0, hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                    plugins: { legend: { position: 'right', labels: { color: '#94A3B8' } } }
                }
            });
        }
    }

    // 4. Consumo Asíncrono de los datos
    function loadEarthquakes(minMag = 2.5) {
        const loader = document.querySelector('.status-indicator');
        loader.classList.remove('online');
        loader.style.backgroundColor = '#EAB308';
        
        // Simulación conectando al origen real (Sustituir con tu endpoint /api/sismos/ de Django)
        const usgsUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMag == 2.5 ? '2.5' : 'all'}_day.geojson`;

        fetch(usgsUrl)
            .then(res => res.json())
            .then(data => {
                geojsonLayer.clearLayers();
                let tsunamiCount = 0;

                const filteredFeatures = data.features.filter(f => f.properties.mag >= parseFloat(minMag));
                const filteredData = { type: "FeatureCollection", features: filteredFeatures };

                L.geoJSON(filteredData, {
                    pointToLayer: function (feature, latlng) {
                        const mag = feature.properties.mag;
                        const style = getMarkerStyle(mag);
                        if(feature.properties.tsunami === 1) tsunamiCount++;

                        return L.circleMarker(latlng, {
                            radius: Math.max(mag * 2.5, 5),
                            fillColor: style.color, color: mag >= 6.0 ? '#fff' : style.color,
                            weight: mag >= 6.0 ? 2 : 1, opacity: 1, fillOpacity: 0.6
                        });
                    },
                    onEachFeature: function (feature, layer) {
                        const p = feature.properties;
                        const popupHTML = `
                            <div style="color: #1e293b; min-width: 200px;">
                                <h4 style="margin: 0 0 8px 0; font-size: 14px;">${p.place}</h4>
                                <b>Magnitud:</b> ${p.mag.toFixed(1)} M<br>
                                <b>Profundidad:</b> ${feature.geometry.coordinates[2].toFixed(1)} km<br>
                                ${p.tsunami === 1 ? '<br><span style="color:red;font-weight:bold;">⚠️ ALERTA TSUNAMI</span>' : ''}
                            </div>
                        `;
                        layer.bindPopup(popupHTML);
                    }
                }).addTo(geojsonLayer);

                document.getElementById('tsunami-count').textContent = tsunamiCount;
                updateChart(filteredData);
                updateTime();
                
                loader.style.backgroundColor = ''; loader.classList.add('online');
            })
            .catch(err => {
                console.error("Error:", err);
                loader.style.backgroundColor = '#EF4444';
            });
    }

    // 5. Asignar Eventos a la UI
    document.getElementById('magFilter').addEventListener('change', (e) => loadEarthquakes(e.target.value));
    
    document.getElementById('btn-refresh').addEventListener('click', () => {
        loadEarthquakes(document.getElementById('magFilter').value);
    });

    // Animar cámara del mapa desde la lista lateral
    document.querySelectorAll('.btn-locate').forEach(btn => {
        btn.addEventListener('click', function() {
            const lat = parseFloat(this.getAttribute('data-lat'));
            const lng = parseFloat(this.getAttribute('data-lng'));
            map.flyTo([lat, lng], 8, { duration: 1.5 });
        });
    });

    loadEarthquakes();
});
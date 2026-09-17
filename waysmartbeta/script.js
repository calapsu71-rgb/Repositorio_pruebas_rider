/**
 * ==========================================================================
 * WAYSMART ENTERPRISE v6.0 - ENGINE PRINCIPAL CON VOZ, IOT & POD RECEIPT
 * ==========================================================================
 */

// 🔊 SINTETIZADOR Y EFECTOS DE SONIDO WEB AUDIO API
const SoundEngine = {
    ctx: null,

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(type) {
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            switch (type) {
                case 'click':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    gain.gain.setValueAtTime(0.03, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;

                case 'add':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;

                case 'delete':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;

                case 'success':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.setValueAtTime(659.25, now + 0.07);
                    osc.frequency.setValueAtTime(783.99, now + 0.14);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;

                case 'alert':
                case 'panic':
                case 'thermalAlert':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.linearRampToValueAtTime(440, now + 0.25);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
            }
        } catch (e) {
            console.warn("Audio Context en espera de interacción.", e);
        }
    }
};

const WaySmartApp = {
    // Configuración Base
    origin: { id: 'origin-00', name: "Depósito Central Sede Principal", lat: 2.4580, lng: -76.5980 },

    stops: [
        { id: 'stop-1', guide: 'WS-101', name: "Parque Caldas - Centro", lat: 2.4419, lng: -76.6063, status: 'En Ruta', rating: 0 },
        { id: 'stop-2', guide: 'WS-102', name: "CC Campanario", lat: 2.4578, lng: -76.5982, status: 'Pendiente', rating: 0 },
        { id: 'stop-3', guide: 'WS-103', name: "Terminal de Transportes", lat: 2.4510, lng: -76.6020, status: 'Pendiente', rating: 0 }
    ],

    incidents: [],
    pickingLocationForIncident: false,
    activeFilter: 'all',
    currentTheme: 'dark',

    // Reconocimiento de Voz
    recognition: null,
    isListening: false,

    // Telemetría IoT Cadena de Frío
    iotTemp: 4.2,
    iotHumidity: 58,
    iotInterval: null,

    // Mapa & Animación
    map: null,
    tileLayer: null,
    markersGroup: null,
    incidentsGroup: null,
    routeLayer: null,
    vehicleMarker: null,
    simulationInterval: null,
    routeCoordinates: [],

    // Canvas Firma (POD)
    sigCanvas: null,
    sigCtx: null,
    isDrawing: false,

    tileProviders: {
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },

    // Métricas del Sistema
    currentCalculatedPath: [],
    totalKm: 0,
    totalMinutes: 0,
    trafficFactor: 1.0,
    selectedDriver: "Carlos Ruiz (Furgón 01 Refrigerado)",

    init() {
        this.initMap();
        this.initSignaturePad();
        this.initVoiceAssistant();
        this.initIoTTelemetry();
        this.bindEvents();
        this.renderStopsUI();
        this.processRoute();
        this.showToast("🚀 WaySmart v6.0 Enterprise activo.", "success");
        this.log("WaySmart Engine v6.0 con Voz e IoT iniciado.");
    },

    initMap() {
        this.map = L.map('leaflet-map').setView([this.origin.lat, this.origin.lng], 13);
        
        this.tileLayer = L.tileLayer(this.tileProviders.dark, {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 18
        }).addTo(this.map);

        this.markersGroup = L.layerGroup().addTo(this.map);
        this.incidentsGroup = L.layerGroup().addTo(this.map);

        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;

            if (this.pickingLocationForIncident) {
                document.getElementById('incident-location').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                this.pickingLocationForIncident = false;
                SoundEngine.play('click');
                this.showToast("Ubicación de incidente registrada.");
                return;
            }

            const nextId = this.stops.length + 1;
            this.stops.push({
                id: `stop-${Date.now()}`,
                guide: `WS-${100 + nextId}`,
                name: `Entrega Pin #${nextId}`,
                lat: lat,
                lng: lng,
                status: 'Pendiente',
                rating: 0
            });

            SoundEngine.play('add');
            this.renderStopsUI();
            this.processRoute();
            this.showToast(`Nueva parada añadida (Guía WS-${100 + nextId})`);
        });

        this.map.on('mousemove', (e) => {
            document.getElementById("map-coords-display").innerText = 
                `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
        });
    },

    /**
     * 🎙️ Asistente por Voz (Web Speech API)
     */
    initVoiceAssistant() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Navegador no soporta Web Speech API.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (e) => {
            const last = e.results.length - 1;
            const command = e.results[last][0].transcript.trim().toLowerCase();
            this.log(`🎙️ Comando de voz detectado: "${command}"`);

            if (command.includes('calcular ruta')) {
                SoundEngine.play('success');
                this.processRoute();
                this.showToast("🎙️ Voz: Calculando ruta óptima...");
            } else if (command.includes('simular') || command.includes('iniciar recorrido')) {
                SoundEngine.play('click');
                this.startLiveGpsSimulation();
                this.showToast("🎙️ Voz: Iniciando simulación GPS...");
            } else if (command.includes('modo noche') || command.includes('modo oscuro')) {
                this.setTheme('dark');
            } else if (command.includes('modo día') || command.includes('modo claro')) {
                this.setTheme('light');
            } else if (command.includes('limpiar mapa') || command.includes('borrar todo')) {
                this.clearAllStops();
                this.showToast("🎙️ Voz: Mapa limpiado.");
            } else if (command.includes('pánico') || command.includes('emergencia')) {
                SoundEngine.play('panic');
                this.showToast("🚨 Voz: ¡ALERTA DE PÁNICO ACTIVADA!", "danger");
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) this.recognition.start();
        };
    },

    toggleVoiceAssistant() {
        if (!this.recognition) {
            this.showToast("El navegador no admite reconocimiento de voz.", "danger");
            return;
        }

        const btn = document.getElementById('btn-toggle-voice');
        const txt = document.getElementById('voice-status-text');

        if (!this.isListening) {
            this.recognition.start();
            this.isListening = true;
            btn.classList.add('listening');
            txt.innerText = "Escuchando...";
            SoundEngine.play('click');
            this.showToast("🎙️ Asistente de Voz activado.");
        } else {
            this.recognition.stop();
            this.isListening = false;
            btn.classList.remove('listening');
            txt.innerText = "Voz OFF";
            SoundEngine.play('click');
            this.showToast("🎙️ Asistente de Voz deshabilitado.");
        }
    },

    /**
     * 🌡️ Telemetría IoT en Tiempo Real (Cadena de Frío)
     */
    initIoTTelemetry() {
        if (this.iotInterval) clearInterval(this.iotInterval);

        this.iotInterval = setInterval(() => {
            // Variación aleatoria de temperatura simulada
            const delta = (Math.random() - 0.48) * 0.4;
            this.iotTemp = parseFloat((this.iotTemp + delta).toFixed(1));

            if (this.iotTemp < 1.5) this.iotTemp = 1.8;
            if (this.iotTemp > 9.0) this.iotTemp = 8.5;

            const tempEl = document.getElementById('iot-temp');
            const statusBadge = document.getElementById('iot-status');
            tempEl.innerText = `${this.iotTemp} °C`;

            // Alerta si sobrepasa 7.5 °C (Cadena de frío en riesgo)
            if (this.iotTemp > 7.5) {
                tempEl.className = 'iot-val text-red';
                statusBadge.innerText = '⚠️ ALERTA FRÍO';
                statusBadge.style.background = 'rgba(248, 113, 113, 0.2)';
                statusBadge.style.color = '#f87171';
                SoundEngine.play('thermalAlert');
            } else {
                tempEl.className = 'iot-val text-green';
                statusBadge.innerText = 'Sensor OK';
                statusBadge.style.background = 'rgba(74, 222, 128, 0.15)';
                statusBadge.style.color = '#4ade80';
            }
        }, 4000);
    },

    /**
     * 🌗 Cambio de Tema Global
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `layout-app ${theme}-theme`;
        this.changeTileLayer(theme === 'dark' ? 'dark' : 'light');
        SoundEngine.play('click');
        this.showToast(`Modo visual cambiado a: ${theme.toUpperCase()}`);
    },

    initSignaturePad() {
        this.sigCanvas = document.getElementById('signature-pad');
        this.sigCtx = this.sigCanvas.getContext('2d');
        this.sigCtx.strokeStyle = "#0284c7";
        this.sigCtx.lineWidth = 2;

        const getPos = (e) => {
            const rect = this.sigCanvas.getBoundingClientRect();
            return {
                x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
                y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
            };
        };

        const startDraw = (e) => { 
            SoundEngine.init();
            this.isDrawing = true; 
            const pos = getPos(e); 
            this.sigCtx.beginPath(); 
            this.sigCtx.moveTo(pos.x, pos.y); 
        };
        const draw = (e) => { if (!this.isDrawing) return; const pos = getPos(e); this.sigCtx.lineTo(pos.x, pos.y); this.sigCtx.stroke(); };
        const stopDraw = () => { this.isDrawing = false; };

        this.sigCanvas.addEventListener('mousedown', startDraw);
        this.sigCanvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDraw);

        this.sigCanvas.addEventListener('touchstart', startDraw);
        this.sigCanvas.addEventListener('touchmove', draw);
        window.addEventListener('touchend', stopDraw);
    },

    clearSignature() {
        this.sigCtx.clearRect(0, 0, this.sigCanvas.width, this.sigCanvas.height);
        SoundEngine.play('delete');
        this.showToast("Lienzo de firma limpiado.");
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('role-btn') || e.target.classList.contains('filter-btn')) {
                SoundEngine.init();
            }
        });

        document.getElementById('btn-toggle-voice').addEventListener('click', () => this.toggleVoiceAssistant());
        document.getElementById('btn-toggle-theme').addEventListener('click', () => this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark'));

        document.getElementById('btn-calculate-route').addEventListener('click', () => { SoundEngine.play('success'); this.processRoute(); });
        document.getElementById('btn-simulate-gps').addEventListener('click', () => { SoundEngine.play('click'); this.startLiveGpsSimulation(); });

        document.getElementById('btn-add-demo').addEventListener('click', () => this.addRandomStop());
        document.getElementById('btn-clear-all').addEventListener('click', () => this.clearAllStops());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetToDefault());
        
        document.getElementById('map-tile-select').addEventListener('change', (e) => { SoundEngine.play('click'); this.changeTileLayer(e.target.value); });
        document.getElementById('driver-select').addEventListener('change', (e) => {
            SoundEngine.play('click');
            this.selectedDriver = e.target.value;
            document.getElementById('m-driver').innerText = this.selectedDriver.split(' ')[0];
            document.getElementById('v-title').innerText = this.selectedDriver.split('(')[1]?.replace(')', '') || 'Furgón 01';
            this.log(`Repartidor actualizado: ${this.selectedDriver}`);
        });

        // Tracking & POD
        document.getElementById('btn-search-package').addEventListener('click', () => { SoundEngine.play('click'); this.searchPackage(); });
        document.getElementById('btn-send-notify').addEventListener('click', () => {
            const guide = document.getElementById('track-input').value.trim();
            SoundEngine.play('success');
            this.showToast(`📲 Enlace de rastreo para ${guide} enviado por WhatsApp/SMS.`, "success");
        });

        document.getElementById('btn-panic').addEventListener('click', () => {
            SoundEngine.play('panic');
            this.showToast("🚨 ¡ALERTA DE PÁNICO ENVIADA AL CENTRO DE CONTROL!", "danger");
            this.log("🚨 ALERTA CRÍTICA: El conductor activó el Botón de Pánico.");
        });

        // POD Receipt Modal
        document.getElementById('btn-open-receipt-modal').addEventListener('click', () => this.openReceiptModal());
        document.getElementById('btn-close-modal').addEventListener('click', () => document.getElementById('pod-modal').classList.add('hidden'));
        document.getElementById('btn-print-receipt').addEventListener('click', () => window.print());

        document.getElementById('btn-pick-location').addEventListener('click', () => {
            SoundEngine.play('click');
            this.pickingLocationForIncident = true;
            this.showToast("Haz clic en el mapa para marcar el contratiempo.");
        });

        document.getElementById('incident-form').addEventListener('submit', (e) => { e.preventDefault(); this.registerIncident(); });
        document.getElementById('btn-clear-sig').addEventListener('click', () => this.clearSignature());
        document.getElementById('btn-confirm-pod').addEventListener('click', () => this.confirmPOD());

        // Exportación
        document.getElementById('btn-copy-json').addEventListener('click', () => { SoundEngine.play('click'); this.copyJSON(); });
        document.getElementById('btn-download-csv').addEventListener('click', () => { SoundEngine.play('click'); this.downloadCSV(); });
        document.getElementById('btn-download-gpx').addEventListener('click', () => { SoundEngine.play('click'); this.downloadGPX(); });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                SoundEngine.play('click');
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeFilter = e.target.dataset.filter;
                this.updateTableAndJSON(this.currentCalculatedPath);
            });
        });

        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                SoundEngine.play('click');
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const role = e.target.dataset.role;
                const sectionMap = { client: 'tracking-section', incident: 'incidents-section', pod: 'pod-section', distributor: 'map-section' };
                document.getElementById(sectionMap[role])?.scrollIntoView({ behavior: 'smooth' });
            });
        });

        document.getElementById('traffic-slider').addEventListener('input', (e) => {
            this.trafficFactor = parseFloat(e.target.value);
            document.getElementById('traffic-val').innerText = `${this.trafficFactor.toFixed(1)}x`;
            this.updateMetricsUI();
        });
    },

    /**
     * 🧾 Generador de Comprobante Imprimible (POD Receipt)
     */
    openReceiptModal() {
        const select = document.getElementById('pod-guide-select');
        const item = this.stops.find(s => s.id === select.value) || this.stops[0];
        const receiver = document.getElementById('pod-receiver-name').value.trim() || 'Juan Pérez (Cliente)';
        const otp = document.getElementById('pod-otp').value.trim() || '4821';

        document.getElementById('r-guide').innerText = item.guide;
        document.getElementById('r-destination').innerText = item.name;
        document.getElementById('r-receiver').innerText = receiver;
        document.getElementById('r-datetime').innerText = new Date().toLocaleString();
        document.getElementById('r-otp').innerText = otp;
        document.getElementById('r-driver').innerText = this.selectedDriver;

        // Cargar firma capturada
        const sigDataUrl = this.sigCanvas.toDataURL();
        document.getElementById('r-sig-img').src = sigDataUrl;

        // Generar Código QR Auténtico
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
            text: `WAYSMART-POD:${item.guide}:${otp}:${Date.now()}`,
            width: 90,
            height: 90
        });

        document.getElementById('pod-modal').classList.remove('hidden');
        SoundEngine.play('success');
    },

    optimizeSequence(points) {
        if (points.length <= 2) return points;
        let unvisited = [...points];
        let path = [unvisited.shift()];

        while (unvisited.length > 0) {
            let last = path[path.length - 1];
            let nearestIdx = 0;
            let minDistance = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                let dist = this.haversine(last.lat, last.lng, unvisited[i].lat, unvisited[i].lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIdx = i;
                }
            }
            path.push(unvisited.splice(nearestIdx, 1)[0]);
        }
        return path;
    },

    async processRoute() {
        if (this.stops.length === 0) {
            this.clearMapLayers();
            return;
        }

        const allPoints = [this.origin, ...this.stops];
        const optimizedPath = this.optimizeSequence(allPoints);
        this.currentCalculatedPath = optimizedPath;

        this.renderMarkers(optimizedPath);

        const coordsStr = optimizedPath.map(p => `${p.lng},${p.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
                const route = data.routes[0];
                this.totalKm = route.distance / 1000;
                
                const incidentPenalty = this.incidents.length * 5;
                this.totalMinutes = Math.round((route.duration / 60) + incidentPenalty);

                this.routeCoordinates = route.geometry.coordinates.map(c => [c[1], c[0]]);
                this.renderRoutePolyline(route.geometry);
                this.log(`Ruta optimizada correctamente (${this.totalKm.toFixed(2)} km).`);
            }
        } catch (err) {
            this.log("⚠️ Error al conectar con OSRM. Trazando líneas directas.");
        }

        this.updateTableAndJSON(optimizedPath);
        this.updateMetricsUI();
        this.populatePODSelect();
        this.searchPackage();
    },

    startLiveGpsSimulation() {
        if (!this.routeCoordinates || this.routeCoordinates.length === 0) {
            SoundEngine.play('alert');
            this.showToast("Primero calcula una ruta válida.", "danger");
            return;
        }

        if (this.simulationInterval) clearInterval(this.simulationInterval);

        document.getElementById('v-status').innerText = "En Ruta";
        document.getElementById('v-status').style.color = "#38bdf8";

        let step = 0;
        const totalSteps = this.routeCoordinates.length;

        const vehicleIcon = L.divIcon({
            className: 'vehicle-gps-pin',
            html: `<div style="background:#38bdf8; color:#000; padding:6px; border-radius:50%; font-size:18px; border:2px solid #fff; box-shadow: 0 0 15px #38bdf8;">🚚</div>`,
            iconSize: [32, 32]
        });

        if (this.vehicleMarker) this.map.removeLayer(this.vehicleMarker);
        this.vehicleMarker = L.marker(this.routeCoordinates[0], { icon: vehicleIcon }).addTo(this.map);

        this.showToast("🚚 Simulación GPS iniciada en tiempo real.", "success");

        this.simulationInterval = setInterval(() => {
            if (step < totalSteps) {
                const coord = this.routeCoordinates[step];
                this.vehicleMarker.setLatLng(coord);
                this.map.panTo(coord, { animate: true });
                step += Math.max(1, Math.floor(totalSteps / 50));
            } else {
                clearInterval(this.simulationInterval);
                document.getElementById('v-status').innerText = "Ruta Finalizada";
                document.getElementById('v-status').style.color = "#4ade80";
                SoundEngine.play('success');
                this.showToast("🏁 Recorrido simulado completado.");
            }
        }, 300);
    },

    searchPackage() {
        const query = document.getElementById('track-input').value.trim().toUpperCase();
        const container = document.getElementById('tracking-result-container');

        const item = this.stops.find(s => s.guide.toUpperCase() === query);

        if (!item) {
            container.innerHTML = `
                <div class="tracking-result-card">
                    <p class="text-yellow">⚠️ Número de guía <strong>"${query}"</strong> no encontrado. Intenta con <code>WS-101</code>.</p>
                </div>
            `;
            return;
        }

        const isDelivered = item.status === 'Entregado';

        container.innerHTML = `
            <div class="tracking-result-card">
                <div class="tracking-info-header">
                    <div>
                        <span class="text-muted" style="font-size:0.8rem;">Estado del Paquete:</span>
                        <h3 class="text-blue">${item.guide} — ${item.name}</h3>
                    </div>
                    <div style="text-align:right;">
                        <span class="text-muted" style="font-size:0.8rem;">Estado Actual:</span>
                        <h3 class="${isDelivered ? 'text-green' : 'text-yellow'}">${item.status}</h3>
                    </div>
                </div>

                <div class="tracking-timeline">
                    <div class="timeline-step completed"><div class="step-icon">✓</div><span>Recibido</span></div>
                    <div class="timeline-step completed"><div class="step-icon">✓</div><span>Despachado</span></div>
                    <div class="timeline-step ${isDelivered ? 'completed' : 'active'}"><div class="step-icon">🚚</div><span>En Ruta</span></div>
                    <div class="timeline-step ${isDelivered ? 'completed active' : ''}"><div class="step-icon">📦</div><span>Entregado</span></div>
                </div>

                ${isDelivered ? `
                    <div class="feedback-box">
                        <label>⭐ Evalúa el servicio de entrega:</label>
                        <div class="stars-row">
                            ${[1,2,3,4,5].map(star => `<span class="star ${item.rating >= star ? 'active' : ''}" onclick="WaySmartApp.rateService('${item.id}', ${star})">★</span>`).join('')}
                        </div>
                        <p class="text-muted" style="font-size:0.75rem;">¡Gracias por ayudarnos a mejorar nuestro servicio!</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    rateService(stopId, rating) {
        const item = this.stops.find(s => s.id === stopId);
        if (item) {
            item.rating = rating;
            SoundEngine.play('success');
            this.searchPackage();
            this.showToast(`Calificación de ${rating} estrellas guardada. ¡Gracias!`, "success");
        }
    },

    populatePODSelect() {
        const select = document.getElementById('pod-guide-select');
        select.innerHTML = "";
        this.stops.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.innerText = `${s.guide} - ${s.name} (${s.status})`;
            select.appendChild(opt);
        });
    },

    confirmPOD() {
        const select = document.getElementById('pod-guide-select');
        const receiver = document.getElementById('pod-receiver-name').value.trim();
        const otp = document.getElementById('pod-otp').value.trim();

        if (!receiver || !otp) {
            SoundEngine.play('alert');
            this.showToast("Por favor ingresa el nombre de quien recibe y el código OTP.", "danger");
            return;
        }

        const item = this.stops.find(s => s.id === select.value);
        if (item) {
            item.status = 'Entregado';
            SoundEngine.play('success');
            this.renderStopsUI();
            this.processRoute();
            this.showToast(`✅ Entrega de ${item.guide} registrada exitosamente.`, "success");
            this.log(`POD Confirmado para ${item.guide} por ${receiver}. OTP: ${otp}`);
        }
    },

    registerIncident() {
        const type = document.getElementById('incident-type').value;
        const coordsStr = document.getElementById('incident-location').value;
        const desc = document.getElementById('incident-desc').value;

        if (!coordsStr) return;

        const [lat, lng] = coordsStr.split(',').map(n => parseFloat(n.trim()));
        const newInc = { id: Date.now(), type, lat, lng, desc, time: new Date().toLocaleTimeString() };
        this.incidents.push(newInc);

        SoundEngine.play('alert');

        const warningIcon = L.divIcon({
            className: 'incident-pin',
            html: `<div style="background:#fbbf24; color:#000; font-size:16px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 10px #fbbf24;">⚠️</div>`,
            iconSize: [28, 28]
        });

        L.marker([lat, lng], { icon: warningIcon }).addTo(this.incidentsGroup)
            .bindPopup(`<b>${type}</b><br>${desc}`);

        document.getElementById('incident-location').value = '';
        document.getElementById('incident-desc').value = '';

        this.renderIncidentsFeed();
        this.processRoute();
        this.showToast("Alerta vial registrada en el sistema.");
    },

    renderIncidentsFeed() {
        const feed = document.getElementById('incidents-feed');
        document.getElementById('incidents-count').innerText = this.incidents.length;

        if (this.incidents.length === 0) {
            feed.innerHTML = '<p class="text-muted">No hay alertas activas.</p>';
            return;
        }

        feed.innerHTML = '';
        this.incidents.forEach(inc => {
            const div = document.createElement('div');
            div.className = 'incident-item';
            div.innerHTML = `<strong>${inc.type}</strong><br><small>${inc.desc} (${inc.time})</small>`;
            feed.appendChild(div);
        });
    },

    renderStopsUI() {
        const container = document.getElementById("stops-container");
        container.innerHTML = "";

        this.stops.forEach((stop, idx) => {
            const row = document.createElement("div");
            row.className = "stop-row";
            row.innerHTML = `
                <span class="stop-badge">${idx + 1}</span>
                <input type="text" value="${stop.name}" onchange="WaySmartApp.updateStopName(${idx}, this.value)">
                <span class="guide-code">${stop.guide}</span>
                <button type="button" class="btn-remove" onclick="WaySmartApp.removeStop(${idx})">✕</button>
            `;
            container.appendChild(row);
        });

        const delivered = this.stops.filter(s => s.status === 'Entregado').length;
        const inroute = this.stops.filter(s => s.status === 'En Ruta').length;
        const pending = this.stops.filter(s => s.status === 'Pendiente').length;

        document.getElementById('c-delivered').innerText = delivered;
        document.getElementById('c-inroute').innerText = inroute;
        document.getElementById('c-pending').innerText = pending;
        document.getElementById('c-alerts').innerText = this.incidents.length;
    },

    renderMarkers(path) {
        this.markersGroup.clearLayers();

        path.forEach((pt, idx) => {
            const isOrigin = idx === 0;
            const iconHtml = isOrigin ? 
                `<div style="background:#4ade80; color:#000; padding:4px 8px; border-radius:12px; font-weight:800; font-size:11px; border:2px solid #fff;">🏠 Base</div>` :
                `<div style="background:#0284c7; color:#fff; width:26px; height:26px; border-radius:50%; text-align:center; line-height:22px; font-weight:800; font-size:11px; border:2px solid #fff;">${idx}</div>`;

            const marker = L.marker([pt.lat, pt.lng], {
                icon: L.divIcon({ className: 'custom-pin', html: iconHtml, iconSize: isOrigin ? [55, 22] : [26, 26] }),
                draggable: !isOrigin
            }).addTo(this.markersGroup);

            marker.bindPopup(`<b>${isOrigin ? 'Almacén Base' : 'Guía: ' + (pt.guide || '')}</b><br>${pt.name}`);

            if (!isOrigin) {
                marker.on('dragend', (e) => {
                    const newPos = e.target.getLatLng();
                    const stopObj = this.stops.find(s => s.id === pt.id);
                    if (stopObj) {
                        stopObj.lat = newPos.lat;
                        stopObj.lng = newPos.lng;
                        SoundEngine.play('click');
                        this.renderStopsUI();
                        this.processRoute();
                    }
                });
            }
        });
    },

    renderRoutePolyline(geojsonGeometry) {
        if (this.routeLayer) this.map.removeLayer(this.routeLayer);
        this.routeLayer = L.geoJSON(geojsonGeometry, { style: { color: '#0284c7', weight: 5, opacity: 0.85 } }).addTo(this.map);
        this.map.fitBounds(this.routeLayer.getBounds(), { padding: [40, 40] });
    },

    /**
     * ROI & Métrica Financiera Calculada
     */
    updateMetricsUI() {
        const adjustedMinutes = Math.round(this.totalMinutes * this.trafficFactor);
        const fuelCost = (this.totalKm * 0.14).toFixed(2);
        const co2Emissions = (this.totalKm * 0.12).toFixed(2);

        document.getElementById("m-driver").innerText = this.selectedDriver.split(' ')[0];
        document.getElementById("m-dist").innerText = `${this.totalKm.toFixed(1)} km`;
        document.getElementById("m-time").innerText = `${adjustedMinutes} min`;
        document.getElementById("m-fuel").innerText = `$${fuelCost} USD`;
        document.getElementById("m-co2").innerText = `${co2Emissions} kg`;

        // Cálculo ROI
        const savingsPercent = Math.min(32, Math.round(this.stops.length * 4.2));
        const costPerGuide = this.stops.length > 0 ? (parseFloat(fuelCost) / this.stops.length).toFixed(2) : "0.00";
        const timeSaved = Math.round(this.totalKm * 1.8);

        document.getElementById("roi-savings").innerText = `${savingsPercent}%`;
        document.getElementById("roi-cost-per-guide").innerText = `$${costPerGuide} USD`;
        document.getElementById("roi-time-saved").innerText = `${timeSaved} min`;
    },

    updateTableAndJSON(path) {
        const tbody = document.getElementById("itinerary-tbody");
        tbody.innerHTML = "";
        let accumDist = 0;

        path.forEach((pt, idx) => {
            if (idx > 0) accumDist += this.haversine(path[idx-1].lat, path[idx-1].lng, pt.lat, pt.lng);

            const statusClass = pt.status === 'Entregado' ? 'delivered' : (pt.status === 'En Ruta' ? 'inroute' : 'pending');

            if (this.activeFilter !== 'all' && pt.status !== this.activeFilter && idx !== 0) return;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${idx === 0 ? 'Origen' : '#' + idx}</td>
                <td><span class="guide-code">${pt.guide || 'N/A'}</span></td>
                <td><strong>${pt.name}</strong></td>
                <td><span class="status-pill ${statusClass}">${pt.status || 'Base'}</span></td>
                <td>${accumDist.toFixed(2)} km</td>
                <td><button class="btn-outline-sm" onclick="WaySmartApp.focusMapOnPoint(${pt.lat}, ${pt.lng})">🔍 Ver</button></td>
            `;
            tbody.appendChild(tr);
        });

        const payload = {
            system: "WaySmart Engine v6.0 Enterprise",
            driver: this.selectedDriver,
            timestamp: new Date().toISOString(),
            telemetry_iot: { cold_chain_temp_celsius: this.iotTemp, sensor_battery: "94%" },
            metrics: { total_stops: this.stops.length, total_km: parseFloat(this.totalKm.toFixed(2)), total_minutes: this.totalMinutes },
            sequence: path.map((p, i) => ({ step: i, guide: p.guide || null, name: p.name, status: p.status, coords: { lat: p.lat, lng: p.lng } }))
        };

        document.getElementById("json-output").innerText = JSON.stringify(payload, null, 2);
    },

    showToast(message, type = "normal") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    addRandomStop() {
        const offsetLat = (Math.random() - 0.5) * 0.035;
        const offsetLng = (Math.random() - 0.5) * 0.035;
        const nextId = this.stops.length + 1;
        this.stops.push({
            id: `stop-${Date.now()}`,
            guide: `WS-${100 + nextId}`,
            name: `Entrega Demo #${nextId}`,
            lat: this.origin.lat + offsetLat,
            lng: this.origin.lng + offsetLng,
            status: 'Pendiente',
            rating: 0
        });

        SoundEngine.play('add');
        this.renderStopsUI();
        this.processRoute();
    },

    removeStop(index) { 
        this.stops.splice(index, 1); 
        SoundEngine.play('delete');
        this.renderStopsUI(); 
        this.processRoute(); 
    },

    updateStopName(index, val) { this.stops[index].name = val; this.processRoute(); },

    clearAllStops() { 
        this.stops = []; 
        SoundEngine.play('delete');
        this.renderStopsUI(); 
        this.processRoute(); 
    },

    resetToDefault() {
        this.stops = [
            { id: 'stop-1', guide: 'WS-101', name: "Parque Caldas - Centro", lat: 2.4419, lng: -76.6063, status: 'En Ruta', rating: 0 },
            { id: 'stop-2', guide: 'WS-102', name: "CC Campanario", lat: 2.4578, lng: -76.5982, status: 'Pendiente', rating: 0 },
            { id: 'stop-3', guide: 'WS-103', name: "Terminal de Transportes", lat: 2.4510, lng: -76.6020, status: 'Pendiente', rating: 0 }
        ];
        this.incidents = [];
        this.incidentsGroup.clearLayers();
        SoundEngine.play('delete');
        this.renderIncidentsFeed();
        this.renderStopsUI();
        this.processRoute();
        this.showToast("Sistema reiniciado a la configuración inicial.");
    },

    changeTileLayer(key) {
        if (this.tileProviders[key]) {
            this.map.removeLayer(this.tileLayer);
            this.tileLayer = L.tileLayer(this.tileProviders[key], { maxZoom: 18 }).addTo(this.map);
        }
    },

    focusMapOnPoint(lat, lng) { 
        SoundEngine.play('click');
        this.map.setView([lat, lng], 16, { animate: true }); 
    },

    haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    },

    log(msg) {
        const logsContainer = document.getElementById("terminal-logs");
        const p = document.createElement("p");
        p.innerHTML = `<code>[${new Date().toLocaleTimeString()}] ${msg}</code>`;
        logsContainer.appendChild(p);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    },

    clearMapLayers() { this.markersGroup.clearLayers(); if (this.routeLayer) this.map.removeLayer(this.routeLayer); },
    copyJSON() { navigator.clipboard.writeText(document.getElementById("json-output").innerText); this.showToast("Payload JSON copiado."); },

    downloadCSV() {
        let csv = "Guia,Orden,Nombre,Estado,Latitud,Longitud\n";
        this.currentCalculatedPath.forEach((pt, i) => { csv += `"${pt.guide || 'N/A'}",${i},"${pt.name}","${pt.status || 'Base'}",${pt.lat},${pt.lng}\n`; });
        this.triggerDownload(csv, "waysmart_guias.csv", "text/csv");
    },

    downloadGPX() {
        let gpx = `<?xml version="1.0"?><gpx version="1.1"><trk><name>Ruta WaySmart</name><trkseg>`;
        this.currentCalculatedPath.forEach(pt => { gpx += `<trkpt lat="${pt.lat}" lon="${pt.lng}"><name>${pt.name}</name></trkpt>`; });
        gpx += `</trkseg></trk></gpx>`;
        this.triggerDownload(gpx, "waysmart_ruta.gpx", "application/gpx+xml");
    },

    triggerDownload(content, fileName, mimeType) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
        a.download = fileName;
        a.click();
    }
};

document.addEventListener("DOMContentLoaded", () => WaySmartApp.init());
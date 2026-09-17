// --- MÓDULO 1: REPRODUCTOR DE EMISORA EN VIVO ---
function iniciarAudio() {
    const audio = document.getElementById("audio-emisora");
    const selectEmisora = document.getElementById("select-emisora");
    const btnPlayPause = document.getElementById("btn-play-pause");
    const iconoBtn = btnPlayPause.querySelector("i");
    const sliderVolumen = document.getElementById("slider-volumen");
    const statusText = document.getElementById("emisora-status");

    audio.src = selectEmisora.value;
    audio.volume = sliderVolumen.value;
    audio.autoplay = true;

    audio.play().catch(err => console.log("Autoplay restricción ejecutada:", err));
    iconoBtn.className = "fas fa-pause";
    statusText.textContent = "Sonando: " + selectEmisora.options[selectEmisora.selectedIndex].text;

    selectEmisora.addEventListener("change", () => {
        audio.src = selectEmisora.value;
        audio.play();
        iconoBtn.className = "fas fa-pause";
        statusText.textContent = "Sonando: " + selectEmisora.options[selectEmisora.selectedIndex].text;
    });

    btnPlayPause.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            iconoBtn.className = "fas fa-pause";
            statusText.textContent = "Sonando: " + selectEmisora.options[selectEmisora.selectedIndex].text;
        } else {
            audio.pause();
            iconoBtn.className = "fas fa-play";
            statusText.textContent = "Pausado";
        }
    });

    sliderVolumen.addEventListener("input", (e) => {
        audio.volume = e.target.value;
    });
}

// --- MÓDULO 2: JUEGO LOCAL LA SERPIENTICA (SNAKE CANVAS JS) ---
function iniciarSnake() {
    const canvas = document.getElementById("snake-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scoreElement = document.getElementById("snake-score");
    const btnStart = document.getElementById("btn-start-snake");

    const gridSize = 20; // Tamaño de cada cuadrícula en píxeles (20x20)
    const tileCount = canvas.width / gridSize; // 400 / 20 = 20 casillas por lado

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameInterval = null;
    let gameRunning = false;

    // Generar comida en posición aleatoria libre
    function generarComida() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Evitar que aparezca sobre el cuerpo de la serpiente
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) {
                generarComida();
            }
        });
    }

    // Dibujar pantalla de inicio inicial
    function pantallaInicial() {
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffca28";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¡LA SERPIENTICA!", canvas.width / 2, canvas.height / 2 - 10);

        ctx.fillStyle = "#aaa";
        ctx.font = "13px Arial";
        ctx.fillText("Presiona 'Iniciar Juego' para comenzar", canvas.width / 2, canvas.height / 2 + 20);
    }

    // Bucle principal de actualización del juego
    function actualizarJuego() {
        if (!gameRunning) return;

        // Calcular nueva posición de la cabeza
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Detección de colisiones contra bordes o contra sí misma
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || colisionSerpiente(head)) {
            finDelJuego();
            return;
        }

        // Agregar nueva cabeza
        snake.unshift(head);

        // Detección si comió la fruta
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            generarComida();
        } else {
            // Eliminar cola si no comió
            snake.pop();
        }

        // Renderizado del tablero y elementos
        renderizar();
    }

    function renderizar() {
        // Fondo
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rejilla sutil
        ctx.strokeStyle = "#1a1a1a";
        for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Dibujar comida (manzana/cuadro brillante)
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

        // Dibujar Serpiente
        snake.forEach((part, index) => {
            // Cabeza color oro, cuerpo dorado claro
            ctx.fillStyle = index === 0 ? "#ffca28" : "#ffd54f";
            ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });
    }

    function colisionSerpiente(head) {
        return snake.some(part => part.x === head.x && part.y === head.y);
    }

    function finDelJuego() {
        clearInterval(gameInterval);
        gameRunning = false;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¡GAME OVER!", canvas.width / 2, canvas.height / 2 - 10);

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(`Puntuación Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

        btnStart.innerHTML = '<i class="fas fa-redo"></i> Reiniciar Juego';
    }

    function empezarJuego() {
        snake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 }
        ];
        dx = 0;
        dy = -1; // Comienza moviéndose hacia arriba
        score = 0;
        scoreElement.textContent = score;
        
        generarComida();

        if (gameInterval) clearInterval(gameInterval);
        gameRunning = true;
        gameInterval = setInterval(actualizarJuego, 100);

        btnStart.innerHTML = '<i class="fas fa-redo"></i> Reiniciar Juego';
    }

    // Funciones de dirección
    function moverArriba() { if (dy === 0) { dx = 0; dy = -1; } }
    function moverAbajo() { if (dy === 0) { dx = 0; dy = 1; } }
    function moverIzquierda() { if (dx === 0) { dx = -1; dy = 0; } }
    function moverDerecha() { if (dx === 0) { dx = 1; dy = 0; } }

    // Escuchador Teclado
    document.addEventListener("keydown", (e) => {
        if (!gameRunning) return;
        
        const teclas = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"];
        if (teclas.includes(e.key)) {
            e.preventDefault(); // Evita el desplazamiento de la página
        }

        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") moverArriba();
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") moverAbajo();
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moverIzquierda();
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moverDerecha();
    });

    // Escuchadores Botones en Pantalla
    document.getElementById("btn-up").addEventListener("click", moverArriba);
    document.getElementById("btn-down").addEventListener("click", moverAbajo);
    document.getElementById("btn-left").addEventListener("click", moverIzquierda);
    document.getElementById("btn-right").addEventListener("click", moverDerecha);

    // Botón Iniciar/Reiniciar
    btnStart.addEventListener("click", empezarJuego);

    // Mostrar pantalla de bienvenida al cargar
    pantallaInicial();
}

// --- MÓDULO 3: APLICACIÓN PAINT (CANVAS 2D) ---
function iniciarPaint() {
    const canvas = document.getElementById("paint-canvas");
    const ctx = canvas.getContext("2d");

    const colorPicker = document.getElementById("color-picker");
    const brushSize = document.getElementById("brush-size");
    const brushSizeVal = document.getElementById("brush-size-val");
    const btnPincel = document.getElementById("btn-pincel");
    const btnBorrador = document.getElementById("btn-borrador");
    const btnLimpiar = document.getElementById("btn-limpiar");

    let dibujando = false;
    let modoBorrador = false;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function obtenerPosicion(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function empezarDibujo(e) {
        dibujando = true;
        const pos = obtenerPosicion(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    }

    function dibujar(e) {
        if (!dibujando) return;
        const pos = obtenerPosicion(e);

        ctx.lineWidth = brushSize.value;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (modoBorrador) {
            ctx.strokeStyle = "#ffffff";
        } else {
            ctx.strokeStyle = colorPicker.value;
        }

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
    }

    function detenerDibujo() {
        dibujando = false;
        ctx.beginPath();
    }

    canvas.addEventListener("mousedown", empezarDibujo);
    canvas.addEventListener("mousemove", dibujar);
    canvas.addEventListener("mouseup", detenerDibujo);
    canvas.addEventListener("mouseleave", detenerDibujo);

    canvas.addEventListener("touchstart", empezarDibujo, { passive: false });
    canvas.addEventListener("touchmove", dibujar, { passive: false });
    canvas.addEventListener("touchend", detenerDibujo);

    brushSize.addEventListener("input", (e) => {
        brushSizeVal.textContent = e.target.value + "px";
    });

    btnPincel.addEventListener("click", () => {
        modoBorrador = false;
        btnPincel.classList.add("active");
        btnBorrador.classList.remove("active");
    });

    btnBorrador.addEventListener("click", () => {
        modoBorrador = true;
        btnBorrador.classList.add("active");
        btnPincel.classList.remove("active");
    });

    btnLimpiar.addEventListener("click", () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

// --- MÓDULO 4: CANVAS FIGURA 3D INTERACTIVA (THREE.JS / WEBGL) ---
function iniciar3D() {
    const container = document.getElementById("canvas-3d-container");
    if (!container || typeof THREE === "undefined") return;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d0d);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.z = 4.5;

    // Renderizador WebGL
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffca28, 1.5);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8);
    pointLight2.position.set(-5, -5, -2);
    scene.add(pointLight2);

    // Creación de la figura 3D (Toroide Nudoso Dorado)
    const geometry = new THREE.TorusKnotGeometry(0.9, 0.28, 120, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffca28, 
        roughness: 0.25, 
        metalness: 0.85
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Malla secundaria (Estructura de bordes / Wireframe decorativo)
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.15 
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    mesh.add(wireframe);

    // Interacción de Rotación por Mouse / Touch
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function moverObjeto(deltaX, deltaY) {
        mesh.rotation.y += deltaX * 0.01;
        mesh.rotation.x += deltaY * 0.01;
    }

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        moverObjeto(deltaX, deltaY);
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    // Controles para pantallas táctiles
    container.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        moverObjeto(deltaX, deltaY);
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    container.addEventListener("touchend", () => { isDragging = false; });

    // Bucle de animación (Rotación suave automática)
    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            mesh.rotation.y += 0.005;
            mesh.rotation.x += 0.003;
        }

        renderer.render(scene, camera);
    }
    animate();

    // Redimensionamiento dinámico del canvas 3D
    window.addEventListener("resize", () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Disparar todos los módulos al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    iniciarAudio();
    iniciarSnake();
    iniciarPaint();
    iniciar3D();
});
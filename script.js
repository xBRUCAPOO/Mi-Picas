// ============================================
// ACCESO · 10 CONTRASEÑAS + CANDADO DE CORAZÓN
// - Genera los 10 campos y los revisa: rojo si está mal, verde si está bien.
// - Si todas coinciden, corre la animación: el candado de corazón se abre con la llave
//   de as de picas y aparece la imagen.
// - Dibuja el cielo estrellado en el <canvas id="cielo"> con estrellas que se mueven
//   y flotan, y estrellas fugaces de vez en cuando.
// Pensado primero para celular. Todos los colores se leen del :root en style.css.
// ============================================

// ============================================
// CONFIGURACIÓN: cambiá estas 10 contraseñas por las reales
// "valor": la contraseña correcta (solo números, la misma cantidad de dígitos en cada una).
// "etiqueta": el texto chiquito que se ve arriba de cada campo.
// ============================================
const CLAVES = [
    { etiqueta: "Contraseña 1",  valor: "0" },
    { etiqueta: "Contraseña 2",  valor: "0" },
    { etiqueta: "Contraseña 3",  valor: "0" },
    { etiqueta: "Contraseña 4",  valor: "0" },
    { etiqueta: "Contraseña 5",  valor: "0" },
    { etiqueta: "Contraseña 6",  valor: "0" },
    { etiqueta: "Contraseña 7",  valor: "0" },
    { etiqueta: "Contraseña 8",  valor: "0" },
    { etiqueta: "Contraseña 9",  valor: "0" },
    { etiqueta: "Contraseña 10", valor: "0" }
];

// Detecta si el usuario pidió menos movimiento en su sistema
const MOVIMIENTO_REDUCIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Guarda los temporizadores de la animación (por si hace falta cancelarlos)
const temporizadores = [];

document.addEventListener("DOMContentLoaded", () => {
    aplicarColorDeTema();
    generarClaves();
    configurarBoton();
    iniciarCielo();
});

// ============================================
// UTILIDADES DE COLOR
// ============================================

// Lee una variable CSS del :root (ej: "--estrella-azul")
function leerVariable(nombre) {
    return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

// Convierte "#RRGGBB" en "R, G, B" para usar transparencias en el canvas
function hexARgb(hex) {
    const valor = parseInt(hex.replace("#", ""), 16);
    return `${(valor >> 16) & 255}, ${(valor >> 8) & 255}, ${valor & 255}`;
}

// Pone el color de la barra del navegador (celulares) igual al fondo
function aplicarColorDeTema() {
    const meta = document.getElementById("color-tema");
    if (meta) meta.setAttribute("content", leerVariable("--color-fondo"));
}

// ============================================
// CAMPOS DE CONTRASEÑA
// ============================================

// Crea un campo por cada contraseña de CLAVES
function generarClaves() {
    const contenedor = document.getElementById("claves");
    if (!contenedor) return;

    CLAVES.forEach((clave, indice) => {
        const grupo = document.createElement("div");
        grupo.className = "clave";

        const etiqueta = document.createElement("label");
        etiqueta.className = "clave-etiqueta";
        etiqueta.htmlFor = `clave-${indice}`;
        etiqueta.textContent = clave.etiqueta;

        const campo = document.createElement("input");
        campo.id = `clave-${indice}`;
        campo.className = "clave-campo";
        campo.type = "text";
        campo.inputMode = "numeric";        // Teclado numérico en el celular
        campo.autocomplete = "off";
        campo.maxLength = clave.valor.length;
        campo.dataset.indice = indice;

        // Solo números y no más del largo de la contraseña. Al completarla, salta al siguiente campo
        campo.addEventListener("input", () => {
            campo.value = campo.value.replace(/\D/g, "").slice(0, campo.maxLength);
            campo.classList.remove("correcta", "incorrecta");
            ocultarAnuncio();
            if (campo.value.length === campo.maxLength && indice < CLAVES.length - 1) {
                document.getElementById(`clave-${indice + 1}`).focus();
            }
        });

        // Enter: pasa al siguiente campo (en el último, verifica). Borrar en un campo vacío vuelve al anterior
        campo.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                if (indice < CLAVES.length - 1) {
                    document.getElementById(`clave-${indice + 1}`).focus();
                } else {
                    verificar();
                }
            }
            if (evento.key === "Backspace" && campo.value.length === 0 && indice > 0) {
                document.getElementById(`clave-${indice - 1}`).focus();
            }
        });

        // Al terminar la sacudida, se quita la clase para que pueda repetirse
        campo.addEventListener("animationend", () => campo.classList.remove("agitar"));

        grupo.append(etiqueta, campo);
        contenedor.appendChild(grupo);
    });
}

function configurarBoton() {
    const boton = document.getElementById("boton");
    if (boton) boton.addEventListener("click", verificar);
}

// Muestra un mensaje suave debajo de los campos
function mostrarAnuncio(texto) {
    const anuncio = document.getElementById("anuncio");
    if (!anuncio) return;
    anuncio.textContent = texto;
    anuncio.classList.add("mostrar");
}

function ocultarAnuncio() {
    const anuncio = document.getElementById("anuncio");
    if (anuncio) anuncio.classList.remove("mostrar");
}

// Revisa las 10 contraseñas: pinta cada campo de verde o rojo.
// Si todas están bien, dispara la animación del candado.
function verificar() {
    const campos = Array.from(document.querySelectorAll(".clave-campo"));
    let todasCorrectas = true;

    campos.forEach((campo, indice) => {
        const correcta = campo.value === CLAVES[indice].valor;
        campo.classList.remove("correcta", "incorrecta", "agitar");
        void campo.offsetWidth; // Reinicia la animación de sacudida

        if (correcta) {
            campo.classList.add("correcta");
        } else {
            campo.classList.add("incorrecta", "agitar");
            todasCorrectas = false;
        }
    });

    if (todasCorrectas) {
        ocultarAnuncio();
        empezarSecuencia();
    } else {
        mostrarAnuncio("Revisá las marcadas en rojo, con calma.");
    }
}

// ============================================
// SECUENCIA DE DESBLOQUEO
// 1) la caja se desvanece y el velo oscurece el cielo
// 2) aparece el candado de corazón y late
// 3) la llave de as de picas entra desde abajo a la derecha
// 4) la llave gira en la cerradura
// 5) el arco del candado se levanta (se abre)
// 6) estallan los destellos
// 7) el candado se desvanece y aparece la imagen
// ============================================
function empezarSecuencia() {
    const boton = document.getElementById("boton");
    const caja = document.getElementById("caja");
    const escena = document.getElementById("escena");
    const candado = document.getElementById("candado");
    const llave = document.getElementById("llave");
    const escenaCaja = document.getElementById("escena-caja");
    const premio = document.getElementById("premio");

    if (boton) boton.disabled = true;
    if (caja) caja.classList.add("oculta");

    // Con movimiento reducido: se muestra la imagen directo, sin animaciones
    if (MOVIMIENTO_REDUCIDO) {
        if (premio) premio.classList.add("visible");
        return;
    }

    const pasos = [
        [0,    () => escena && escena.classList.add("visible")],
        [700,  () => candado && candado.classList.add("aparecer", "latir")],
        [2000, () => llave && llave.classList.add("entrar")],
        [3300, () => llave && llave.classList.add("girar")],
        [4100, () => candado && candado.classList.add("abierto")],
        [5000, () => crearDestellos(escenaCaja)],
        [5700, () => candado && candado.classList.add("desvanecer")],
        [6300, () => {
            if (escena) escena.classList.remove("visible");
            if (premio) premio.classList.add("visible");
        }]
    ];

    pasos.forEach(([tiempo, accion]) => {
        temporizadores.push(setTimeout(accion, tiempo));
    });
}

// Crea 18 destellos que salen en todas las direcciones desde el centro del candado
function crearDestellos(contenedor) {
    if (!contenedor) return;
    for (let i = 0; i < 18; i++) {
        const destello = document.createElement("span");
        destello.className = "destello";
        const angulo = Math.random() * Math.PI * 2;
        const distancia = Math.random() * 160 + 90;
        destello.style.setProperty("--dx", `${Math.cos(angulo) * distancia}px`);
        destello.style.setProperty("--dy", `${Math.sin(angulo) * distancia}px`);
        destello.style.setProperty("--retraso", `${(Math.random() * 0.15).toFixed(2)}s`);
        contenedor.appendChild(destello);
    }
}

// ============================================
// CIELO ESTRELLADO (canvas)
// Estrellas que titilan, se desplazan despacio y flotan un poquito.
// Estrellas fugaces de vez en cuando.
// ============================================

// ===== AJUSTES DEL CIELO =====
const VELOCIDAD_DERIVA = 7;          // Píxeles por segundo que avanzan las estrellas más cercanas
const FUGAZ_MINIMO = 6;              // Segundos mínimos entre estrellas fugaces
const FUGAZ_MAXIMO = 14;             // Segundos máximos entre estrellas fugaces

function iniciarCielo() {
    const canvas = document.getElementById("cielo");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Paleta de estrellas sacada del CSS, con su "peso" (qué tan seguido aparece cada color)
    const paleta = [
        { rgb: hexARgb(leerVariable("--estrella-blanca")), peso: 0.5 },
        { rgb: hexARgb(leerVariable("--estrella-azul")), peso: 0.3 },
        { rgb: hexARgb(leerVariable("--estrella-celeste")), peso: 0.2 }
    ];
    const colorFugaz = hexARgb(leerVariable("--estrella-fugaz"));

    let ancho = 0;
    let alto = 0;
    let anchoAnterior = 0;
    let escala = 1;          // Achica fugaces y halos en pantallas chicas
    let estrellas = [];
    let fugaces = [];
    let proximaFugaz = 0;
    let ultimoTiempo = 0;
    let tiempoCielo = 0;     // Reloj propio del cielo: no salta al volver a la pestaña

    function colorAlAzar() {
        let tirada = Math.random();
        for (const color of paleta) {
            if (tirada < color.peso) return color.rgb;
            tirada -= color.peso;
        }
        return paleta[0].rgb;
    }

    // Ajusta el canvas al tamaño real de la pantalla (nítido en celulares de alta resolución).
    // Las estrellas se regeneran solo si cambia el ancho, así no "saltan" al esconderse la barra del navegador
    function redimensionar() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ancho = canvas.clientWidth || window.innerWidth;
        alto = canvas.clientHeight || window.innerHeight;
        canvas.width = Math.round(ancho * dpr);
        canvas.height = Math.round(alto * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        escala = Math.max(0.6, Math.min(ancho / 600, 1));

        if (ancho !== anchoAnterior) {
            crearEstrellas();
            anchoAnterior = ancho;
        }
        if (MOVIMIENTO_REDUCIDO) dibujarCuadro(0, 0);
    }

    // Estrellas guardadas en proporción (0 a 1) para que se adapten a cualquier pantalla
    function crearEstrellas() {
        const cantidad = Math.min(Math.round((ancho * alto) / 900), 700);
        estrellas = [];

        for (let i = 0; i < cantidad; i++) {
            const azar = Math.random();
            let radio;
            let brillo;
            let halo = false;

            if (azar < 0.80) {          // Polvo de estrellas lejano
                radio = Math.random() * 0.5 + 0.25;
                brillo = Math.random() * 0.35 + 0.15;
            } else if (azar < 0.97) {   // Estrellas medianas
                radio = Math.random() * 0.6 + 0.7;
                brillo = Math.random() * 0.35 + 0.45;
            } else {                    // Pocas brillantes, con halo y destello en cruz
                radio = Math.random() * 0.7 + 1.2;
                brillo = Math.random() * 0.2 + 0.75;
                halo = true;
            }

            const profundidad = Math.min(radio / 2, 1); // Las grandes parecen más cerca: se mueven más

            estrellas.push({
                px: Math.random(),
                py: Math.random(),
                radio,
                brillo,
                halo,
                color: colorAlAzar(),
                velocidad: Math.random() * 0.9 + 0.25,          // Qué tan rápido titila
                fase: Math.random() * Math.PI * 2,
                profundidad,
                deriva: VELOCIDAD_DERIVA * (0.4 + 0.6 * profundidad),
                flotacion: Math.random() * 2.5 + 0.5,           // Cuánto flota alrededor de su lugar
                ritmoFlotacion: Math.random() * 0.25 + 0.1
            });
        }
    }

    // Lo que sale por un borde entra por el opuesto
    function envolver(valor, limite) {
        const margen = 12;
        const total = limite + margen * 2;
        return ((((valor + margen) % total) + total) % total) - margen;
    }

    function dibujarEstrella(e, tiempo) {
        const titileo = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(tiempo * e.velocidad + e.fase));
        const alfa = e.brillo * titileo;

        // Desplazamiento lento hacia la derecha y apenas hacia arriba
        const avance = MOVIMIENTO_REDUCIDO ? 0 : tiempo * e.deriva;
        // Flotación: un vaivén circular chiquito
        const flotarX = MOVIMIENTO_REDUCIDO ? 0 : Math.sin(tiempo * e.ritmoFlotacion + e.fase) * e.flotacion;
        const flotarY = MOVIMIENTO_REDUCIDO ? 0 : Math.cos(tiempo * e.ritmoFlotacion * 0.8 + e.fase) * e.flotacion;

        const x = envolver(e.px * ancho + avance + flotarX, ancho);
        const y = envolver(e.py * alto - avance * 0.3 + flotarY, alto);

        if (e.halo) {
            const radioHalo = e.radio * 7 * escala;
            const degradado = ctx.createRadialGradient(x, y, 0, x, y, radioHalo);
            degradado.addColorStop(0, `rgba(${e.color}, ${alfa * 0.35})`);
            degradado.addColorStop(1, `rgba(${e.color}, 0)`);
            ctx.fillStyle = degradado;
            ctx.beginPath();
            ctx.arc(x, y, radioHalo, 0, Math.PI * 2);
            ctx.fill();

            const largo = e.radio * 6 * titileo * escala;
            ctx.strokeStyle = `rgba(${e.color}, ${alfa * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(x - largo, y);
            ctx.lineTo(x + largo, y);
            ctx.moveTo(x, y - largo);
            ctx.lineTo(x, y + largo);
            ctx.stroke();
        }

        ctx.fillStyle = `rgba(${e.color}, ${alfa})`;
        ctx.beginPath();
        ctx.arc(x, y, e.radio, 0, Math.PI * 2);
        ctx.fill();
    }

    // ---------- ESTRELLAS FUGACES ----------

    function programarFugaz(tiempoActual) {
        proximaFugaz = tiempoActual + FUGAZ_MINIMO + Math.random() * (FUGAZ_MAXIMO - FUGAZ_MINIMO);
    }

    // Cruza en diagonal, en la mitad de arriba de la pantalla
    function crearFugaz() {
        const haciaLaDerecha = Math.random() < 0.5;
        const angulo = (Math.random() * 20 + 25) * (Math.PI / 180);
        fugaces.push({
            x: Math.random() * ancho * 0.8 + ancho * 0.1,
            y: Math.random() * alto * 0.4,
            dx: Math.cos(angulo) * (haciaLaDerecha ? 1 : -1),
            dy: Math.sin(angulo),
            velocidad: (Math.random() * 250 + 350) * escala,
            largo: (Math.random() * 120 + 100) * escala,
            vida: 0,
            duracion: Math.random() * 0.8 + 1.1
        });
    }

    function dibujarFugaces(delta) {
        fugaces = fugaces.filter((f) => f.vida < f.duracion);

        for (const f of fugaces) {
            f.vida += delta;
            f.x += f.dx * f.velocidad * delta;
            f.y += f.dy * f.velocidad * delta;

            const alfa = Math.sin((f.vida / f.duracion) * Math.PI);
            const colaX = f.x - f.dx * f.largo;
            const colaY = f.y - f.dy * f.largo;

            const estela = ctx.createLinearGradient(f.x, f.y, colaX, colaY);
            estela.addColorStop(0, `rgba(${colorFugaz}, ${alfa * 0.9})`);
            estela.addColorStop(1, `rgba(${colorFugaz}, 0)`);

            ctx.strokeStyle = estela;
            ctx.lineWidth = 1.3;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(colaX, colaY);
            ctx.stroke();

            const cabeza = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 6);
            cabeza.addColorStop(0, `rgba(${colorFugaz}, ${alfa})`);
            cabeza.addColorStop(1, `rgba(${colorFugaz}, 0)`);
            ctx.fillStyle = cabeza;
            ctx.beginPath();
            ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---------- DIBUJO DE CADA CUADRO ----------

    function dibujarCuadro(tiempo, delta) {
        ctx.clearRect(0, 0, ancho, alto);

        for (const e of estrellas) {
            dibujarEstrella(e, tiempo);
        }

        if (!MOVIMIENTO_REDUCIDO) {
            if (tiempo >= proximaFugaz) {
                crearFugaz();
                programarFugaz(tiempo);
            }
            dibujarFugaces(delta);
        }
    }

    // Bucle de animación: el navegador lo pausa solo cuando la pestaña no se ve (ahorra batería)
    function animar(marca) {
        const ahora = marca / 1000;
        const delta = Math.min(ahora - ultimoTiempo, 0.05);
        ultimoTiempo = ahora;
        tiempoCielo += delta;
        dibujarCuadro(tiempoCielo, delta);
        requestAnimationFrame(animar);
    }

    // Al girar el celular se redimensiona, con una pequeña espera para no recalcular de más
    let temporizadorResize;
    window.addEventListener("resize", () => {
        clearTimeout(temporizadorResize);
        temporizadorResize = setTimeout(redimensionar, 150);
    });

    redimensionar();

    if (!MOVIMIENTO_REDUCIDO) {
        programarFugaz(2.5);
        requestAnimationFrame((marca) => {
            ultimoTiempo = marca / 1000;
            animar(marca);
        });
    }
}
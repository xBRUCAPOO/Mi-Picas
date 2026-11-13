// ============================================
// ACCESO · CONTRASEÑAS → LLAVE → 10 PREGUNTAS → CORAZÓN → FOTO
// 1) 10 contraseñas: rojo si está mal, verde si está bien.
// 2) Si todas coinciden: "¡Obtuviste la llave!" (la llave sube desde abajo, estilo Duolingo).
// 3) Prueba: 10 preguntas al azar de preguntas.json que hay que responder bien SEGUIDAS.
//    Si se falla una, la racha vuelve a cero (sin repetir preguntas del intento anterior).
// 4) Racha completa: la llave abre el corazón, el corazón se parte como un libro, adentro todo
//    negro, la cámara entra y aparece la foto.
// Efectos y animaciones inspirados en Duolingo: resortes, labios 3D, chispas, confeti.
// Pensado primero para celular. Todos los colores se leen del :root en style.css.
// ============================================

// ============================================
// CONFIGURACIÓN: cambiá estas 10 contraseñas por las reales
// "valor": la contraseña correcta (solo números; el campo acepta tantos dígitos como tenga el valor).
// "etiqueta": el texto chiquito que se ve arriba de cada campo (puede ser el acertijo).
// ============================================
// const CLAVES = [
//     { etiqueta: "Mi numero favorito",  valor: "5" },
//     { etiqueta: "La suma de mi numero favorito con el tuyo",  valor: "37" },
//     { etiqueta: "La resta de nuestros dias de nacimiento (el menor le resta al mayor)",  valor: "8" },
//     { etiqueta: "La restaa de el día que nos empezamos a hablar con el dia en el que nos hicimos novios (el menor le resta al mayor)",  valor: "24" },
//     { etiqueta: "La suma de nuestras edades con la resta de nuestros deias de nuestros cumpleaños", valor: "6" },
//     { etiqueta: "El día que viniste por primera vez a mi casa",  valor: "7" },
//     { etiqueta: "La suma de nuestras edades mas la resta de la suma del dia de nuestros primeros mensajes y el dia que dijimos que nos arruinaremos la vida ",  valor: "24" },
//     { etiqueta: "La cantidad de letras de mi segundo nombre mas la cantidad de letras de tu apellido",  valor: "17" },
//     { etiqueta: "La cantidad de letras de mi color favorito mas la cantidad de letras de mi nombre menos la cantidad de letras de tu nombre",  valor: "3" },
//     { etiqueta: "Sic seben", valor: "67" }
// ];

const CLAVES = [
    { etiqueta: "Mi numero favorito",  valor: "0" },
    { etiqueta: "La suma de mi numero favorito con el tuyo",  valor: "0" },
    { etiqueta: "La resta de nuestros dias de nacimiento (el menor le resta al mayor)",  valor: "0" },
    { etiqueta: "La restaa de el día que nos empezamos a hablar con el dia en el que nos hicimos novios (el menor le resta al mayor)",  valor: "0" },
    { etiqueta: "La suma de nuestras edades con la resta de nuestros deias de nuestros cumpleaños", valor: "0" },
    { etiqueta: "El día que viniste por primera vez a mi casa",  valor: "0" },
    
    { etiqueta: "La suma de nuestras edades mas la resta de la suma del dia de nuestros primeros mensajes y el dia que dijimos que nos arruinaremos la vida ",  valor: "0" },
    { etiqueta: "La cantidad de letras de mi segundo nombre mas la cantidad de letras de tu apellido",  valor: "0" },
    { etiqueta: "La cantidad de letras de mi color favorito mas la cantidad de letras de mi nombre menos la cantidad de letras de tu nombre",  valor: "0" },
    { etiqueta: "Sic seben", valor: "0" }
];

// ===== AJUSTES DE LA PRUEBA =====
const ARCHIVO_PREGUNTAS = "preguntas.json"; // Archivo con el banco de preguntas (misma carpeta que index.html)
const PREGUNTAS_POR_RONDA = 10;             // Cuántas hay que responder bien seguidas

// ===== TOPES DE PARTÍCULAS (rendimiento) =====
const MAX_PARTICULAS = 36;              // Nunca hay más de 36 partículas a la vez en pantalla
const PARTICULAS_POR_PREGUNTA = 16;     // Chispas verdes al acertar, repartidas entre todas las opciones correctas

// Frases al acertar (sale una al azar, como en Duolingo)
const FRASES_BIEN = ["¡Excelente!", "¡Muy bien!", "¡Genial!", "¡Correcto!", "¡Perfecto!", "¡Así se hace!"];

// ===== AJUSTES DEL CIELO =====
const VELOCIDAD_DERIVA = 7;     // Píxeles por segundo que avanzan las estrellas más cercanas
const FUGAZ_MINIMO = 6;         // Segundos mínimos entre estrellas fugaces
const FUGAZ_MAXIMO = 14;        // Segundos máximos entre estrellas fugaces

// Detecta si el usuario pidió menos movimiento en su sistema
const MOVIMIENTO_REDUCIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Opciones fijas de las preguntas de verdadero o falso
const OPCIONES_VF = ["Verdadero", "Falso"];

// Contorno del corazón: calcado de la imagen de referencia (coordenadas en píxeles de esa imagen)
const CAMINO_CORAZON = "M135.6 321.2 C137.6 321.2 139.7 318.1 141.7 316.3 C143.7 314.5 145.5 312.5 147.4 310.6 C149.3 308.7 151.1 306.8 153.0 305.0 C155.0 303.1 156.9 301.3 158.9 299.5 C160.9 297.7 162.9 296.0 164.9 294.1 C166.8 292.3 168.6 290.4 170.5 288.5 C172.4 286.6 174.3 284.7 176.2 282.8 C178.1 280.9 180.0 279.0 181.9 277.1 C183.8 275.2 185.6 273.4 187.5 271.5 C189.4 269.6 191.3 267.7 193.2 265.8 C195.1 263.9 196.9 261.9 198.9 260.1 C200.8 258.3 203.0 256.8 205.0 255.0 C207.0 253.2 208.8 251.2 210.7 249.3 C212.6 247.4 214.5 245.5 216.4 243.6 C218.2 241.8 220.1 239.9 222.0 238.0 C223.9 236.1 225.8 234.2 227.7 232.3 C229.6 230.4 231.5 228.6 233.4 226.6 C235.2 224.7 237.0 222.7 238.7 220.7 C240.3 218.6 241.9 216.4 243.3 214.1 C244.7 211.9 246.0 209.5 247.2 207.1 C248.3 204.7 249.5 202.3 250.4 199.8 C251.3 197.3 252.0 194.7 252.6 192.1 C253.2 189.5 253.8 186.9 254.0 184.3 C254.2 181.6 254.1 178.9 254.0 176.2 C253.9 173.6 253.8 170.9 253.5 168.3 C253.1 165.6 252.4 163.0 251.7 160.5 C251.0 157.9 250.2 155.3 249.2 152.9 C248.1 150.4 246.8 148.1 245.5 145.8 C244.1 143.5 242.7 141.3 241.1 139.1 C239.5 137.0 237.8 134.9 236.0 133.0 C234.1 131.0 232.1 129.3 230.0 127.6 C227.9 125.9 225.7 124.4 223.5 123.0 C221.2 121.6 219.0 120.1 216.5 119.0 C214.1 117.9 211.6 117.0 209.0 116.2 C206.5 115.4 204.0 114.6 201.4 114.1 C198.8 113.5 196.1 113.2 193.4 113.0 C190.8 112.8 188.2 112.7 185.5 112.7 C182.9 112.7 180.2 112.8 177.5 113.1 C174.9 113.4 172.3 114.0 169.7 114.7 C167.1 115.4 164.6 116.3 162.1 117.3 C159.7 118.4 157.2 119.5 154.9 120.8 C152.6 122.2 150.4 123.7 148.3 125.3 C146.2 127.0 144.3 128.8 142.3 130.7 C140.4 132.5 138.6 135.9 136.6 136.2 C134.6 136.6 132.6 134.0 130.6 132.6 C128.5 131.1 126.5 129.1 124.4 127.4 C122.3 125.8 120.2 124.2 117.9 122.8 C115.7 121.3 113.4 119.9 111.0 118.8 C108.6 117.6 106.0 116.7 103.5 115.8 C101.0 114.9 98.5 114.2 95.9 113.6 C93.3 113.0 90.6 112.5 88.0 112.2 C85.3 111.9 82.6 112.0 80.0 112.0 C77.3 112.0 74.6 112.1 72.0 112.4 C69.4 112.7 66.7 113.1 64.1 113.8 C61.5 114.4 59.0 115.2 56.5 116.2 C54.0 117.2 51.6 118.3 49.3 119.6 C47.0 120.9 44.7 122.4 42.6 124.0 C40.4 125.5 38.3 127.2 36.3 129.0 C34.3 130.8 32.5 132.7 30.8 134.8 C29.1 136.8 27.4 138.9 25.9 141.1 C24.4 143.3 23.0 145.6 21.7 147.9 C20.4 150.2 19.2 152.6 18.2 155.1 C17.1 157.5 16.2 160.1 15.5 162.6 C14.8 165.2 14.2 167.8 14.0 170.5 C13.8 173.1 14.0 175.8 14.0 178.5 C14.0 181.2 13.7 183.9 14.0 186.5 C14.3 189.2 14.9 191.8 15.7 194.3 C16.4 196.9 17.3 199.4 18.4 201.9 C19.4 204.3 20.5 206.8 21.8 209.1 C23.2 211.4 24.7 213.6 26.2 215.8 C27.8 217.9 29.5 220.0 31.2 222.0 C33.0 224.0 34.9 225.9 36.8 227.8 C38.7 229.7 40.8 231.4 42.7 233.2 C44.7 235.0 46.7 236.8 48.6 238.6 C50.5 240.5 52.4 242.4 54.3 244.3 C56.2 246.2 58.0 248.1 59.9 249.9 C61.8 251.8 63.7 253.7 65.7 255.5 C67.6 257.3 69.8 258.9 71.8 260.8 C73.7 262.6 75.5 264.5 77.4 266.4 C79.3 268.3 81.2 270.2 83.1 272.1 C85.0 274.0 86.8 276.0 88.8 277.8 C90.7 279.6 92.9 281.1 94.9 282.9 C96.9 284.7 98.7 286.7 100.6 288.6 C102.5 290.5 104.4 292.4 106.2 294.2 C108.1 296.1 110.0 298.1 111.9 299.9 C113.9 301.7 116.0 303.4 118.0 305.2 C119.9 307.0 121.8 308.9 123.7 310.7 C125.6 312.6 127.4 314.7 129.4 316.4 C131.4 318.1 133.5 321.2 135.6 321.2 Z";

// Grillete del candado (mismas coordenadas que el corazón)
const CAMINO_ARCO = "M64 140 V107.5 A69.5 69.5 0 0 1 203 107.5 V140";

// Carga de preguntas: arranca apenas abre la página, así ya están listas al llegar a la prueba
let cargaPreguntas = null;

document.addEventListener("DOMContentLoaded", () => {
    aplicarColorDeTema();
    dibujarPiezas();
    generarClaves();
    configurarBoton();
    configurarRecompensa();
    configurarQuiz();
    iniciarCielo();
    cargaPreguntas = cargarPreguntas();
    cargaPreguntas.catch(() => {}); // Si falla, el aviso se muestra recién al llegar a la prueba (mostrarQuiz)
});

// ============================================
// UTILIDADES
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

// Atajo para buscar por id
function $(id) {
    return document.getElementById(id);
}

// Crea un ícono de Material Symbols (Google Fonts Icons)
function icono(nombre) {
    const span = document.createElement("span");
    span.className = "material-symbols-rounded";
    span.setAttribute("aria-hidden", "true");
    span.textContent = nombre;
    return span;
}

// Número con dos cifras: 3 -> "03"
function dosCifras(n) {
    return String(n).padStart(2, "0");
}

// Mezcla una lista al azar (Fisher-Yates) y devuelve una copia
function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Un elemento al azar de una lista
function alAzar(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

// ============================================
// MATEMÁTICA DEL MOVIMIENTO (para que todo se sienta "vivo")
// ============================================

// Resorte: arranca en "de", pasa de largo "a" y vuelve oscilando hasta quedarse en "a".
// t va de 0 a 1. "k" = qué tan rápido se apaga el rebote, "v" = cuántas oscilaciones hace.
function resorte(de, a, t, k = 6, v = 1.2) {
    return a + (de - a) * Math.exp(-k * t) * Math.cos(2 * Math.PI * v * t);
}

// Rebote al final (overshoot): llega a "1" pasándose un poco y vuelve.
// "s" = cuánto se pasa: 1.7 es suave, 3 es muy exagerado.
function rebote(t, s = 1.7) {
    const u = t - 1;
    return 1 + (s + 1) * u * u * u + s * u * u;
}

// Espera "ms" milisegundos (para encadenar los pasos de la animación)
function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

// Deja el elemento en el estado del último cuadro y libera la animación (así no se acumulan)
function fijarFinal(elemento, animacion, ultimo) {
    Object.keys(ultimo).forEach((propiedad) => {
        if (propiedad !== "offset" && propiedad !== "easing") elemento.style[propiedad] = ultimo[propiedad];
    });
    animacion.cancel();
}

// Anima un elemento durante "ms" milisegundos con una función:
// "fn(t)" devuelve las propiedades del momento t (0 a 1), por ejemplo { transform: "scale(1.2)", opacity: 0.5 }.
// Se calcula un cuadro cada ~16ms para que el movimiento sea suave (resortes, rebotes).
function animar(elemento, ms, fn) {
    if (!elemento) return Promise.resolve();
    const pasos = Math.max(12, Math.round(ms / 16));
    const cuadros = [];
    for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        cuadros.push({ ...fn(t), offset: t });
    }
    const animacion = elemento.animate(cuadros, { duration: ms, easing: "linear", fill: "forwards" });
    return animacion.finished.then(() => fijarFinal(elemento, animacion, cuadros[cuadros.length - 1]));
}

// Anima un elemento con cuadros clave escritos a mano y lo deja en el último estado
function animarCuadros(elemento, cuadros, ms, easing = "ease-out") {
    if (!elemento) return Promise.resolve();
    const animacion = elemento.animate(cuadros, { duration: ms, easing, fill: "forwards" });
    return animacion.finished.then(() => fijarFinal(elemento, animacion, cuadros[cuadros.length - 1]));
}

// "Pop" con rebote: el elemento se agranda y vuelve (contadores, insignias, campos)
function pop(elemento, escala = 1.3, ms = 450) {
    if (!elemento || MOVIMIENTO_REDUCIDO) return;
    elemento.animate(
        [{ transform: "scale(1)" }, { transform: `scale(${escala})`, offset: 0.35 }, { transform: "scale(.95)", offset: 0.7 }, { transform: "scale(1)" }],
        { duration: ms, easing: "ease-out" }
    );
}

// Sacudida horizontal corta
function sacudir(elemento, fuerza = 8, ms = 420) {
    if (!elemento || MOVIMIENTO_REDUCIDO) return;
    elemento.animate(
        [
            { transform: "translateX(0)" },
            { transform: `translateX(${-fuerza}px)` },
            { transform: `translateX(${fuerza * 0.85}px)` },
            { transform: `translateX(${-fuerza * 0.5}px)` },
            { transform: `translateX(${fuerza * 0.25}px)` },
            { transform: "translateX(0)" }
        ],
        { duration: ms, easing: "ease-out" }
    );
}

// Temblor largo (para respuestas incorrectas): tiembla rápido unos segundos y se va calmando
function temblarLargo(elemento, ms = 1600, fuerza = 9) {
    if (!elemento || MOVIMIENTO_REDUCIDO) return;
    const vueltas = Math.round(ms / 55);
    const cuadros = [];
    for (let i = 0; i <= vueltas; i++) {
        const calma = 1 - i / vueltas;                        // Cada vez tiembla menos
        const lado = i % 2 === 0 ? 1 : -1;
        const x = i === vueltas ? 0 : lado * fuerza * calma;
        const giro = i === vueltas ? 0 : lado * 1.2 * calma;
        cuadros.push({ transform: `translateX(${x.toFixed(2)}px) rotate(${giro.toFixed(2)}deg)` });
    }
    elemento.animate(cuadros, { duration: ms, easing: "linear" });
}

// ============================================
// PARTÍCULAS (chispas de 4 puntas, puntos, confeti y "+1"), como en Duolingo
// Viven en la capa #particulas, con posición fija sobre la pantalla
// ============================================

// Crea una partícula en la capa de partículas.
// Si ya hay MAX_PARTICULAS en pantalla, no crea más (devuelve null): así nunca se traba
function crearParticula(clase, color) {
    const capa = $("particulas");
    if (capa.childElementCount >= MAX_PARTICULAS) return null;
    const el = document.createElement("span");
    el.className = `particula ${clase}`;
    el.style.background = color;
    capa.appendChild(el);
    return el;
}

// Chispas que salen desde un rectángulo de la pantalla hacia afuera (por ejemplo, una opción bien respondida)
function chispasDesde(rect, colores, cantidad = 10) { // 10 por defecto: menos partículas, mejor rendimiento
    if (MOVIMIENTO_REDUCIDO || !rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < cantidad; i++) {
        const esChispa = Math.random() < 0.6;
        const el = crearParticula(esChispa ? "chispa" : "punto", alAzar(colores));
        if (!el) break; // Se llegó al tope de partículas
        const tamano = esChispa ? 14 : 8;
        // Arranca en algún punto del rectángulo y sale en dirección opuesta al centro
        const x0 = rect.left + Math.random() * rect.width;
        const y0 = rect.top + Math.random() * rect.height;
        let ang = Math.atan2(y0 - cy, x0 - cx) + (Math.random() - 0.5) * 0.9;
        if (rect.width < 2) ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        const x1 = x0 + Math.cos(ang) * dist;
        const y1 = y0 + Math.sin(ang) * dist;
        const giro = (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 180);
        const escala = 0.6 + Math.random() * 0.8;
        const medio = tamano / 2;
        el.animate(
            [
                { transform: `translate(${x0 - medio}px, ${y0 - medio}px) scale(0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${x1 - medio}px, ${y1 - medio}px) scale(${escala}) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.5 },
                { transform: `translate(${x1 - medio}px, ${y1 + 18 - medio}px) scale(0) rotate(${giro}deg)`, opacity: 0 }
            ],
            { duration: 650 + Math.random() * 400, delay: Math.random() * 90, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        ).finished.then(() => el.remove());
    }
}

// Confeti de colores que explota hacia arriba desde el centro y cae girando
function confeti(cantidad = 45) { // 45 piezas: se ve lleno y no traba el celular
    if (MOVIMIENTO_REDUCIDO) return;
    const colores = ["--color-success", "--color-info", "--color-warning", "--color-error", "--confeti-morado"].map(leerVariable);
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    for (let i = 0; i < cantidad; i++) {
        const el = crearParticula(Math.random() < 0.75 ? "confeti" : "chispa", alAzar(colores));
        if (!el) break; // Se llegó al tope de partículas
        const x0 = ancho / 2 + (Math.random() - 0.5) * 60;
        const y0 = alto * 0.55;
        const xMax = x0 + (Math.random() - 0.5) * ancho * 1.1;
        const yMax = y0 - (alto * 0.35 + Math.random() * alto * 0.35);
        const xFin = xMax + (Math.random() - 0.5) * 120;
        const giro = (Math.random() - 0.5) * 1440;
        el.animate(
            [
                { transform: `translate(${x0}px, ${y0}px) rotate(0deg) scale(.4)`, opacity: 1 },
                { transform: `translate(${xMax}px, ${yMax}px) rotate(${giro / 3}deg) scale(1)`, opacity: 1, offset: 0.35, easing: "ease-in" },
                { transform: `translate(${xFin}px, ${alto + 40}px) rotate(${giro}deg) scale(1)`, opacity: 0.9 }
            ],
            { duration: 2200 + Math.random() * 1400, delay: Math.random() * 200, easing: "cubic-bezier(.15, .7, .35, 1)", fill: "forwards" }
        ).finished.then(() => el.remove());
    }
}

// "+1" verde que sube desde un elemento (el contador de la racha)
function masUno(elemento) {
    if (MOVIMIENTO_REDUCIDO || !elemento) return;
    const r = elemento.getBoundingClientRect();
    const el = document.createElement("span");
    el.className = "flotante";
    el.textContent = "+1";
    $("particulas").appendChild(el);
    el.animate(
        [
            { transform: `translate(${r.right - 10}px, ${r.top}px) scale(.4)`, opacity: 0 },
            { transform: `translate(${r.right - 4}px, ${r.top - 16}px) scale(1.25)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${r.right + 2}px, ${r.top - 46}px) scale(1)`, opacity: 0 }
        ],
        { duration: 900, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
    ).finished.then(() => el.remove());
}

// ============================================
// DIBUJOS: LLAVE Y CANDADO (estilo Duolingo: formas gordas, labio oscuro abajo y brillo blanco)
// ============================================

// Llave de as de picas con la M. "sufijo" hace único el id del recorte (hay dos llaves en la página)
function crearLlave(sufijo) {
    const pala = "M50 0 C42 20 8 36 8 60 C8 78 22 86 36 80 C40 78 44 77 46 74 L38 94 H62 L54 74 C56 77 60 78 64 80 C78 86 92 78 92 60 C92 36 58 20 50 0 Z";
    const id = `recorte-llave-${sufijo}`;
    return `
        <svg class="llave-svg" viewBox="0 0 100 246" aria-hidden="true">
            <defs>
                <!-- Forma de la llave: recorta el destello para que solo brille sobre la llave -->
                <clipPath id="${id}">
                    <path d="${pala}"/>
                    <rect x="30" y="86" width="40" height="14" rx="6"/>
                    <rect x="43" y="96" width="14" height="150" rx="5"/>
                    <rect x="28" y="206" width="18" height="10" rx="3"/>
                    <rect x="28" y="228" width="18" height="10" rx="3"/>
                </clipPath>
            </defs>
            <!-- Labio 3D: la misma forma, más oscura y un poco más abajo -->
            <g class="llave-sombra" transform="translate(0 6)">
                <path d="${pala}"/>
                <rect x="30" y="86" width="40" height="14" rx="6"/>
                <rect x="28" y="206" width="18" height="10" rx="3"/>
                <rect x="28" y="228" width="18" height="10" rx="3"/>
            </g>
            <!-- Cuerpo de la llave -->
            <path class="llave-pieza" d="${pala}"/>
            <rect class="llave-pieza" x="30" y="86" width="40" height="14" rx="6"/>
            <rect class="llave-pieza" x="43" y="96" width="14" height="150" rx="5"/>
            <rect class="llave-lado" x="51" y="100" width="6" height="144" rx="3"/>
            <rect class="llave-pieza" x="28" y="206" width="18" height="10" rx="3"/>
            <rect class="llave-pieza" x="28" y="228" width="18" height="10" rx="3"/>
            <!-- Brillos blancos (arriba a la izquierda, como en los íconos de Duolingo) -->
            <ellipse class="llave-brillo" cx="27" cy="54" rx="6" ry="11" transform="rotate(28 27 54)"/>
            <circle class="llave-brillo" cx="20" cy="70" r="3"/>
            <rect class="llave-brillo" x="46" y="104" width="3" height="40" rx="1.5"/>
            <!-- La M, con su sombrita -->
            <text class="llave-letra-sombra" x="50" y="64">M</text>
            <text class="llave-letra" x="50" y="61">M</text>
            <!-- Destello que cruza la llave cada tanto -->
            <g clip-path="url(#${id})">
                <g transform="rotate(20 50 120)">
                    <rect class="llave-barrido" x="-90" y="-60" width="22" height="380"/>
                </g>
            </g>
        </svg>`;
}

// SVG del corazón completo con sus capas (se usa en cada mitad)
function svgCorazon() {
    return `
        <svg viewBox="9.5 20 250 320" aria-hidden="true">
            <!-- Labio 3D del corazón (grosor de abajo) -->
            <path class="corazon-sombra" d="${CAMINO_CORAZON}" transform="translate(0 10)"/>
            <path class="corazon-base" d="${CAMINO_CORAZON}"/>
            <!-- Brillo blanco en el lóbulo izquierdo -->
            <ellipse class="corazon-brillo" cx="68" cy="148" rx="24" ry="12" transform="rotate(-38 68 148)"/>
            <circle class="corazon-brillo" cx="44" cy="178" r="6"/>
            <!-- Cerradura: círculo arriba y trapecio abajo (medidas de la imagen) -->
            <circle class="ojo" cx="134" cy="188" r="18"/>
            <path class="ojo" d="M129 202 H139 L152 231 H116 Z"/>
        </svg>`;
}

// Cara de adentro de una mitad (la que se ve cuando la tapa queda abierta, como un libro).
// Es la misma mitad del corazón en espejo: "eje" es la suma de los bordes de esa mitad
// (izquierda: 9.5 + 134.5 = 144 · derecha: 134.5 + 259.5 = 394), así el espejo queda en el mismo lugar
function svgTapa(eje) {
    return `
        <svg viewBox="9.5 20 250 320" aria-hidden="true">
            <g transform="translate(${eje} 0) scale(-1 1)">
                <path class="corazon-tapa" d="${CAMINO_CORAZON}"/>
                <path class="corazon-tapa-borde" d="${CAMINO_CORAZON}"/>
                <circle class="ojo" cx="134" cy="188" r="18"/>
                <path class="ojo" d="M129 202 H139 L152 231 H116 Z"/>
            </g>
        </svg>`;
}

// Arma las piezas del candado (grillete, interior negro y las dos mitades) y las dos llaves.
// Cada mitad tiene dos caras: el frente (el corazón rojo) y el dorso (la cara de adentro),
// así al girar 180° como la tapa de un libro se ve su lado interno
function dibujarPiezas() {
    const cuerpo = $("candado-cuerpo");
    if (cuerpo) {
        const llave = $("llave");
        const capas = `
            <div class="candado-capa candado-arco" id="arco">
                <svg viewBox="9.5 20 250 320" aria-hidden="true">
                    <path class="arco-sombra" d="${CAMINO_ARCO}" transform="translate(0 6)"/>
                    <path class="arco-base" d="${CAMINO_ARCO}"/>
                    <path class="arco-brillo" d="M74 118 V108 A60 60 0 0 1 104 56"/>
                </svg>
            </div>
            <div class="candado-capa candado-interior">
                <svg viewBox="9.5 20 250 320" aria-hidden="true">
                    <path class="corazon-interior" d="${CAMINO_CORAZON}"/>
                    <path class="corazon-interior-borde" d="${CAMINO_CORAZON}"/>
                </svg>
            </div>
            <div class="candado-mitad candado-mitad--izq" id="mitad-izq">
                <div class="cara cara--frente">${svgCorazon()}</div>
                <div class="cara cara--dorso">${svgTapa(144)}</div>
            </div>
            <div class="candado-mitad candado-mitad--der" id="mitad-der">
                <div class="cara cara--frente">${svgCorazon()}</div>
                <div class="cara cara--dorso">${svgTapa(394)}</div>
            </div>`;
        cuerpo.insertAdjacentHTML("afterbegin", capas);
        if (llave) llave.innerHTML = crearLlave("final");
    }
    const llaveRecompensa = $("llave-recompensa");
    if (llaveRecompensa) llaveRecompensa.innerHTML = crearLlave("premio");
}

// ============================================
// 1) CONTRASEÑAS: UN CASILLERO POR DÍGITO (como el código de 6 dígitos de ÉLIX)
// Cada contraseña muestra tantos casilleros como caracteres tenga su "valor":
//   valor "17" → 2 casilleros · valor "6" → 1 casillero.
// Al escribir un dígito salta solo al siguiente casillero (y de una contraseña a la otra).
// Borrar en un casillero vacío vuelve al anterior. Se puede pegar un número entero.
// ============================================

// Devuelve el valor de una contraseña como texto. Si falta en CLAVES, avisa en la consola
// (la página sigue funcionando, pero esa contraseña nunca va a dar correcta hasta que se complete)
function valorDeClave(clave, indice) {
    if (clave && clave.valor !== undefined && clave.valor !== null && String(clave.valor) !== "") {
        return String(clave.valor);
    }
    console.error(`[Contraseñas] A la contraseña ${indice + 1} le falta el "valor" en CLAVES (script.js).`);
    return "";
}

// Todos los casilleros de todas las contraseñas, en orden (para saltar de uno al otro)
function todosLosDigitos() {
    return Array.from(document.querySelectorAll(".digito"));
}

// Casilleros de una contraseña
function digitosDeClave(indice) {
    return Array.from(document.querySelectorAll(`#fila-${indice} .digito`));
}

// Crea las contraseñas: etiqueta (el acertijo) + fila de casilleros
function generarClaves() {
    const contenedor = $("claves");
    if (!contenedor) return;

    CLAVES.forEach((clave, indice) => {
        const valor = valorDeClave(clave, indice);
        const cantidad = Math.max(1, valor.length);

        const grupo = document.createElement("div");
        grupo.className = "clave";
        grupo.style.animationDelay = `${150 + indice * 30}ms`; // Aparecen en cascada

        const etiqueta = document.createElement("label");
        etiqueta.className = "clave-etiqueta";
        etiqueta.htmlFor = `clave-${indice}-0`;
        etiqueta.textContent = (clave && clave.etiqueta) || `Contraseña ${indice + 1}`;

        const fila = document.createElement("div");
        fila.className = "clave-digitos";
        fila.id = `fila-${indice}`;
        fila.setAttribute("role", "group");
        fila.setAttribute("aria-label", etiqueta.textContent);

        for (let d = 0; d < cantidad; d++) {
            const digito = document.createElement("input");
            digito.className = "digito";
            digito.id = `clave-${indice}-${d}`;
            digito.type = "text";
            digito.inputMode = "numeric";       // Teclado numérico en el celular
            digito.autocomplete = "off";
            digito.setAttribute("aria-label", `${etiqueta.textContent}: dígito ${d + 1} de ${cantidad}`);
            digito.dataset.clave = indice;
            fila.appendChild(digito);
        }

        grupo.append(etiqueta, fila);
        contenedor.appendChild(grupo);
    });

    // Un solo "escuchador" para todos los casilleros (más liviano que uno por casillero)
    contenedor.addEventListener("input", alEscribirDigito);
    contenedor.addEventListener("keydown", alTeclaDigito);
    contenedor.addEventListener("paste", alPegarDigitos);
    contenedor.addEventListener("focusin", (evento) => {
        if (evento.target.classList.contains("digito")) {
            const casillero = evento.target;
            // Al entrar, se selecciona: escribir reemplaza el dígito.
            // Solo si sigue teniendo el foco: si se escribe rápido y ya pasó al siguiente casillero,
            // seleccionar este le devolvería el foco y el próximo dígito caería en el lugar equivocado
            setTimeout(() => {
                if (document.activeElement === casillero) casillero.select();
            }, 0);
        }
    });
}

// Saca el estado verde/rojo de una contraseña cuando se vuelve a escribir en ella
function limpiarEstadoClave(indice) {
    digitosDeClave(indice).forEach((d) => d.classList.remove("correcta", "incorrecta"));
}

// Marca un casillero como lleno (o no) y, si la contraseña quedó completa, hace un "pop" en la fila
function actualizarCasillero(casillero) {
    const lleno = casillero.value !== "";
    casillero.classList.toggle("lleno", lleno);
    if (!lleno) return;
    if (!MOVIMIENTO_REDUCIDO) {
        // Saltito al escribir (como en Duolingo)
        casillero.animate(
            [{ transform: "translateY(-2px) scale(1)" }, { transform: "translateY(-2px) scale(1.12)" }, { transform: "translateY(-2px) scale(1)" }],
            { duration: 200, easing: "ease-out" }
        );
    }
}

// Escribir en un casillero: deja solo un dígito y pasa al siguiente
function alEscribirDigito(evento) {
    const casillero = evento.target;
    if (!casillero.classList.contains("digito")) return;

    const digitos = casillero.value.replace(/\D/g, "");
    // Pegado o autocompletado de varios dígitos: se reparten en los casilleros siguientes
    if (digitos.length > 2 || evento.inputType === "insertFromPaste") {
        repartirDigitos(casillero, digitos);
        return;
    }
    // Si ya tenía un dígito y se escribió otro, queda el nuevo (el que está justo antes del cursor)
    let nuevo = digitos;
    if (digitos.length === 2) {
        const posicion = Math.max(1, casillero.selectionStart || 2);
        nuevo = casillero.value.replace(/\D/g, "").charAt(posicion - 1) || digitos.charAt(1);
    }
    casillero.value = nuevo;
    limpiarEstadoClave(Number(casillero.dataset.clave));
    ocultarAnuncio();
    actualizarCasillero(casillero);

    if (nuevo !== "") {
        const todos = todosLosDigitos();
        const siguiente = todos[todos.indexOf(casillero) + 1];
        if (siguiente) siguiente.focus();
    }
}

// Teclas: borrar en un casillero vacío vuelve al anterior, flechas para moverse y Enter para seguir/verificar
function alTeclaDigito(evento) {
    const casillero = evento.target;
    if (!casillero.classList.contains("digito")) return;
    const todos = todosLosDigitos();
    const posicion = todos.indexOf(casillero);

    if (evento.key === "Backspace" && casillero.value === "" && posicion > 0) {
        evento.preventDefault();
        const anterior = todos[posicion - 1];
        anterior.value = "";
        actualizarCasillero(anterior);
        limpiarEstadoClave(Number(anterior.dataset.clave));
        anterior.focus();
    } else if (evento.key === "ArrowLeft" && posicion > 0) {
        evento.preventDefault();
        todos[posicion - 1].focus();
    } else if (evento.key === "ArrowRight" && posicion < todos.length - 1) {
        evento.preventDefault();
        todos[posicion + 1].focus();
    } else if (evento.key === "Enter") {
        evento.preventDefault();
        if (posicion < todos.length - 1) todos[posicion + 1].focus();
        else verificar();
    }
}

// Pegar un número: se reparte en los casilleros desde el actual en adelante
function alPegarDigitos(evento) {
    const casillero = evento.target;
    if (!casillero.classList.contains("digito")) return;
    evento.preventDefault();
    const texto = (evento.clipboardData || window.clipboardData).getData("text") || "";
    repartirDigitos(casillero, texto.replace(/\D/g, ""));
}

function repartirDigitos(desde, digitos) {
    const todos = todosLosDigitos();
    let posicion = todos.indexOf(desde);
    if (digitos === "") {
        desde.value = "";
        actualizarCasillero(desde);
        return;
    }
    for (const caracter of digitos) {
        if (posicion >= todos.length) break;
        todos[posicion].value = caracter;
        limpiarEstadoClave(Number(todos[posicion].dataset.clave));
        actualizarCasillero(todos[posicion]);
        posicion++;
    }
    ocultarAnuncio();
    (todos[Math.min(posicion, todos.length - 1)]).focus();
}

function configurarBoton() {
    const boton = $("boton");
    if (boton) boton.addEventListener("click", verificar);
}

// Mensaje suave debajo de las contraseñas
function mostrarAnuncio(texto) {
    const anuncio = $("anuncio");
    if (!anuncio) return;
    anuncio.textContent = texto;
    anuncio.classList.add("mostrar");
}

function ocultarAnuncio() {
    const anuncio = $("anuncio");
    if (anuncio) anuncio.classList.remove("mostrar");
}

// Revisa las 10 contraseñas: cada fila se pinta entera de verde (con "pop") o de rojo (con temblor largo).
// Si todas están bien, salen unas chispas verdes y se pasa a la recompensa
function verificar() {
    let todasCorrectas = true;

    CLAVES.forEach((clave, indice) => {
        const fila = $(`fila-${indice}`);
        const digitos = digitosDeClave(indice);
        const valor = valorDeClave(clave, indice);
        const ingresado = digitos.map((d) => d.value).join("");
        const correcta = valor !== "" && ingresado === valor;

        digitos.forEach((d) => {
            d.classList.remove("correcta", "incorrecta", "lleno");
            d.classList.add(correcta ? "correcta" : "incorrecta");
        });

        if (correcta) {
            pop(fila, 1.05, 420);
        } else {
            todasCorrectas = false;
            temblarLargo(fila, 1100, 7);
        }
    });

    if (todasCorrectas) {
        ocultarAnuncio();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // Cierra el teclado del celular
        const verdes = [leerVariable("--color-success"), leerVariable("--color-success-claro")];
        CLAVES.forEach((_, i) => setTimeout(() => chispasDesde($(`fila-${i}`).getBoundingClientRect(), verdes, 2), i * 30)); // Pocas chispas por fila
        $("boton").disabled = true;
        setTimeout(mostrarRecompensa, MOVIMIENTO_REDUCIDO ? 0 : 450);
    } else {
        mostrarAnuncio("Revisá las marcadas en rojo, con calma.");
    }
}

// ============================================
// 2) RECOMPENSA: "¡OBTUVISTE LA LLAVE!"
// La llave sube desde abajo con resorte, aterriza aplastándose un poco, explotan chispas,
// el título salta letra por letra y aparece el botón para continuar
// ============================================

// Separa el título en letras para que cada una salte por su cuenta
function prepararTituloRecompensa() {
    const titulo = $("recompensa-titulo");
    if (!titulo || titulo.dataset.listo) return;
    const texto = titulo.textContent;
    titulo.textContent = "";
    titulo.setAttribute("aria-label", texto);
    [...texto].forEach((caracter, i) => {
        const letra = document.createElement("span");
        letra.className = "letra";
        letra.setAttribute("aria-hidden", "true");
        letra.textContent = caracter;
        letra.style.animationDelay = `${i * 28}ms`;
        titulo.appendChild(letra);
    });
    titulo.dataset.listo = "1";
}

function configurarRecompensa() {
    prepararTituloRecompensa();
    const boton = $("boton-recompensa");
    if (boton) boton.addEventListener("click", salirDeRecompensa);
}

async function mostrarRecompensa() {
    const caja = $("caja");
    const recompensa = $("recompensa");
    const llave = $("llave-recompensa");
    const escenario = $("recompensa-escenario");
    const titulo = $("recompensa-titulo");
    const texto = $("recompensa-texto");
    const boton = $("boton-recompensa");

    if (caja) caja.classList.add("oculta");   // La caja de contraseñas se va
    document.body.classList.add("capa-abierta"); // Desde acá siempre hay una capa encima: el cielo baja a 30 cuadros por segundo
    await esperar(MOVIMIENTO_REDUCIDO ? 0 : 260);

    recompensa.classList.add("visible");
    recompensa.setAttribute("aria-hidden", "false");

    if (MOVIMIENTO_REDUCIDO) {
        llave.style.opacity = "1";
        [titulo, texto, boton].forEach((el) => el.classList.add("visible"));
        titulo.querySelectorAll(".letra").forEach((l) => { l.style.opacity = "1"; });
        texto.style.opacity = "1";
        boton.style.opacity = "1";
        boton.style.transform = "none";
        return;
    }

    await esperar(120);
    $("rayos").classList.add("visible");

    // La llave sube desde abajo con resorte y un pequeño giro que se asienta
    await animar(llave, 760, (t) => ({
        transform: `translateY(${resorte(240, 0, t, 5, 1.05)}%) rotate(${resorte(-24, 0, t, 5, 1)}deg)`,
        opacity: Math.min(1, t * 5)
    }));

    // Aterriza: se aplasta y estira (squash & stretch), explotan rayos y chispas
    estallar(escenario);
    chispasDesde(llave.getBoundingClientRect(), [leerVariable("--color-warning"), leerVariable("--color-blanco"), leerVariable("--llave-base")], 14); // 14 chispas (eran 22)
    await animarCuadros(llave, [
        { transform: "scale(1, 1)" },
        { transform: "scale(1.14, .86)", offset: 0.3 },
        { transform: "scale(.94, 1.08)", offset: 0.65 },
        { transform: "scale(1, 1)" }
    ], 380);
    llave.classList.add("flotando"); // Desde ahora flota y se balancea sola

    titulo.classList.add("visible");
    await esperar(titulo.querySelectorAll(".letra").length * 28 + 100);
    texto.classList.add("visible");
    await esperar(150);
    boton.classList.add("visible");
}

// Continuar: la llave sale volando hacia arriba, se va la recompensa y aparece la prueba
async function salirDeRecompensa() {
    const boton = $("boton-recompensa");
    const llave = $("llave-recompensa");
    if (boton.disabled) return;
    boton.disabled = true;

    if (!MOVIMIENTO_REDUCIDO) {
        llave.classList.remove("flotando");
        await animarCuadros(llave, [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(12%) scale(1.08, .9)", opacity: 1, offset: 0.25 },
            { transform: "translateY(-160%) scale(.5)", opacity: 0 }
        ], 400, "cubic-bezier(.5, 0, .75, .3)");
    }

    $("recompensa").classList.remove("visible");
    $("recompensa").setAttribute("aria-hidden", "true");
    await esperar(MOVIMIENTO_REDUCIDO ? 0 : 150);
    mostrarQuiz();
}

// Rayos, destellos y flash que salen del centro del contenedor.
// Cada elemento se borra solo al terminar su animación.
function estallar(contenedor) {
    if (!contenedor || MOVIMIENTO_REDUCIDO) return;

    // Flash blanco que se expande y se apaga
    const flash = document.createElement("span");
    flash.className = "flash";
    contenedor.appendChild(flash);
    flash.animate(
        [
            { transform: "scale(.2)", opacity: 0.95 },
            { transform: "scale(1.6)", opacity: 0.6, offset: 0.4 },
            { transform: "scale(3)", opacity: 0 }
        ],
        { duration: 650, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
    ).finished.then(() => flash.remove());

    // 14 rayos que se estiran hacia afuera en círculo
    for (let i = 0; i < 10; i++) { // 10 rayos (eran 14)
        const rayo = document.createElement("span");
        rayo.className = "rayo";
        contenedor.appendChild(rayo);
        const angulo = (360 / 10) * i + (Math.random() * 8 - 4);
        const retraso = Math.random() * 80;
        rayo.animate(
            [
                { transform: `rotate(${angulo}deg) scaleY(0)`, opacity: 1 },
                { transform: `rotate(${angulo}deg) scaleY(1.15)`, opacity: 0.9, offset: 0.45 },
                { transform: `rotate(${angulo}deg) scaleY(1.25)`, opacity: 0 }
            ],
            { duration: 800, delay: retraso, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        ).finished.then(() => rayo.remove());
    }

    // 22 destellos que salen en todas las direcciones y se apagan
    for (let i = 0; i < 12; i++) { // 12 destellos (eran 22)
        const destello = document.createElement("span");
        destello.className = "destello";
        contenedor.appendChild(destello);
        const angulo = Math.random() * Math.PI * 2;
        const distancia = Math.random() * 170 + 90;
        const retraso = Math.random() * 120;
        destello.animate(
            [
                { transform: "translate(0px, 0px) scale(.4)", opacity: 1 },
                { transform: `translate(${Math.cos(angulo) * distancia}px, ${Math.sin(angulo) * distancia}px) scale(1)`, opacity: 0.9, offset: 0.6 },
                { transform: `translate(${Math.cos(angulo) * distancia * 1.1}px, ${Math.sin(angulo) * distancia * 1.1}px) scale(.2)`, opacity: 0 }
            ],
            { duration: 950 + Math.random() * 300, delay: retraso, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        ).finished.then(() => destello.remove());
    }
}

// ============================================
// PRUEBA: CARGA Y FORMATO DE LAS PREGUNTAS
// El JSON usa el mismo formato que Test:
//   { "preguntas": [ { "tipo": "normal" | "multiple" | "vf", "pregunta", "opciones",
//                      "correcta" (normal: posición / vf: true o false),
//                      "correctas" (multiple: lista de posiciones),
//                      "tema", "descripcion", "dificil": true (opcional) } ] }
// ============================================

// Descarga preguntas.json y deja solo las preguntas bien armadas
async function cargarPreguntas() {
    const respuesta = await fetch(ARCHIVO_PREGUNTAS, { cache: "no-store" });
    if (!respuesta.ok) throw new Error(`No se pudo leer ${ARCHIVO_PREGUNTAS} (${respuesta.status})`);
    const datos = await respuesta.json();
    const lista = Array.isArray(datos) ? datos : datos.preguntas;
    if (!Array.isArray(lista)) throw new Error(`${ARCHIVO_PREGUNTAS} no tiene una lista "preguntas"`);

    const validas = [];
    lista.forEach((cruda, i) => {
        const pregunta = normalizarPregunta(cruda);
        if (pregunta) validas.push(pregunta);
        else console.warn(`[Prueba] La pregunta ${i + 1} de ${ARCHIVO_PREGUNTAS} está mal armada y se saltea:`, cruda);
    });
    return validas;
}

// Detecta el tipo de una pregunta (igual que Test): por "tipo" o por la forma de la respuesta
function detectarTipo(q) {
    if (typeof q.tipo === "string" && q.tipo.trim() !== "") {
        const t = q.tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ\s_-]/g, "");
        if (t === "vf" || t.startsWith("verdadero")) return "vf";
        if (t.startsWith("multi") || t.startsWith("seleccionmultiple")) return "multiple";
        if (t === "normal") return "normal";
        return null;
    }
    if (Array.isArray(q.correctas)) return "multiple";
    if (typeof q.correcta === "boolean") return "vf";
    return "normal";
}

// Valida una pregunta y la pasa al formato interno:
// { tipo, pregunta, opciones, correctas: [posiciones], letras, tema, descripcion, dificil }
function normalizarPregunta(q) {
    if (!q || typeof q.pregunta !== "string" || q.pregunta.trim() === "") return null;
    const tipo = detectarTipo(q);
    if (!tipo) return null;

    let opciones;
    let correctas;
    let letras;

    if (tipo === "vf") {
        let valor = q.correcta;
        if (typeof valor === "string") valor = { verdadero: true, v: true, falso: false, f: false }[valor.trim().toLowerCase()];
        if (typeof valor !== "boolean") return null;
        opciones = OPCIONES_VF.slice();
        correctas = [valor ? 0 : 1];
        letras = ["V", "F"];
    } else {
        if (!Array.isArray(q.opciones) || q.opciones.length < 2 || q.opciones.length > 26) return null;
        opciones = q.opciones.map(String);
        letras = opciones.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, D...
        const posicionValida = (n) => Number.isInteger(n) && n >= 0 && n < opciones.length;
        if (tipo === "normal") {
            if (!posicionValida(q.correcta)) return null;
            correctas = [q.correcta];
        } else {
            if (!Array.isArray(q.correctas) || q.correctas.length < 1 || !q.correctas.every(posicionValida)) return null;
            correctas = [...new Set(q.correctas)].sort((a, b) => a - b);
        }
    }

    return {
        tipo,
        pregunta: q.pregunta.trim(),
        opciones,
        correctas,
        letras,
        tema: typeof q.tema === "string" ? q.tema.trim() : "",
        descripcion: typeof q.descripcion === "string" ? q.descripcion.trim() : "",
        dificil: q.dificil === true || (typeof q.dificil === "string" && ["true", "si", "sí", "1"].includes(q.dificil.trim().toLowerCase()))
    };
}

// ============================================
// PRUEBA: ESTADO Y PANTALLA
// ============================================

const quiz = {
    banco: [],              // Todas las preguntas válidas del JSON
    ronda: [],              // Las preguntas de la ronda actual (al azar)
    actual: 0,              // Posición de la pregunta actual en la ronda (= racha actual)
    elegidas: [],           // Opciones marcadas en la pregunta actual
    comprobada: false,      // true cuando la pregunta actual ya se corrigió
    estadoBoton: "comprobar", // comprobar | continuar | reiniciar | final | reintentar
    introOcupada: false,    // true mientras corre la animación de "Pregunta difícil"
    ocupado: false,         // true mientras se cambia de pregunta (evita dobles toques)
    introVistas: new Set(), // Preguntas difíciles cuya animación ya se mostró en esta ronda
    // MAZO DE PREGUNTAS (sin reposición): ids de las preguntas que todavía no aparecieron en este ciclo.
    // Cuando hacen falta más, se agrega un ciclo nuevo con todas, dejando al fondo las del intento anterior
    mazo: [],
    vistasIntento: [],      // ids de las preguntas que ya aparecieron en el intento actual
    anteriores: []          // ids de las preguntas que aparecieron en el intento anterior (nunca se repiten en el siguiente)
};

// Clave para guardar el mazo en el navegador: así, aunque recargue la página, no se repiten preguntas
const CLAVE_MAZO = "acceso-mazo-preguntas";

function configurarQuiz() {
    const boton = $("boton-quiz");
    if (boton) boton.addEventListener("click", accionBotonQuiz);
    configurarFlechaScroll();

    // La hoja inferior cambia de alto (cartel corto o largo): el quiz le deja siempre el lugar justo abajo
    const hoja = $("hoja");
    if (hoja && "ResizeObserver" in window) {
        new ResizeObserver(() => {
            document.documentElement.style.setProperty("--alto-hoja", `${hoja.offsetHeight}px`);
        }).observe(hoja);
    }
}

// ============================================
// FLECHA "HAY MÁS ABAJO"
// En el quiz, si la pregunta no entra en la pantalla, aparece una flechita que rebota arriba de la hoja.
// Se esconde sola al llegar abajo del todo; tocarla baja la pantalla
// ============================================

function configurarFlechaScroll() {
    const capa = $("quiz");
    const flecha = $("flecha-scroll");
    if (!capa || !flecha) return;

    let pendiente = false;
    const programar = () => {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => { pendiente = false; actualizarFlecha(); }); // Como mucho una vez por cuadro
    };
    capa.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    if ("ResizeObserver" in window) {
        new ResizeObserver(programar).observe(capa.querySelector(".quiz-contenido")); // Cambia el alto del contenido o de la hoja
    }

    flecha.addEventListener("click", () => {
        capa.scrollBy({ top: Math.round(capa.clientHeight * 0.6), behavior: MOVIMIENTO_REDUCIDO ? "auto" : "smooth" });
    });
}

// Muestra la flecha solo si estamos en el quiz y todavía queda contenido abajo
function actualizarFlecha() {
    const capa = $("quiz");
    const flecha = $("flecha-scroll");
    if (!capa || !flecha) return;
    const enQuiz = document.body.classList.contains("en-quiz");
    const faltaAbajo = capa.scrollTop + capa.clientHeight < capa.scrollHeight - 12;
    flecha.classList.toggle("visible", enQuiz && faltaAbajo);
}

// Muestra la prueba (sube desde abajo, con la hoja inferior) y arranca la primera ronda
async function mostrarQuiz() {
    const capa = $("quiz");
    if (!capa) return;
    capa.classList.add("visible");
    capa.setAttribute("aria-hidden", "false");
    document.body.classList.add("en-quiz");       // Hace subir la hoja inferior
    $("hoja").setAttribute("aria-hidden", "false");

    try {
        quiz.banco = await (cargaPreguntas || cargarPreguntas());
        if (quiz.banco.length === 0) throw new Error(`${ARCHIVO_PREGUNTAS} no tiene preguntas válidas`);
        quiz.banco.forEach((pregunta, i) => { pregunta.id = i; }); // Cada pregunta tiene un id fijo para el mazo
        prepararMazo();
        armarRonda();
        dibujarPregunta();
    } catch (error) {
        console.error("[Prueba]", error);
        mostrarErrorQuiz();
    }
}

// Cambia el texto, el ícono, la función y el color del botón de la hoja
// (azul = comprobar, verde = continuar, rojo = empezar de nuevo, dorado = abrir el corazón)
function ponerBoton(texto, nombreIcono, estado, habilitado) {
    const boton = $("boton-quiz");
    $("boton-quiz-texto").textContent = texto;
    $("boton-quiz-icono").textContent = nombreIcono;
    quiz.estadoBoton = estado;
    boton.disabled = !habilitado;
    boton.classList.toggle("boton--verde", estado === "continuar");
    boton.classList.toggle("boton--rojo", estado === "reiniciar");
    boton.classList.toggle("boton--dorado", estado === "final");
}

// Vuelve la hoja inferior a su estado normal (sin color ni cartel)
function limpiarHoja() {
    const hoja = $("hoja");
    hoja.classList.remove("hoja--bien", "hoja--mal");
    const veredicto = $("veredicto");
    veredicto.hidden = true;
    veredicto.textContent = "";
}

// Dibuja la pregunta actual con sus opciones
function dibujarPregunta() {
    const q = quiz.ronda[quiz.actual];
    quiz.elegidas = [];
    quiz.comprobada = false;
    marcarVista(q.id); // Apareció en pantalla: se descarta del mazo (no vuelve hasta que salgan todas)

    $("pregunta-texto").textContent = q.pregunta; // textContent: el texto nunca se interpreta como HTML
    $("pregunta-tema").textContent = q.tema;
    $("insignia").hidden = !q.dificil;
    ponerDificil(q.dificil);
    actualizarMarcas();
    limpiarHoja();

    const multiple = q.tipo === "multiple";
    $("pregunta-ayuda").textContent = multiple ? "Seleccioná todas las correctas" : "";

    const opciones = $("opciones");
    opciones.classList.remove("opciones--bloqueadas");
    opciones.setAttribute("role", multiple ? "group" : "radiogroup");
    opciones.textContent = "";

    q.opciones.forEach((texto, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        // Verdadero/falso: cada opción lleva la clase de su valor para iluminarse en verde o rojo al elegirla
        const ladoVf = q.tipo === "vf" ? (i === 0 ? " opcion--vf-v" : " opcion--vf-f") : "";
        btn.className = (multiple ? "opcion opcion--multi" : "opcion") + ladoVf;
        btn.setAttribute("role", multiple ? "checkbox" : "radio");
        btn.setAttribute("aria-checked", "false");
        btn.style.animationDelay = `${60 + i * 45}ms`; // Entran de a una (más rápido)

        const letra = document.createElement("span");
        letra.className = "opcion-letra";
        if (q.tipo === "vf") letra.appendChild(icono(i === 0 ? "check" : "close"));
        else letra.textContent = q.letras[i];

        const etiqueta = document.createElement("span");
        etiqueta.className = "opcion-texto";
        etiqueta.textContent = texto;

        btn.append(letra, etiqueta);

        // Selección múltiple: casilla a la derecha
        if (multiple) {
            const marca = icono("check_box_outline_blank");
            marca.classList.add("opcion-marca");
            btn.appendChild(marca);
        }

        btn.addEventListener("click", () => elegirOpcion(i));
        opciones.appendChild(btn);
    });

    ponerBoton("Comprobar", "check", "comprobar", false);

    // Reinicia la animación de entrada de la tarjeta (entra desde la derecha con rebote)
    const tarjeta = $("tarjeta");
    tarjeta.classList.remove("tarjeta--entrar");
    void tarjeta.offsetWidth;
    tarjeta.classList.add("tarjeta--entrar");

    $("quiz").scrollTop = 0; // En celular, cada pregunta arranca desde arriba
    requestAnimationFrame(actualizarFlecha); // ¿La pregunta nueva entra en la pantalla o hay más abajo?

    // Primera vez que aparece esta pregunta difícil en la ronda: animación en el centro de la pantalla
    if (q.dificil && !quiz.introVistas.has(quiz.actual)) {
        quiz.introVistas.add(quiz.actual);
        introDificil();
    }
}

// Marca una opción. En normal y verdadero/falso reemplaza la elección; en múltiple marca o desmarca
function elegirOpcion(i) {
    if (quiz.comprobada || quiz.introOcupada || quiz.ocupado) return;
    const q = quiz.ronda[quiz.actual];

    if (q.tipo === "multiple") {
        const seleccion = new Set(quiz.elegidas);
        if (seleccion.has(i)) seleccion.delete(i);
        else seleccion.add(i);
        quiz.elegidas = [...seleccion].sort((a, b) => a - b);
    } else {
        quiz.elegidas = [i];
    }

    Array.from($("opciones").children).forEach((btn, idx) => {
        const elegida = quiz.elegidas.includes(idx);
        btn.classList.toggle("opcion--elegida", elegida);
        btn.setAttribute("aria-checked", String(elegida));
        const marca = btn.querySelector(".opcion-marca");
        if (marca) marca.textContent = elegida ? "check_box" : "check_box_outline_blank";
    });

    // Rebote de la opción tocada: se hunde y salta (como al elegir en Duolingo)
    const tocada = $("opciones").children[i];
    if (tocada && !MOVIMIENTO_REDUCIDO) {
        tocada.animate(
            [{ transform: "scale(1)" }, { transform: "scale(.95)", offset: 0.3 }, { transform: "scale(1.03)", offset: 0.7 }, { transform: "scale(1)" }],
            { duration: 320, easing: "ease-out" }
        );
    }

    // El botón "Comprobar" se enciende con un pequeño salto la primera vez que se puede usar
    const estabaApagado = $("boton-quiz").disabled;
    ponerBoton("Comprobar", "check", "comprobar", quiz.elegidas.length > 0);
    if (estabaApagado && quiz.elegidas.length > 0) pop($("boton-quiz"), 1.04, 320);
}

// Qué hace el botón según el momento
function accionBotonQuiz() {
    if (quiz.introOcupada || quiz.ocupado) return;
    switch (quiz.estadoBoton) {
        case "comprobar": comprobar(); break;
        case "continuar": cambiarPregunta(() => { quiz.actual++; }); break;
        case "reiniciar": cambiarPregunta(() => { armarRonda(); }); break;
        case "final": terminarQuiz(); break;
        case "reintentar":
            cargaPreguntas = cargarPreguntas();
            cargaPreguntas.catch(() => {}); // El error lo muestra mostrarQuiz
            mostrarQuiz();
            break;
    }
}

// Corrige la pregunta actual: tiene que estar EXACTAMENTE bien (en múltiple, todas y solo las correctas).
// Bien: chispas verdes desde las opciones acertadas y la hoja se pinta de verde.
// Mal: las opciones incorrectas tiemblan unos segundos y la hoja se pinta de rojo
function comprobar() {
    if (quiz.comprobada || quiz.elegidas.length === 0) return;
    const q = quiz.ronda[quiz.actual];
    quiz.comprobada = true;

    const bien = quiz.elegidas.length === q.correctas.length && quiz.elegidas.every((i) => q.correctas.includes(i));
    const verdes = [leerVariable("--color-success"), leerVariable("--color-success-claro"), leerVariable("--color-blanco")];

    // Chispas por opción: el total por pregunta se reparte entre las opciones bien elegidas
    // (en una múltiple con 5 correctas salen 3 por opción, no 12 de cada una)
    const bienElegidas = quiz.elegidas.filter((i) => q.correctas.includes(i)).length || 1;
    const chispasPorOpcion = Math.max(2, Math.floor(PARTICULAS_POR_PREGUNTA / bienElegidas));

    // Pinta las opciones: bien (verde), mal (rojo) o faltó (verde cortado)
    const opciones = $("opciones");
    opciones.classList.add("opciones--bloqueadas");
    Array.from(opciones.children).forEach((btn, idx) => {
        const esCorrecta = q.correctas.includes(idx);
        const elegida = quiz.elegidas.includes(idx);
        btn.setAttribute("aria-disabled", "true");
        if (elegida && esCorrecta) {
            btn.classList.add("opcion--bien");
            pop(btn, 1.05, 450);
            if (bien) chispasDesde(btn.getBoundingClientRect(), verdes, chispasPorOpcion); // Chispas verdes (con tope por pregunta)
        } else if (elegida && !esCorrecta) {
            btn.classList.add("opcion--mal");
            temblarLargo(btn, 1700, 9);                                      // Tiembla unos segundos
        } else if (esCorrecta) {
            btn.classList.add("opcion--falto");
        }
    });

    mostrarVeredicto(q, bien);

    if (bien) {
        const aciertos = quiz.actual + 1;
        actualizarProgreso(aciertos);
        pop($("progreso-contador"), 1.45, 520);
        masUno($("progreso-contador"));
        if (q.dificil) completarMarca(quiz.actual); // Difícil acertada: tilde verde en la barra
        if (aciertos >= quiz.ronda.length) {
            ponerBoton("Abrir el corazón", "arrow_forward", "final", true);
        } else {
            ponerBoton("Continuar", "arrow_forward", "continuar", true);
        }
    } else {
        // Racha perdida: la barra se pone roja y tiembla
        $("progreso").classList.add("progreso--perdido");
        sacudir($("progreso"), 6, 420);
        ponerBoton("Empezar de nuevo", "restart_alt", "reiniciar", true);
    }
}

// Cartel de corrección dentro de la hoja inferior (como en Duolingo)
function mostrarVeredicto(q, bien) {
    const hoja = $("hoja");
    hoja.classList.add(bien ? "hoja--bien" : "hoja--mal");

    const caja = $("veredicto");
    caja.className = `veredicto veredicto--${bien ? "bien" : "mal"}`;
    caja.textContent = "";

    const cabeza = document.createElement("div");
    cabeza.className = "veredicto-cabeza";
    const circulo = document.createElement("span");
    circulo.className = "veredicto-icono";
    circulo.appendChild(icono(bien ? "check_circle" : "cancel"));
    const titulo = document.createElement("span");
    titulo.textContent = bien ? alAzar(FRASES_BIEN) : "Incorrecto";
    cabeza.append(circulo, titulo);
    caja.appendChild(cabeza);
    caja.hidden = false;
    pop(circulo, 1.35, 500);

    // Al acertar también se muestra la explicación
    if (bien) {
        if (q.descripcion) {
            const descripcion = document.createElement("p");
            descripcion.className = "veredicto-descripcion";
            descripcion.textContent = q.descripcion;
            caja.appendChild(descripcion);
        }
        return;
    }

    // Respuesta correcta (en múltiple, todas las correctas)
    const linea = document.createElement("p");
    linea.className = "veredicto-linea";
    const etiqueta = document.createElement("strong");
    etiqueta.textContent = q.correctas.length > 1 ? "Correctas:" : "Correcta:";
    linea.append(etiqueta, " ", q.correctas.map((i) => q.opciones[i]).join(" · "));
    caja.appendChild(linea);

    if (q.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "veredicto-descripcion";
        descripcion.textContent = q.descripcion;
        caja.appendChild(descripcion);
    }

    const racha = document.createElement("p");
    racha.className = "veredicto-racha";
    racha.textContent = "La racha vuelve a cero. Vas a empezar con preguntas nuevas.";
    caja.appendChild(racha);
}

// Cambia de pregunta: la tarjeta sale hacia la izquierda y la nueva entra desde la derecha
async function cambiarPregunta(antes) {
    quiz.ocupado = true;
    $("boton-quiz").disabled = true;
    const tarjeta = $("tarjeta");

    let salida = null;
    if (!MOVIMIENTO_REDUCIDO) {
        salida = tarjeta.animate(
            [{ opacity: 1, transform: "translateX(0) scale(1)" }, { opacity: 0, transform: "translateX(-60px) scale(.96)" }],
            { duration: 170, easing: "cubic-bezier(.55, 0, .75, .2)", fill: "forwards" }
        );
        await salida.finished;
    }

    antes();
    dibujarPregunta();
    if (salida) salida.cancel(); // La entrada con rebote (CSS) toma el control
    quiz.ocupado = false;
}

// Racha completa: se va la prueba y empieza la escena final del corazón
async function terminarQuiz() {
    quiz.ocupado = true;
    $("boton-quiz").disabled = true;
    ponerDificil(false);

    const capa = $("quiz");
    capa.classList.remove("visible");
    capa.setAttribute("aria-hidden", "true");
    document.body.classList.remove("en-quiz");   // La hoja baja
    actualizarFlecha();                           // Y la flecha se esconde
    $("hoja").setAttribute("aria-hidden", "true");

    await esperar(MOVIMIENTO_REDUCIDO ? 0 : 300);
    secuenciaFinal();
}

// ============================================
// 4) ESCENA FINAL (estilo Duolingo: todo con resortes, aplastes y chispas)
//  1. El corazón aparece con un "pop" que se aplasta y estira, y queda latiendo
//  2. La llave sube desde abajo y queda flotando sobre la cerradura
//  3. Se clava en la cerradura (se aplasta) y el candado hace "clac"
//  4. La llave gira 90° con rebote y saltan chispas doradas
//  5. El grillete salta hacia arriba y sale volando; explotan rayos y destellos
//  6. La llave hace "puf" y desaparece entre chispas
//  7. El corazón se abre a la mitad como un libro: adentro, todo negro
//  8. La cámara entra al corazón (zoom) y la pantalla queda negra
//  9. Aparece la foto con un "pop", confeti y chispas, y vuelve el cielo
// ============================================
async function secuenciaFinal() {
    const escena = $("escena");
    const escenaCaja = $("escena-caja");
    const candado = $("candado");
    const cuerpo = $("candado-cuerpo");
    const arco = $("arco");
    const mitadIzq = $("mitad-izq");
    const mitadDer = $("mitad-der");
    const llave = $("llave");
    const fundido = $("fundido");
    const cielo = $("cielo");

    // Con movimiento reducido: directo a la foto
    if (MOVIMIENTO_REDUCIDO) {
        mostrarPremio();
        return;
    }

    escena.classList.add("visible");
    escena.setAttribute("aria-hidden", "false");
    cielo.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }], { duration: 3000, easing: "ease-out", fill: "forwards" });

    // 1) Pop del corazón: aparece chiquito, se aplasta a lo ancho, se estira a lo alto y se asienta
    await esperar(120);
    await animarCuadros(candado, [
        { opacity: 0, transform: "translateY(40px) scale(.2)" },
        { opacity: 1, transform: "translateY(0) scale(1.14, .88)", offset: 0.45 },
        { opacity: 1, transform: "translateY(0) scale(.94, 1.07)", offset: 0.72 },
        { opacity: 1, transform: "translateY(0) scale(1, 1)" }
    ], 650);
    cuerpo.classList.add("latir");
    await esperar(250);

    // 2) La llave sube desde abajo y queda flotando un poco arriba de la cerradura
    await animar(llave, 850, (t) => ({
        transform: `translateY(${resorte(330, -28, t, 4.6, 1)}%) rotate(${resorte(-35, 0, t, 5, 1)}deg)`,
        opacity: Math.min(1, t * 5)
    }));
    await esperar(80);

    // 3) Se clava en la cerradura aplastándose, y el candado hace "clac"
    await animarCuadros(llave, [
        { transform: "translateY(-28%) scale(1, 1)" },
        { transform: "translateY(3%) scale(1.08, .9)", offset: 0.65 },
        { transform: "translateY(0%) scale(1, 1)" }
    ], 340, "ease-in");
    animarCuadros(candado, [
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.05, .94) rotate(-2deg)", offset: 0.35 },
        { transform: "scale(.98, 1.03) rotate(2deg)", offset: 0.7 },
        { transform: "scale(1) rotate(0deg)" }
    ], 340);
    await esperar(150);

    // 4) La llave gira 90° con rebote; chispas doradas en la cerradura
    await animar(llave, 560, (t) => ({ transform: `rotate(${90 * rebote(t, 2.6)}deg)` }));
    const caja = escenaCaja.getBoundingClientRect();
    const cerradura = {
        left: caja.left + caja.width * 0.498 - 14,
        top: caja.top + caja.height * 0.52 - 14,
        width: 28,
        height: 28
    };
    chispasDesde(cerradura, [leerVariable("--color-warning"), leerVariable("--color-blanco")], 10);
    await esperar(80);

    // 5) Se abre: el grillete salta con rebote, el corazón se aplasta del golpe, explotan rayos
    estallar(escenaCaja);
    animarCuadros(candado, [
        { transform: "scale(1)" },
        { transform: "scale(1.1, .9)", offset: 0.3 },
        { transform: "scale(.96, 1.05)", offset: 0.65 },
        { transform: "scale(1)" }
    ], 420);
    await animar(arco, 450, (t) => ({ transform: `translateY(${-14 * rebote(t, 2.8)}%)` }));
    // ...y sale volando girando hacia arriba a la derecha
    animarCuadros(arco, [
        { transform: "translate(0%, -14%) rotate(0deg)", opacity: 1 },
        { transform: "translate(40%, -80%) rotate(45deg)", opacity: 0 }
    ], 560, "cubic-bezier(.55, 0, .75, .2)");

    // 6) "Puf": la llave se infla y desaparece entre chispas violetas
    await esperar(120);
    chispasDesde(llave.getBoundingClientRect(), [leerVariable("--llave-base"), leerVariable("--color-blanco"), leerVariable("--color-warning")], 12);
    await animarCuadros(llave, [
        { transform: "rotate(90deg) scale(1)", opacity: 1 },
        { transform: "rotate(90deg) scale(1.25)", opacity: 1, offset: 0.35 },
        { transform: "rotate(90deg) scale(0)", opacity: 0 }
    ], 360);

    // Frena el latido sin saltos (parte del estado actual y vuelve suave a la posición normal)
    const estadoActual = getComputedStyle(cuerpo).transform;
    cuerpo.classList.remove("latir");
    await animarCuadros(cuerpo, [{ transform: estadoActual === "none" ? "none" : estadoActual }, { transform: "none" }], 200);
    await esperar(80);

    // 7) El corazón se abre a la mitad como un libro: cada mitad gira 180° sobre su borde de afuera
    //    y queda acostada al costado mostrando su cara interna; adentro, todo negro.
    //    Mientras tanto la escena se aleja un poco para que el libro abierto entre en la pantalla
    const curvaSuave = (t) => 1 - Math.pow(1 - t, 3);
    await Promise.all([
        animar(mitadIzq, 1000, (t) => ({ transform: `rotateY(${(-180 * rebote(t, 0.9)).toFixed(2)}deg)` })),
        animar(mitadDer, 1000, (t) => ({ transform: `rotateY(${(180 * rebote(t, 0.9)).toFixed(2)}deg)` })),
        animar(escenaCaja, 1000, (t) => ({ transform: `scale(${(1 - 0.38 * curvaSuave(t)).toFixed(4)})` }))
    ]);
    await esperar(300);

    // 8) La cámara entra al corazón: zoom cada vez más rápido hasta que todo es negro
    cielo.animate([{ transform: "scale(1.08)" }, { transform: "scale(1.6)" }], { duration: 1150, easing: "ease-in", fill: "forwards" });
    await Promise.all([
        animar(escenaCaja, 1150, (t) => ({ transform: `scale(${(0.62 + 17 * t * t * t).toFixed(3)})` })), // Parte de la escena alejada (0.62)
        animarCuadros(fundido, [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], 1150, "ease-in")
    ]);
    escena.classList.remove("visible");
    escena.setAttribute("aria-hidden", "true");
    await esperar(300);

    // 9) Desde el negro aparece la foto, y el cielo vuelve despacio
    mostrarPremio();
    cielo.animate([{ transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 2600, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" });
    animarCuadros(fundido, [{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], 2200, "ease-out");
}

// Aparece la foto: el marco salta con rebote (como un premio de Duolingo), la imagen se enfoca
// desde un destello y explotan confeti y chispas
async function mostrarPremio() {
    const premio = $("premio");
    const premioMarco = $("premio-marco");
    const imagen = $("imagen-premio");
    if (premio) premio.classList.add("visible");
    if (MOVIMIENTO_REDUCIDO) return;

    const marcoAnim = animarCuadros(premioMarco, [
        { opacity: 0, transform: "scale(.3) rotate(-8deg)" },
        { opacity: 1, transform: "scale(1.08) rotate(2deg)", offset: 0.55 },
        { opacity: 1, transform: "scale(.97) rotate(-1deg)", offset: 0.8 },
        { opacity: 1, transform: "scale(1) rotate(0deg)" }
    ], 850);
    if (imagen) {
        imagen.animate(
            [
                { opacity: 0, transform: "scale(1.08)" },
                { opacity: 1, transform: "scale(1)" }
            ],
            // Solo opacidad y escala (el desenfoque animado sobre una foto grande trababa el celular)
            { duration: 900, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        );
    }
    await esperar(200);
    estallar($("celebracion"));
    confeti();
    await marcoAnim;
}

// Si no se pudo cargar el JSON: aviso en la tarjeta y botón para reintentar
function mostrarErrorQuiz() {
    ponerDificil(false);
    $("insignia").hidden = true;
    $("pregunta-tema").textContent = "";
    $("pregunta-texto").textContent = "No se pudieron cargar las preguntas.";
    // Aviso cuando no carga preguntas.json: ahora nombra GitHub Pages, que es donde se publica la página
    $("pregunta-ayuda").textContent = `Revisá que ${ARCHIVO_PREGUNTAS} esté en la misma carpeta que index.html y que la página se abra desde GitHub Pages (o un servidor local), no con doble clic.`;
    $("opciones").textContent = "";
    $("veredicto").hidden = true;
    ponerBoton("Reintentar", "restart_alt", "reintentar", true);
}

// ============================================
// MAZO DE PREGUNTAS (selección sin repetir)
// - Las preguntas esperan en un mazo mezclado. Una pregunta se descarta recién cuando APARECE en pantalla.
// - Si falla antes de llegar a algunas, esas no se vieron: siguen en el mazo y salen en el próximo intento.
// - Solo cuando aparecieron TODAS se renueva el mazo (ciclo nuevo con todas mezcladas), y las del
//   intento anterior van al fondo: así es imposible que una pregunta aparezca en dos intentos seguidos.
// - El mazo se guarda en el navegador, así recargar la página tampoco repite preguntas.
// ============================================

// "Firma" del banco: cambia si se editan las preguntas del JSON (entonces el mazo guardado se descarta)
function firmaBanco() {
    let hash = 5381;
    const texto = quiz.banco.map((q) => q.pregunta).join("|");
    for (let i = 0; i < texto.length; i++) hash = ((hash << 5) + hash + texto.charCodeAt(i)) | 0;
    return `${quiz.banco.length}:${hash}`;
}

// Recupera el mazo guardado (si es del mismo banco de preguntas) o arranca uno nuevo
function prepararMazo() {
    quiz.mazo = [];
    quiz.anteriores = [];
    quiz.vistasIntento = [];
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_MAZO) || "null");
        if (guardado && guardado.firma === firmaBanco()) {
            const valido = (id) => Number.isInteger(id) && id >= 0 && id < quiz.banco.length;
            quiz.mazo = (guardado.mazo || []).filter(valido);
            // Si recargó en medio de un intento, lo que vio en ese intento cuenta como "anterior" (no se repite)
            const ultimo = (guardado.vistasIntento && guardado.vistasIntento.length) ? guardado.vistasIntento : (guardado.anteriores || []);
            quiz.anteriores = ultimo.filter(valido);
        }
    } catch (error) {
        // Sin acceso al almacenamiento (modo privado, etc.): el mazo funciona igual mientras la página esté abierta
    }
}

// Guarda el estado del mazo en el navegador
function guardarMazo() {
    try {
        localStorage.setItem(CLAVE_MAZO, JSON.stringify({
            firma: firmaBanco(),
            mazo: quiz.mazo,
            anteriores: quiz.anteriores,
            vistasIntento: quiz.vistasIntento
        }));
    } catch (error) {
        // Si no se puede guardar, no pasa nada: el mazo sigue funcionando en memoria
    }
}

// Si en el mazo quedan menos preguntas distintas de las que necesita la ronda, le agrega al final
// un ciclo nuevo con TODAS mezcladas. Las del intento anterior y las que todavía quedan pendientes
// van al fondo de ese ciclo, así salen recién después de todas las demás
function asegurarMazo(cantidad) {
    const necesarias = Math.min(cantidad, quiz.banco.length);
    let vueltas = 0;
    while (new Set(quiz.mazo).size < necesarias && vueltas < 3) {
        vueltas++;
        const evitar = new Set([...quiz.anteriores, ...quiz.mazo]);
        const todas = quiz.banco.map((q) => q.id);
        const frescas = todas.filter((id) => !evitar.has(id));
        const alFondo = todas.filter((id) => evitar.has(id));
        quiz.mazo.push(...mezclar(frescas), ...mezclar(alFondo));
    }
}

// Toma las primeras preguntas distintas del mazo (sin sacarlas: se descartan recién al aparecer).
// Nunca toma las del intento anterior, salvo que el banco tenga tan pocas preguntas que no alcance
function tomarRonda(cantidad) {
    const necesarias = Math.min(cantidad, quiz.banco.length);
    const anteriores = new Set(quiz.anteriores);
    const elegidas = [];
    for (const id of quiz.mazo) {
        if (elegidas.length >= necesarias) break;
        if (!elegidas.includes(id) && !anteriores.has(id)) elegidas.push(id);
    }
    // Respaldo para bancos muy chicos (menos de 20 preguntas): completa aunque repita del intento anterior
    for (const id of quiz.mazo) {
        if (elegidas.length >= necesarias) break;
        if (!elegidas.includes(id)) elegidas.push(id);
    }
    return elegidas;
}

// Una pregunta apareció en pantalla: se descarta del mazo y se anota como vista en este intento
function marcarVista(id) {
    if (quiz.vistasIntento.includes(id)) return;
    quiz.vistasIntento.push(id);
    const posicion = quiz.mazo.indexOf(id);
    if (posicion >= 0) quiz.mazo.splice(posicion, 1);
    guardarMazo();
}

// Arma una ronda nueva de 10 preguntas tomadas del mazo.
// Si viene de un intento fallido, lo que se vio en ese intento pasa a ser "anterior" y no se repite
function armarRonda() {
    if (quiz.vistasIntento.length > 0) {
        quiz.anteriores = quiz.vistasIntento.slice();
        quiz.vistasIntento = [];
    }

    asegurarMazo(PREGUNTAS_POR_RONDA);
    quiz.ronda = tomarRonda(PREGUNTAS_POR_RONDA).map((id) => quiz.banco[id]);
    guardarMazo();
    quiz.actual = 0;
    quiz.introVistas.clear();
    $("progreso").classList.remove("progreso--perdido");
    construirMarcas();
    actualizarProgreso(0);
}

// Contador y barra de la racha
function actualizarProgreso(aciertos) {
    const total = quiz.ronda.length || PREGUNTAS_POR_RONDA;
    $("progreso-contador").textContent = `${dosCifras(aciertos)} / ${dosCifras(total)}`;
    $("progreso-barra").style.width = `${(aciertos / total) * 100}%`;
}

// Calaveras sobre la barra en cada pregunta difícil de la ronda (como en Test).
// Cada calavera va JUSTO donde termina la barra cuando llega esa pregunta (posición i / total):
// así, mientras se responde la difícil, la punta de la barra y la calavera coinciden
function construirMarcas() {
    const contenedor = $("progreso-marcas");
    contenedor.textContent = "";
    const total = quiz.ronda.length;
    quiz.ronda.forEach((pregunta, i) => {
        if (!pregunta.dificil) return;
        const marca = icono("skull");
        marca.classList.add("progreso-marca");
        marca.style.left = `${(i / total) * 100}%`; // Donde termina la barra al llegar a esta pregunta
        marca.dataset.indice = i;
        contenedor.appendChild(marca);
    });
}

// Resalta la calavera de la pregunta actual. Las difíciles ya respondidas bien (las anteriores en la racha)
// se ven como círculo verde con tilde
function actualizarMarcas() {
    Array.from($("progreso-marcas").children).forEach((marca) => {
        const i = Number(marca.dataset.indice);
        const hecha = i < quiz.actual;
        marca.classList.toggle("progreso-marca--ahora", i === quiz.actual);
        marca.classList.toggle("progreso-marca--hecha", hecha);
        marca.textContent = hecha ? "check" : "skull";
    });
}

// La difícil actual se respondió bien: la calavera se convierte en círculo verde con tilde,
// con un "pop" y chispas verdes
function completarMarca(indice) {
    const marca = Array.from($("progreso-marcas").children).find((m) => Number(m.dataset.indice) === indice);
    if (!marca) return;
    marca.classList.remove("progreso-marca--ahora");
    marca.classList.add("progreso-marca--hecha");
    marca.textContent = "check";
    if (!MOVIMIENTO_REDUCIDO) {
        // "Pop" propio: conserva el centrado (translate) de la marca sobre la barra
        marca.animate(
            [
                { transform: "translate(-50%, -50%) scale(1)" },
                { transform: "translate(-50%, -50%) scale(1.55)", offset: 0.4 },
                { transform: "translate(-50%, -50%) scale(.92)", offset: 0.75 },
                { transform: "translate(-50%, -50%) scale(1)" }
            ],
            { duration: 450, easing: "ease-out" }
        );
    }
    chispasDesde(marca.getBoundingClientRect(), [leerVariable("--color-success"), leerVariable("--color-success-claro")], 8);
}

// Modo pregunta difícil: todo el acento azul pasa a rojo
function ponerDificil(activo) {
    document.body.classList.toggle("is-hard", !!activo);
}

// Animación "Pregunta difícil" (adaptada de Test): en el centro aparece "PREGUNTA", luego "DIFÍCIL" con la
// calavera, tiembla un instante y todo viaja hasta la etiqueta de la tarjeta. Bloquea los toques mientras dura
async function introDificil() {
    const insignia = $("insignia");
    const capa = $("intro-dificil");
    if (MOVIMIENTO_REDUCIDO || !insignia.animate) return;

    quiz.introOcupada = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    capa.textContent = "";
    const fondo = document.createElement("div");
    fondo.className = "intro-dificil-fondo";
    const etiqueta = document.createElement("p");
    etiqueta.className = "insignia intro-dificil-etiqueta";
    const calavera = icono("skull");
    const palabra1 = document.createElement("span");
    palabra1.textContent = "Pregunta";
    const palabra2 = document.createElement("span");
    palabra2.textContent = "Difícil";
    etiqueta.append(calavera, palabra1, palabra2);
    [calavera, palabra1, palabra2].forEach((el) => { el.style.opacity = "0"; });
    capa.append(fondo, etiqueta);
    capa.hidden = false;
    insignia.style.visibility = "hidden"; // La etiqueta real se revela cuando llega la animación

    const curva = "cubic-bezier(.22, 1, .36, 1)";
    // Aparición con rebote: sube, se pasa de tamaño y se asienta
    const aparecerConRebote = (el, ms = 420) => el.animate(
        [
            { opacity: 0, transform: "translateY(12px) scale(.5)" },
            { opacity: 1, transform: "translateY(-3px) scale(1.18)", offset: 0.6 },
            { opacity: 1, transform: "none" }
        ],
        { duration: ms, easing: curva, fill: "forwards" }
    ).finished;

    try {
        const natural = etiqueta.getBoundingClientRect();
        const grande = Math.min(3, (window.innerWidth * 0.84) / natural.width); // Grande, sin salirse de la pantalla
        etiqueta.style.transform = `scale(${grande})`;

        fondo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
        await aparecerConRebote(palabra1);                                  // 1) "PREGUNTA"
        await Promise.all([aparecerConRebote(palabra2), aparecerConRebote(calavera)]); // 2) "DIFÍCIL" + calavera

        // 3) Tiembla como una carta de Balatro
        await etiqueta.animate(
            [
                { transform: `scale(${grande}) rotate(0deg)` },
                { transform: `scale(${grande * 1.08}) rotate(-4deg)` },
                { transform: `scale(${grande * 1.04}) rotate(3deg)` },
                { transform: `scale(${grande}) rotate(0deg)` }
            ],
            { duration: 380, easing: "ease-out" }
        ).finished;
        await esperar(250);

        // 4) Viaja hasta la etiqueta real y se achica a su tamaño
        const destino = insignia.getBoundingClientRect();
        const origen = etiqueta.getBoundingClientRect();
        const dx = destino.left + destino.width / 2 - (origen.left + origen.width / 2);
        const dy = destino.top + destino.height / 2 - (origen.top + origen.height / 2);
        await Promise.all([
            etiqueta.animate(
                [{ transform: `scale(${grande})` }, { transform: `translate(${dx}px, ${dy}px) scale(1)` }],
                { duration: 650, easing: curva, fill: "forwards" }
            ).finished,
            fondo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, fill: "forwards" }).finished
        ]);
    } catch (error) {
        console.warn("[Prueba] La animación de pregunta difícil falló:", error);
    } finally {
        capa.hidden = true;
        capa.textContent = "";
        insignia.style.visibility = "";
        pop(insignia, 1.2, 380);
        quiz.introOcupada = false;
    }
}

// ============================================
// CIELO ESTRELLADO (canvas) — versión optimizada
// Estrellas que titilan, se desplazan despacio y flotan un poquito, y estrellas fugaces.
// Optimizaciones (para que todo se vea fluido en celular):
// - Los halos de las estrellas brillantes se dibujan UNA vez como imagen y después solo se copian.
// - Los colores se preparan una sola vez (antes se armaba un texto de color por estrella en cada cuadro).
// - Las estrellas chiquitas se dibujan como cuadraditos (mucho más barato que un círculo, y no se nota).
// - Resolución máxima 1.5x y menos estrellas en celular.
// - Cuando hay una capa encima (recompensa, quiz, escena, foto), el cielo se dibuja a 30 cuadros por segundo:
//   detrás del velo oscuro no se nota y libera al celular para las animaciones de adelante.
// ============================================

function iniciarCielo() {
    const canvas = $("cielo");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Paleta de estrellas sacada del CSS, con su "peso" (qué tan seguido aparece cada color)
    const paleta = [
        { rgb: hexARgb(leerVariable("--estrella-blanca")), peso: 0.5 },
        { rgb: hexARgb(leerVariable("--estrella-azul")), peso: 0.3 },
        { rgb: hexARgb(leerVariable("--estrella-celeste")), peso: 0.2 }
    ];
    const colorFugaz = hexARgb(leerVariable("--estrella-fugaz"));
    const colorSolido = paleta.map((c) => `rgb(${c.rgb})`); // Se arma una sola vez

    // Halo pre-dibujado por color (imagen chiquita que después solo se copia)
    const halos = paleta.map((c) => {
        const tam = 64;
        const lienzo = document.createElement("canvas");
        lienzo.width = tam;
        lienzo.height = tam;
        const g = lienzo.getContext("2d");
        const degradado = g.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
        degradado.addColorStop(0, `rgba(${c.rgb}, 0.55)`);
        degradado.addColorStop(0.3, `rgba(${c.rgb}, 0.18)`);
        degradado.addColorStop(1, `rgba(${c.rgb}, 0)`);
        g.fillStyle = degradado;
        g.fillRect(0, 0, tam, tam);
        return lienzo;
    });

    let ancho = 0;
    let alto = 0;
    let anchoAnterior = 0;
    let escala = 1;          // Achica fugaces y halos en pantallas chicas
    let estrellas = [];
    let fugaces = [];
    let proximaFugaz = 0;
    let ultimoTiempo = 0;
    let tiempoCielo = 0;     // Reloj propio del cielo: no salta al volver a la pestaña
    let ultimoDibujo = 0;    // Momento del último cuadro dibujado (para limitar los cuadros por segundo)

    function colorAlAzar() {
        let tirada = Math.random();
        for (let i = 0; i < paleta.length; i++) {
            if (tirada < paleta[i].peso) return i;
            tirada -= paleta[i].peso;
        }
        return 0;
    }

    // Ajusta el canvas al tamaño real de la pantalla. Las estrellas se regeneran solo si cambia
    // el ancho, así no "saltan" al esconderse la barra del navegador
    function redimensionar() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    // Estrellas guardadas en proporción (0 a 1) para que se adapten a cualquier pantalla.
    // Se ordenan por color: así el color de relleno cambia solo 3 veces por cuadro
    function crearEstrellas() {
        const densidad = ancho < 600 ? 1100 : 1500;
        const cantidad = Math.min(Math.round((ancho * alto) / densidad), 600);
        estrellas = [];

        for (let i = 0; i < cantidad; i++) {
            const azar = Math.random();
            let radio;
            let brillo;
            let halo = false;

            if (azar < 0.80) {          // Polvo de estrellas lejano
                radio = Math.random() * 0.5 + 0.3;
                brillo = Math.random() * 0.35 + 0.2;
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
                deriva: VELOCIDAD_DERIVA * (0.4 + 0.6 * profundidad),
                flotacion: Math.random() * 2.5 + 0.5,           // Cuánto flota alrededor de su lugar
                ritmoFlotacion: Math.random() * 0.25 + 0.1
            });
        }
        estrellas.sort((a, b) => a.color - b.color);
    }

    // Lo que sale por un borde entra por el opuesto
    function envolver(valor, limite) {
        const margen = 12;
        const total = limite + margen * 2;
        return ((((valor + margen) % total) + total) % total) - margen;
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

            // Cabeza brillante (reutiliza el halo blanco pre-dibujado)
            ctx.globalAlpha = alfa;
            ctx.drawImage(halos[0], f.x - 8, f.y - 8, 16, 16);
            ctx.globalAlpha = 1;
        }
    }

    // ---------- DIBUJO DE CADA CUADRO ----------

    function dibujarCuadro(tiempo, delta) {
        ctx.clearRect(0, 0, ancho, alto);
        let colorActual = -1;

        for (let i = 0; i < estrellas.length; i++) {
            const e = estrellas[i];
            const titileo = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(tiempo * e.velocidad + e.fase));
            const alfa = e.brillo * titileo;

            // Desplazamiento lento + flotación (vaivén circular chiquito)
            const avance = MOVIMIENTO_REDUCIDO ? 0 : tiempo * e.deriva;
            const flotarX = MOVIMIENTO_REDUCIDO ? 0 : Math.sin(tiempo * e.ritmoFlotacion + e.fase) * e.flotacion;
            const flotarY = MOVIMIENTO_REDUCIDO ? 0 : Math.cos(tiempo * e.ritmoFlotacion * 0.8 + e.fase) * e.flotacion;
            const x = envolver(e.px * ancho + avance + flotarX, ancho);
            const y = envolver(e.py * alto - avance * 0.3 + flotarY, alto);

            if (e.color !== colorActual) {
                colorActual = e.color;
                ctx.fillStyle = colorSolido[colorActual];
                ctx.strokeStyle = colorSolido[colorActual];
            }
            ctx.globalAlpha = alfa;

            if (e.halo) {
                // Halo: copia de la imagen pre-dibujada (barato)
                const radioHalo = e.radio * 7 * escala;
                ctx.drawImage(halos[e.color], x - radioHalo, y - radioHalo, radioHalo * 2, radioHalo * 2);
                // Destello en cruz muy fino
                const largo = e.radio * 6 * titileo * escala;
                ctx.globalAlpha = alfa * 0.35;
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(x - largo, y);
                ctx.lineTo(x + largo, y);
                ctx.moveTo(x, y - largo);
                ctx.lineTo(x, y + largo);
                ctx.stroke();
                ctx.globalAlpha = alfa;
                ctx.beginPath();
                ctx.arc(x, y, e.radio, 0, Math.PI * 2);
                ctx.fill();
            } else if (e.radio < 0.9) {
                // Estrella chiquita: un cuadradito (a este tamaño se ve igual que un círculo)
                const lado = e.radio * 1.8;
                ctx.fillRect(x - lado / 2, y - lado / 2, lado, lado);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, e.radio, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        if (!MOVIMIENTO_REDUCIDO) {
            if (tiempo >= proximaFugaz) {
                crearFugaz();
                programarFugaz(tiempo);
            }
            dibujarFugaces(delta);
        }
    }

    // Bucle de animación: el navegador lo pausa solo cuando la pestaña no se ve (ahorra batería).
    // Las estrellas se mueven muy despacio, así que alcanza con 30 cuadros por segundo; con una capa
    // encima (recompensa, quiz, escena, foto) baja a 15, porque detrás del velo casi no se ve.
    // Así el celular queda libre para las animaciones de adelante
    function bucle(marca) {
        requestAnimationFrame(bucle);
        const intervalo = document.body.classList.contains("capa-abierta") ? 1000 / 15 : 1000 / 30;
        if (marca - ultimoDibujo < intervalo - 2) return;
        ultimoDibujo = marca;
        const ahora = marca / 1000;
        const delta = Math.min(ahora - ultimoTiempo, 0.1);
        ultimoTiempo = ahora;
        tiempoCielo += delta;
        dibujarCuadro(tiempoCielo, delta);
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
            bucle(marca);
        });
    }
}
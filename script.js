// ============================================
// ACCESO · 10 CONTRASEÑAS + CANDADO DE CORAZÓN + PRUEBA DE 10 PREGUNTAS
// - Genera los 10 campos y los revisa: rojo si está mal, verde si está bien.
// - Si todas coinciden, corre la secuencia del candado (resortes estilo Balatro).
// - Después aparece la prueba: 10 preguntas al azar de preguntas.json que hay que
//   responder bien SEGUIDAS. Si se falla una, la racha vuelve a cero con preguntas nuevas.
// - Al completar la racha, estallido final y aparece la imagen.
// - Dibuja el cielo estrellado en el <canvas id="cielo">.
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

// ===== AJUSTES DE LA PRUEBA =====
const ARCHIVO_PREGUNTAS = "preguntas.json"; // Archivo con el banco de preguntas (misma carpeta que index.html)
const PREGUNTAS_POR_RONDA = 10;             // Cuántas hay que responder bien seguidas

// ===== AJUSTES DEL CIELO =====
const VELOCIDAD_DERIVA = 7;     // Píxeles por segundo que avanzan las estrellas más cercanas
const FUGAZ_MINIMO = 6;         // Segundos mínimos entre estrellas fugaces
const FUGAZ_MAXIMO = 14;        // Segundos máximos entre estrellas fugaces

// Detecta si el usuario pidió menos movimiento en su sistema
const MOVIMIENTO_REDUCIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Opciones fijas de las preguntas de verdadero o falso
const OPCIONES_VF = ["Verdadero", "Falso"];

// Carga de preguntas: arranca apenas abre la página, así ya están listas al llegar a la prueba
let cargaPreguntas = null;

document.addEventListener("DOMContentLoaded", () => {
    aplicarColorDeTema();
    generarClaves();
    configurarBoton();
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

// Anima un elemento durante "ms" milisegundos.
// "fn(t)" devuelve las propiedades a aplicar en el momento t (0 a 1), por ejemplo
// { transform: "scale(1.2)", opacity: 0.5 }. Se calcula un cuadro cada ~16ms para que sea suave.
// Al terminar, deja el elemento en su último estado y libera la animación.
function animar(elemento, ms, fn) {
    if (!elemento) return Promise.resolve();
    const pasos = Math.max(12, Math.round(ms / 16));
    const cuadros = [];
    for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        cuadros.push({ ...fn(t), offset: t });
    }
    const animacion = elemento.animate(cuadros, { duration: ms, easing: "linear", fill: "forwards" });
    return animacion.finished.then(() => {
        const ultimo = cuadros[cuadros.length - 1];
        Object.keys(ultimo).forEach((propiedad) => {
            if (propiedad !== "offset") elemento.style[propiedad] = ultimo[propiedad];
        });
        animacion.cancel();
    });
}

// "Pop" con rebote: el elemento se agranda y vuelve (para contadores, insignias, etc.)
function pop(elemento, escala = 1.3, ms = 450) {
    if (!elemento || MOVIMIENTO_REDUCIDO) return;
    elemento.animate(
        [{ transform: "scale(1)" }, { transform: `scale(${escala})`, offset: 0.35 }, { transform: "scale(.95)", offset: 0.7 }, { transform: "scale(1)" }],
        { duration: ms, easing: "ease-out" }
    );
}

// Sacudida horizontal (para errores)
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

// ============================================
// CAMPOS DE CONTRASEÑA
// ============================================

// Crea un campo por cada contraseña de CLAVES
function generarClaves() {
    const contenedor = $("claves");
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
                $(`clave-${indice + 1}`).focus();
            }
        });

        // Enter: pasa al siguiente campo (en el último, verifica). Borrar en un campo vacío vuelve al anterior
        campo.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                if (indice < CLAVES.length - 1) {
                    $(`clave-${indice + 1}`).focus();
                } else {
                    verificar();
                }
            }
            if (evento.key === "Backspace" && campo.value.length === 0 && indice > 0) {
                $(`clave-${indice - 1}`).focus();
            }
        });

        grupo.append(etiqueta, campo);
        contenedor.appendChild(grupo);
    });
}

function configurarBoton() {
    const boton = $("boton");
    if (boton) boton.addEventListener("click", verificar);
}

// Mensaje suave debajo de los campos
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

// Revisa las 10 contraseñas: pinta cada campo de verde o rojo con su propia animación.
// Si todas están bien, dispara la secuencia del candado.
function verificar() {
    const campos = Array.from(document.querySelectorAll(".clave-campo"));
    let todasCorrectas = true;

    campos.forEach((campo, indice) => {
        const correcta = campo.value === CLAVES[indice].valor;
        campo.classList.remove("correcta", "incorrecta");

        if (correcta) {
            campo.classList.add("correcta");
            pop(campo, 1.05, 480); // Pequeño "pop" en verde
        } else {
            campo.classList.add("incorrecta");
            todasCorrectas = false;
            sacudir(campo);        // Sacudida en rojo
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
// SECUENCIA DE DESBLOQUEO (estilo Balatro: resortes, rebotes y temblores)
//  0.0s  la caja se achica y el velo oscurece el cielo; el cielo se acerca un poco
//  0.0s  el candado aparece con un rebote y una pequeña rotación
//  1.0s  el corazón flota y late esperando la llave
//  1.3s  la llave vuela desde arriba a la derecha y se clava en la cerradura con rebote
//  2.2s  el candado da un "clac" (se achica y rebota)
//  2.6s  la llave gira 90° con rebote
//  3.3s  el grillete se levanta, la pantalla tiembla y el corazón da un golpe
//  3.4s  estallan los rayos, los destellos y el flash
//  4.0s  el candado y la llave se disuelven hacia arriba
//  4.5s  aparece la prueba de las 10 preguntas
// ============================================
async function empezarSecuencia() {
    const boton = $("boton");
    const caja = $("caja");
    const escena = $("escena");
    const escenaCaja = $("escena-caja");
    const candado = $("candado");
    const cuerpo = $("candado-cuerpo");
    const arco = $("arco");
    const llave = $("llave");
    const cielo = $("cielo");

    if (boton) boton.disabled = true;
    if (caja) caja.classList.add("oculta");

    // Con movimiento reducido: directo a la prueba, sin la animación del candado
    if (MOVIMIENTO_REDUCIDO) {
        mostrarQuiz();
        return;
    }

    // Velo y empuje suave del cielo (la cámara se acerca un poquito)
    if (escena) escena.classList.add("visible");
    if (cielo) {
        cielo.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.06)" }],
            { duration: 4200, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        );
    }

    // 1) El candado aparece con rebote y una pequeña rotación que se asienta
    await animar(candado, 700, (t) => ({
        transform: `scale(${rebote(t, 2.2)}) rotate(${resorte(-16, 0, t, 5, 1)}deg)`,
        opacity: Math.min(1, t * 4)
    }));
    if (candado) candado.classList.add("latir");
    await esperar(300);

    // 2) La llave vuela desde arriba a la derecha y cae en la cerradura con rebote
    //    (x e y en % del tamaño de la llave; la rotación baja de 70° a 0°)
    await animar(llave, 900, (t) => ({
        transform: `translate(${resorte(200, 0, t, 4.5, 0.9)}%, ${resorte(-160, 0, t, 4.5, 0.9)}%) rotate(${resorte(70, 0, t, 5, 0.9)}deg)`,
        opacity: Math.min(1, t * 6)
    }));

    // 3) "Clac": el candado se achica y rebota al recibir la llave
    await animar(cuerpo, 380, (t) => ({
        transform: `scale(${resorte(0.9, 1, t, 6, 1.4)})`
    }));

    // 4) La llave gira 90° alrededor de su punta, con un rebote al final
    await animar(llave, 700, (t) => ({
        transform: `translate(0%, 0%) rotate(${90 * rebote(t, 2.4)}deg)`
    }));

    // 5) Se abre: el grillete se levanta con rebote, la pantalla tiembla y el corazón da un golpe
    const abrirArco = animar(arco, 650, (t) => ({
        transform: `translateY(${-42 * rebote(t, 2.6)}px)`
    }));
    if (cuerpo) {
        cuerpo.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.09)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }],
            { duration: 520, easing: "ease-out" }
        );
    }
    if (escenaCaja) {
        escenaCaja.animate(
            [
                { transform: "translate(0, 0)" },
                { transform: "translate(-7px, 3px)" },
                { transform: "translate(6px, -3px)" },
                { transform: "translate(-4px, 2px)" },
                { transform: "translate(3px, -1px)" },
                { transform: "translate(0, 0)" }
            ],
            { duration: 420, easing: "ease-out" }
        );
    }

    // 6) Estallan los rayos, los destellos y el flash (un instante después de abrirse)
    await esperar(120);
    estallar(escenaCaja);
    await abrirArco;

    // 7) El candado y la llave se disuelven hacia arriba, con la llave saliendo primero
    await Promise.all([
        animar(llave, 650, (t) => ({
            transform: `translate(0%, ${-140 * t * t}%) rotate(${90 + 50 * t}deg)`,
            opacity: 1 - t
        })),
        animar(candado, 650, (t) => ({
            transform: `scale(${1 + 0.18 * t})`,
            opacity: 1 - t
        }))
    ]);

    // 8) Se va la escena y aparece la prueba de las 10 preguntas
    if (escena) escena.classList.remove("visible");
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
    for (let i = 0; i < 14; i++) {
        const rayo = document.createElement("span");
        rayo.className = "rayo";
        contenedor.appendChild(rayo);
        const angulo = (360 / 14) * i + (Math.random() * 8 - 4);
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
    for (let i = 0; i < 22; i++) {
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
    primeraAnterior: null,  // Primera pregunta de la ronda anterior (para no repetirla al reiniciar)
    introVistas: new Set()  // Preguntas difíciles cuya animación ya se mostró en esta ronda
};

function configurarQuiz() {
    const boton = $("boton-quiz");
    if (boton) boton.addEventListener("click", accionBotonQuiz);
}

// Muestra la capa de la prueba y arranca la primera ronda
async function mostrarQuiz() {
    const capa = $("quiz");
    if (!capa) return;
    capa.classList.add("visible");
    capa.setAttribute("aria-hidden", "false");

    try {
        quiz.banco = await (cargaPreguntas || cargarPreguntas());
        if (quiz.banco.length === 0) throw new Error(`${ARCHIVO_PREGUNTAS} no tiene preguntas válidas`);
        armarRonda();
        dibujarPregunta();
    } catch (error) {
        console.error("[Prueba]", error);
        mostrarErrorQuiz();
    }
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

// Arma una ronda nueva: mezcla el banco y toma las primeras 10.
// Si la primera coincide con la de la ronda anterior, la cambia, así nunca arranca igual
function armarRonda() {
    const mezcla = mezclar(quiz.banco);
    if (mezcla.length > 1 && mezcla[0] === quiz.primeraAnterior) {
        const otra = 1 + Math.floor(Math.random() * (mezcla.length - 1));
        [mezcla[0], mezcla[otra]] = [mezcla[otra], mezcla[0]];
    }
    quiz.ronda = mezcla.slice(0, Math.min(PREGUNTAS_POR_RONDA, mezcla.length));
    quiz.primeraAnterior = quiz.ronda[0];
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

// Calaveras sobre la barra en cada pregunta difícil de la ronda (como en Test)
function construirMarcas() {
    const contenedor = $("progreso-marcas");
    contenedor.textContent = "";
    const total = quiz.ronda.length;
    quiz.ronda.forEach((pregunta, i) => {
        if (!pregunta.dificil) return;
        const marca = icono("skull");
        marca.classList.add("progreso-marca");
        marca.style.left = `${((i + 1) / total) * 100}%`;
        marca.dataset.indice = i;
        contenedor.appendChild(marca);
    });
}

// Resalta la calavera de la pregunta actual y apaga las ya pasadas
function actualizarMarcas() {
    Array.from($("progreso-marcas").children).forEach((marca) => {
        const i = Number(marca.dataset.indice);
        marca.classList.toggle("progreso-marca--ahora", i === quiz.actual);
        marca.classList.toggle("progreso-marca--hecha", i < quiz.actual);
    });
}

// Modo pregunta difícil: todo el acento azul pasa a rojo
function ponerDificil(activo) {
    document.body.classList.toggle("is-hard", !!activo);
}

// Cambia el texto, el ícono, la función y el color del botón del quiz
function ponerBoton(texto, nombreIcono, estado, habilitado) {
    const boton = $("boton-quiz");
    $("boton-quiz-texto").textContent = texto;
    $("boton-quiz-icono").textContent = nombreIcono;
    quiz.estadoBoton = estado;
    boton.disabled = !habilitado;
    boton.classList.toggle("boton--reiniciar", estado === "reiniciar");
    boton.classList.toggle("boton--final", estado === "final");
}

// Dibuja la pregunta actual con sus opciones
function dibujarPregunta() {
    const q = quiz.ronda[quiz.actual];
    quiz.elegidas = [];
    quiz.comprobada = false;

    $("pregunta-texto").textContent = q.pregunta; // textContent: el texto nunca se interpreta como HTML
    $("pregunta-tema").textContent = q.tema;
    $("insignia").hidden = !q.dificil;
    ponerDificil(q.dificil);
    actualizarMarcas();

    const multiple = q.tipo === "multiple";
    $("pregunta-ayuda").textContent = multiple ? "Seleccioná todas las correctas" : "";

    // Cartel de corrección oculto y opciones desbloqueadas
    const veredicto = $("veredicto");
    veredicto.hidden = true;
    veredicto.textContent = "";

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
        btn.style.animationDelay = `${120 + i * 70}ms`; // Entran de a una

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

    // Reinicia la animación de entrada de la tarjeta (con rebote)
    const tarjeta = $("tarjeta");
    tarjeta.classList.remove("tarjeta--entrar");
    void tarjeta.offsetWidth;
    tarjeta.classList.add("tarjeta--entrar");

    $("quiz").scrollTop = 0; // En celular, cada pregunta arranca desde arriba

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

    ponerBoton("Comprobar", "check", "comprobar", quiz.elegidas.length > 0);
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

// Corrige la pregunta actual: tiene que estar EXACTAMENTE bien (en múltiple, todas y solo las correctas)
function comprobar() {
    if (quiz.comprobada || quiz.elegidas.length === 0) return;
    const q = quiz.ronda[quiz.actual];
    quiz.comprobada = true;

    const bien = quiz.elegidas.length === q.correctas.length && quiz.elegidas.every((i) => q.correctas.includes(i));

    // Pinta las opciones: bien (verde), mal (rojo) o faltó (verde cortado)
    const opciones = $("opciones");
    opciones.classList.add("opciones--bloqueadas");
    Array.from(opciones.children).forEach((btn, idx) => {
        const esCorrecta = q.correctas.includes(idx);
        const elegida = quiz.elegidas.includes(idx);
        btn.setAttribute("aria-disabled", "true");
        if (elegida && esCorrecta) {
            btn.classList.add("opcion--bien");
            pop(btn, 1.04, 420);
        } else if (elegida && !esCorrecta) {
            btn.classList.add("opcion--mal");
            sacudir(btn, 7);
        } else if (esCorrecta) {
            btn.classList.add("opcion--falto");
        }
    });

    mostrarVeredicto(q, bien);

    if (bien) {
        const aciertos = quiz.actual + 1;
        actualizarProgreso(aciertos);
        pop($("progreso-contador"), 1.45, 520);
        if (aciertos >= quiz.ronda.length) {
            ponerBoton("Ver la sorpresa", "arrow_forward", "final", true);
        } else {
            ponerBoton("Continuar", "arrow_forward", "continuar", true);
        }
    } else {
        // Racha perdida: la barra se pone roja, la tarjeta tiembla y hay que empezar de nuevo
        $("progreso").classList.add("progreso--perdido");
        sacudir($("tarjeta"), 10, 480);
        sacudir($("progreso"), 6, 420);
        ponerBoton("Empezar de nuevo", "restart_alt", "reiniciar", true);
    }

    // En celular, deja a la vista el cartel y el botón
    $("veredicto").scrollIntoView({ block: "nearest", behavior: MOVIMIENTO_REDUCIDO ? "auto" : "smooth" });
}

// Cartel de corrección: ¡Correcto! / Incorrecto, la respuesta correcta y la explicación (como en Test)
function mostrarVeredicto(q, bien) {
    const caja = $("veredicto");
    caja.className = `veredicto veredicto--${bien ? "bien" : "mal"}`;
    caja.textContent = "";

    const cabeza = document.createElement("div");
    cabeza.className = "veredicto-cabeza";
    const titulo = document.createElement("span");
    titulo.textContent = bien ? "¡Correcto!" : "Incorrecto";
    cabeza.append(icono(bien ? "check_circle" : "cancel"), titulo);
    caja.appendChild(cabeza);
    caja.hidden = false;
    pop(cabeza.firstChild, 1.4, 500);

    if (bien) return;

    // Respuesta correcta (en múltiple, todas las correctas)
    const linea = document.createElement("p");
    linea.className = "veredicto-linea";
    const etiqueta = document.createElement("strong");
    etiqueta.textContent = q.correctas.length > 1 ? "Correctas:" : "Correcta:";
    const texto = document.createElement("span");
    texto.append(etiqueta, " ", q.correctas.map((i) => q.opciones[i]).join(" · "));
    linea.append(icono("check"), texto);
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

// Cambia de pregunta con una salida suave de la tarjeta ("antes" decide qué pregunta sigue)
async function cambiarPregunta(antes) {
    quiz.ocupado = true;
    $("boton-quiz").disabled = true;
    const tarjeta = $("tarjeta");

    let salida = null;
    if (!MOVIMIENTO_REDUCIDO) {
        salida = tarjeta.animate(
            [{ opacity: 1, transform: "translateX(0) scale(1)" }, { opacity: 0, transform: "translateX(-28px) scale(.97)" }],
            { duration: 260, easing: "cubic-bezier(.55, 0, .75, .2)", fill: "forwards" }
        );
        await salida.finished;
    }

    antes();
    dibujarPregunta();
    if (salida) salida.cancel(); // La entrada con rebote (CSS) toma el control
    quiz.ocupado = false;
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

// Racha completa: se va la prueba, estallido final y aparece la imagen
async function terminarQuiz() {
    quiz.ocupado = true;
    $("boton-quiz").disabled = true;
    ponerDificil(false);

    const capa = $("quiz");
    capa.classList.remove("visible");
    capa.setAttribute("aria-hidden", "true");

    await esperar(MOVIMIENTO_REDUCIDO ? 0 : 350);
    estallar($("celebracion"));
    await esperar(MOVIMIENTO_REDUCIDO ? 0 : 180);
    mostrarPremio();
}

// Aparece la imagen: el marco crece con rebote y la imagen sale de un destello
async function mostrarPremio() {
    const premio = $("premio");
    const premioMarco = $("premio-marco");
    const imagen = $("imagen-premio");
    if (premio) premio.classList.add("visible");
    if (MOVIMIENTO_REDUCIDO) return;

    const marcoAnim = animar(premioMarco, 850, (t) => ({
        transform: `scale(${rebote(t, 2.2)})`,
        opacity: Math.min(1, t * 3)
    }));
    if (imagen) {
        imagen.animate(
            [
                { opacity: 0, filter: "blur(18px) brightness(2.2)" },
                { opacity: 1, filter: "blur(0px) brightness(1)" }
            ],
            { duration: 1100, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
        );
    }
    await marcoAnim;
}

// ============================================
// CIELO ESTRELLADO (canvas)
// Estrellas que titilan, se desplazan despacio y flotan un poquito.
// Estrellas fugaces de vez en cuando.
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
    function bucle(marca) {
        const ahora = marca / 1000;
        const delta = Math.min(ahora - ultimoTiempo, 0.05);
        ultimoTiempo = ahora;
        tiempoCielo += delta;
        dibujarCuadro(tiempoCielo, delta);
        requestAnimationFrame(bucle);
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

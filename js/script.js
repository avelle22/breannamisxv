
// Inicialización de AOS (Animate On Scroll)
AOS.init({
  // Configuraciones que pueden ser sobrescritas en elementos individuales mediante los atributos `data-aos-*`:
  offset: 120, // Desplazamiento (en px) desde el punto de activación original.
  delay: 0, // Valores de retraso en ms (de 0 a 3000) con un paso de 50ms.
  duration: 900, // Duración de la animación en ms (de 0 a 3000) con un paso de 50ms.
  easing: 'ease', // Función de suavizado predeterminada para las animaciones de AOS.
  once: false, // Si la animación debería ocurrir solo una vez al hacer scroll hacia abajo. False permite repetición.
  mirror: false, // Si los elementos deben animarse al desplazarse hacia arriba (al pasar de nuevo por ellos). False no lo permite.
  anchorPlacement: 'top-bottom', // Define la posición del elemento respecto a la ventana que activará la animación (parte superior del elemento con la parte inferior de la ventana).
});




// 🌟 --- Funcionalidad del botón "Scroll to Top" --- 🌟
// Se ejecuta la función toggleTopButton() cuando el usuario hace scroll.
window.onscroll = () => {
  toggleTopButton();
};

// Función para desplazar la página hacia la parte superior de forma suave.
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazamiento suave hacia la parte superior de la página.
}

// Función para mostrar/ocultar el botón de "Scroll to Top" basado en la posición de desplazamiento de la página.
function toggleTopButton() {
  const button = document.getElementById('back-to-up'); // Obtiene el botón por su ID 'back-to-up'.

  // Si el usuario ha desplazado más de 20px hacia abajo en el documento:
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      button.classList.add('show'); // Añade la clase 'show' al botón para que sea visible.
  } else {
      button.classList.remove('show'); // Remueve la clase 'show' para ocultar el botón si está cerca de la parte superior.
  }
}

// ====== CONFIG ======
const API_URL = 'https://script.google.com/macros/s/AKfycbxrAyVc34eyUSEZj5QLe9OgtNoXaUBKxfsxYSot21woqGsyWohgD84c0JLkNSXEpxLp/exec';

// (opcional) normaliza texto (por si comparas nombres con/sin acentos)
function norm(s){
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Si ya tienes window.listaPases definido en otro archivo, esto lo usa.
// Si no existe, simplemente mandará pases en blanco.
function getPasesAsignados(nombre){
  if (window.listaPases && window.listaPases[nombre] !== undefined) {
    return window.listaPases[nombre]; // match exacto
  }
  if (window.listaPases){
    const clave = norm(nombre);
    for (const k of Object.keys(window.listaPases)) {
      if (norm(k) === clave) return window.listaPases[k]; // match flexible
    }
  }
  return ''; // si no encuentra
}

// ====== ELEMENTOS ======
const btnSi      = document.querySelector('.btn-si');
const btnNo      = document.querySelector('.btn-no');
const btnEnviar  = document.querySelector('.btn-enviar');
const txtMensaje = document.querySelector('.mensaje-textarea');
const lblEstado  = document.querySelector('.estado-envio');

// ====== ESTADO ======
let seleccion = null; // 'SI' o 'NO'

// Marcar selección visual y guardar valor
function setSeleccion(v){
  seleccion = v;
  btnSi?.classList.toggle('seleccionado', v === 'SI');
  btnNo?.classList.toggle('seleccionado', v === 'NO');
}

// Clicks de Sí / No
btnSi?.addEventListener('click', () => setSeleccion('SI'));
btnNo?.addEventListener('click', () => setSeleccion('NO'));

// ====== ENVIAR ======
btnEnviar?.addEventListener('click', async () => {
  lblEstado.textContent = '';

  if (!seleccion){
    lblEstado.textContent = 'Elige si asistirás o no.';
    return;
  }

  // Tomamos el nombre del input de "Consulta tu Pase"
  const campoNombre = document.getElementById('nombreInput');
  let nombre = (campoNombre?.value || '').trim();
  if (!nombre){
    nombre = (prompt('Escribe tu nombre tal como aparece en la invitación:') || '').trim();
  }
  if (!nombre){
    lblEstado.textContent = 'Falta tu nombre.';
    return;
  }

  const mensaje = txtMensaje?.value.trim() || '';
  const pasesAsignados = getPasesAsignados(nombre); // '' si no existe

  // Si quieres forzar que esté en la lista, descomenta:
  // if (pasesAsignados === '') { lblEstado.textContent = 'Nombre no encontrado en la lista.'; return; }

  // Evitar preflight/CORS: mandamos como form-urlencoded (sin headers)
  const body = new URLSearchParams({
    nombre,
    asistencia: seleccion,     // 'SI' o 'NO'
    mensaje,
    pases: String(pasesAsignados ?? '')
  });

  btnEnviar.disabled = true;
  lblEstado.textContent = 'Enviando...';

  try {
    const res = await fetch(API_URL, { method: 'POST', body });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch { data = { ok: res.ok }; }

    if (data.ok){
      lblEstado.textContent = '¡Gracias! Tu confirmación fue registrada.';
      btnSi.disabled = btnNo.disabled = btnEnviar.disabled = true;
      if (txtMensaje) txtMensaje.disabled = true;
    } else {
      lblEstado.textContent = 'No se pudo registrar: ' + (data.error || 'Error desconocido');
      btnEnviar.disabled = false;
    }
  } catch (err){
    console.error(err);
    lblEstado.textContent = 'Error de red. Intenta de nuevo.';
    btnEnviar.disabled = false;
  }
});



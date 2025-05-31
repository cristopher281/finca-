function abrirModalPerfil() {
  const perfil = JSON.parse(localStorage.getItem('finca_perfil') || '{}');
  document.getElementById('nombrePerfil').value = perfil.nombre || '';
  document.getElementById('correoPerfil').value = perfil.correo || '';
  document.getElementById('fotoPerfilPreview').src = perfil.foto || 'https://ui-avatars.com/api/?name=Usuario';
  document.getElementById('modalPerfil').classList.remove('hidden');
}

function cerrarModalPerfil() {
  document.getElementById('modalPerfil').classList.add('hidden');
}

function cambiarFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('fotoPerfilPreview').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function guardarPerfilAuto() {
  const nombre = document.getElementById('nombrePerfil').value.trim();
  const correo = document.getElementById('correoPerfil').value.trim();
  const foto = document.getElementById('fotoPerfilPreview').src;
  localStorage.setItem('finca_perfil', JSON.stringify({ nombre, correo, foto }));
}

document.getElementById('formPerfil').onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombrePerfil').value.trim();
  const correo = document.getElementById('correoPerfil').value.trim();
  const foto = document.getElementById('fotoPerfilPreview').src;
  if (!nombre || !correo) {
    document.getElementById('mensajePerfil').textContent = "Completa todos los campos.";
    return;
  }
  localStorage.setItem('finca_perfil', JSON.stringify({ nombre, correo, foto }));
  document.getElementById('mensajePerfil').textContent = "Perfil guardado correctamente.";
  setTimeout(() => {
    document.getElementById('mensajePerfil').textContent = "";
    cerrarModalPerfil();
  }, 1200);
};

document.getElementById('nombrePerfil').addEventListener('input', guardarPerfilAuto);
document.getElementById('correoPerfil').addEventListener('input', guardarPerfilAuto);
document.getElementById('fotoPerfil').addEventListener('change', function(e) {
  cambiarFotoPerfil(e);
  setTimeout(guardarPerfilAuto, 200); // Espera a que se cargue la imagen
});
document.getElementById('password').addEventListener('input', function() {
  if (!localStorage.getItem('finca_pass')) {
    localStorage.setItem('finca_pass', this.value);
  }
});

// Cambia el modo de color y guarda la preferencia
function setModoColor(modo) {
  document.body.classList.remove('modo-claro', 'modo-azul', 'modo-oscuro');
  if (modo === 'claro') document.body.classList.add('modo-claro');
  if (modo === 'azul') document.body.classList.add('modo-azul');
  if (modo === 'oscuro') document.body.classList.add('modo-oscuro');
  localStorage.setItem('finca_modo_color', modo);
}

// Aplica el modo guardado al cargar
document.addEventListener('DOMContentLoaded', function() {
  const modo = localStorage.getItem('finca_modo_color') || 'claro';
  setModoColor(modo);
});

// Papelera de inversiones eliminadas
let papeleraInversiones = JSON.parse(localStorage.getItem('finca_papelera_inversiones') || '[]');

// Papelera de trabajadores eliminados
let papeleraTrabajadores = JSON.parse(localStorage.getItem('finca_papelera_trabajadores') || '[]');

// Renderiza la tabla de inversiones monitoreadas editable
function actualizarTablaInversiones() {
  let inversionesDetalladas = [];
  try {
    inversionesDetalladas = JSON.parse(localStorage.getItem('finca_inversiones_detalladas') || '[]');
  } catch (e) { inversionesDetalladas = []; }
  const tbody = document.getElementById('tablaInversiones');
  const filtro = document.getElementById('busquedaInversiones').value.trim().toLowerCase();
  const filtradas = inversionesDetalladas.filter(inv =>
    inv.concepto?.toLowerCase().includes(filtro)
  );
  tbody.innerHTML = filtradas.map((inv, i) =>
    `<tr>
      <td class="border px-2 py-1">
        <input type="number" value="${inv.monto}" min="0" class="w-24 border rounded px-1 py-0.5 text-xs" onchange="editarInversion(${i}, 'monto', this.value)">
      </td>
      <td class="border px-2 py-1">
        <input type="text" value="${inv.concepto || ''}" class="w-40 border rounded px-1 py-0.5 text-xs" onchange="editarInversion(${i}, 'concepto', this.value)">
      </td>
      <td class="border px-2 py-1">
        <input type="date" value="${inv.fecha ? inv.fecha.split('T')[0] : ''}" class="w-32 border rounded px-1 py-0.5 text-xs" onchange="editarInversion(${i}, 'fecha', this.value + (inv.hora ? 'T' + inv.hora : ''))">
      </td>
      <td class="border px-2 py-1">
        <input type="time" value="${inv.hora || (inv.fecha && inv.fecha.includes('T') ? inv.fecha.split('T')[1] : '')}" class="w-24 border rounded px-1 py-0.5 text-xs" onchange="editarInversion(${i}, 'hora', this.value)">
      </td>
      <td class="border px-2 py-1">
        <button onclick="eliminarInversion(${i})" class="text-red-600 hover:text-red-800" title="Eliminar">&#10006;</button>
      </td>
    </tr>`
  ).join('');
  actualizarTablaPapeleraInversiones();
}

// Editar inversión en línea (ahora soporta fecha y hora por separado)
function editarInversion(idx, campo, valor) {
  let inversionesDetalladas = JSON.parse(localStorage.getItem('finca_inversiones_detalladas') || '[]');
  if (campo === 'monto') inversionesDetalladas[idx].monto = parseFloat(valor) || 0;
  else if (campo === 'fecha') inversionesDetalladas[idx].fecha = valor;
  else if (campo === 'hora') inversionesDetalladas[idx].hora = valor;
  else inversionesDetalladas[idx][campo] = valor;
  localStorage.setItem('finca_inversiones_detalladas', JSON.stringify(inversionesDetalladas));
  actualizarTablaInversiones();
}

// Eliminar inversión (mueve a papelera)
function eliminarInversion(idx) {
  let inversionesDetalladas = JSON.parse(localStorage.getItem('finca_inversiones_detalladas') || '[]');
  let papelera = JSON.parse(localStorage.getItem('finca_papelera_inversiones') || '[]');
  const eliminada = inversionesDetalladas.splice(idx, 1)[0];
  papelera.push(eliminada);
  localStorage.setItem('finca_inversiones_detalladas', JSON.stringify(inversionesDetalladas));
  localStorage.setItem('finca_papelera_inversiones', JSON.stringify(papelera));
  actualizarTablaInversiones();
}

// Renderiza la papelera de inversiones eliminadas (muestra fecha y hora por separado)
function actualizarTablaPapeleraInversiones() {
  let papelera = JSON.parse(localStorage.getItem('finca_papelera_inversiones') || '[]');
  const tbody = document.getElementById('tablaPapeleraInversiones');
  if (!tbody) return;
  tbody.innerHTML = papelera.map((inv, i) =>
    `<tr>
      <td class="border px-2 py-1">$${inv.monto}</td>
      <td class="border px-2 py-1">${inv.concepto || ''}</td>
      <td class="border px-2 py-1">${inv.fecha ? inv.fecha.split('T')[0] : ''}</td>
      <td class="border px-2 py-1">${inv.hora || (inv.fecha && inv.fecha.includes('T') ? inv.fecha.split('T')[1] : '')}</td>
      <td class="border px-2 py-1">
        <button onclick="recuperarInversion(${i})" class="text-green-600 hover:text-green-800" title="Recuperar">&#8634;</button>
      </td>
    </tr>`
  ).join('');
}

// Recuperar inversión desde la papelera
function recuperarInversion(idx) {
  let papelera = JSON.parse(localStorage.getItem('finca_papelera_inversiones') || '[]');
  let inversionesDetalladas = JSON.parse(localStorage.getItem('finca_inversiones_detalladas') || '[]');
  const recuperada = papelera.splice(idx, 1)[0];
  inversionesDetalladas.push(recuperada);
  localStorage.setItem('finca_papelera_inversiones', JSON.stringify(papelera));
  localStorage.setItem('finca_inversiones_detalladas', JSON.stringify(inversionesDetalladas));
  actualizarTablaInversiones();
}

document.getElementById('formAgregarInversion').onsubmit = function(e) {
  e.preventDefault();
  const monto = parseFloat(document.getElementById('nuevoMontoInversion').value);
  const concepto = document.getElementById('nuevoConceptoInversion').value.trim();
  const fecha = document.getElementById('nuevaFechaInversion').value;
  const hora = document.getElementById('nuevaHoraInversion').value;
  const mensaje = document.getElementById('mensajeAgregarInversion');
  if (isNaN(monto) || monto <= 0 || !concepto || !fecha || !hora) {
    mensaje.textContent = "Completa todos los campos correctamente.";
    return;
  }
  let inversionesDetalladas = JSON.parse(localStorage.getItem('finca_inversiones_detalladas') || '[]');
  inversionesDetalladas.push({
    monto,
    concepto,
    fecha: fecha + 'T' + hora,
    hora
  });
  localStorage.setItem('finca_inversiones_detalladas', JSON.stringify(inversionesDetalladas));
  mensaje.textContent = "¡Inversión agregada!";
  this.reset();
  actualizarTablaInversiones();
  setTimeout(() => mensaje.textContent = "", 1500);
};

// Calcula el número de semana ISO para una fecha
function getNumeroSemana(fechaStr) {
  if (!fechaStr) return 0;
  const fecha = new Date(fechaStr.split(' ')[0] || fechaStr);
  const firstJan = new Date(fecha.getFullYear(), 0, 1);
  const days = Math.floor((fecha - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function mostrarResumenTrabajadorSemana() {
  const nombre = document.getElementById('busquedaTrabajadorSemana').value.trim().toLowerCase();
  const semana = parseInt(document.getElementById('semanaTrabajador').value);
  if (!nombre || isNaN(semana)) {
    document.getElementById('resumenTrabajadorSemana').textContent = "Completa ambos campos.";
    return;
  }
  const planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');
  // Filtra por nombre y semana
  const pagos = planilla.filter(emp =>
    emp.nombre.toLowerCase() === nombre &&
    emp.fecha && getNumeroSemana(emp.fecha) === semana
  );
  if (pagos.length === 0) {
    document.getElementById('resumenTrabajadorSemana').textContent = "No hay registros para ese trabajador y semana.";
    return;
  }
  const total = pagos.reduce((a, b) => a + (parseFloat(b.sueldo) || 0), 0);
  const dias = new Set(pagos.map(emp => (emp.fecha || '').split(' ')[0])).size;
  let html = `<div>Total ganado por <b>${pagos[0].nombre}</b> en la semana ${semana}: <span class="text-green-700">$${total}</span></div>`;
  html += `<div>Días trabajados: <span class="text-blue-700">${dias}</span></div>`;
  html += `<div class="mt-2"><b>Detalles de cada pago:</b></div>`;
  html += `<ul class="list-disc ml-6 text-sm">`;
  pagos.forEach(emp => {
    html += `<li>
      <b>Fecha:</b> ${emp.fecha || '-'} | 
      <b>Tipo:</b> ${emp.tipo || '-'} | 
      <b>Sueldo:</b> $${emp.sueldo} | 
      <b>Estado:</b> ${emp.estado || 'Sin pagar'}
    </li>`;
  });
  html += `</ul>`;
  document.getElementById('resumenTrabajadorSemana').innerHTML = html;
}

// --- ACTUALIZACIÓN AUTOMÁTICA DEL RESUMEN ---
document.getElementById('busquedaTrabajadorSemana').addEventListener('input', mostrarResumenTrabajadorSemana);
document.getElementById('semanaTrabajador').addEventListener('input', mostrarResumenTrabajadorSemana);

function abrirAgendaSemanal() {
  document.getElementById('modalAgendaSemanal').classList.remove('hidden');
}
function cerrarAgendaSemanal() {
  document.getElementById('modalAgendaSemanal').classList.add('hidden');
}

// Función para mostrar el resumen en el modal
function mostrarResumenTrabajadorSemanaModal() {
  const nombre = document.getElementById('busquedaTrabajadorSemanaModal').value.trim().toLowerCase();
  const semana = parseInt(document.getElementById('semanaTrabajadorModal').value);
  if (!nombre || isNaN(semana)) {
    document.getElementById('resumenTrabajadorSemanaModal').textContent = "Completa ambos campos.";
    return;
  }
  const planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');
  const pagos = planilla.filter(emp =>
    emp.nombre.toLowerCase() === nombre &&
    emp.fecha && getNumeroSemana(emp.fecha) === semana
  );
  if (pagos.length === 0) {
    document.getElementById('resumenTrabajadorSemanaModal').textContent = "No hay registros para ese trabajador y semana.";
    return;
  }
  const total = pagos.reduce((a, b) => a + (parseFloat(b.sueldo) || 0), 0);
  const dias = new Set(pagos.map(emp => (emp.fecha || '').split(' ')[0])).size;
  let html = `<div>Total ganado por <b>${pagos[0].nombre}</b> en la semana ${semana}: <span class="text-green-700">$${total}</span></div>`;
  html += `<div>Días trabajados: <span class="text-blue-700">${dias}</span></div>`;
  html += `<div class="mt-2"><b>Detalles de cada pago:</b></div>`;
  html += `<ul class="list-disc ml-6 text-sm">`;
  pagos.forEach(emp => {
    html += `<li>
      <b>Fecha:</b> ${emp.fecha || '-'} | 
      <b>Tipo:</b> ${emp.tipo || '-'} | 
      <b>Sueldo:</b> $${emp.sueldo} | 
      <b>Estado:</b> ${emp.estado || 'Sin pagar'}
    </li>`;
  });
  html += `</ul>`;
  document.getElementById('resumenTrabajadorSemanaModal').innerHTML = html;
}

// Actualización automática en el modal
document.addEventListener('DOMContentLoaded', function() {
  const nombreInput = document.getElementById('busquedaTrabajadorSemanaModal');
  const semanaInput = document.getElementById('semanaTrabajadorModal');
  if (nombreInput && semanaInput) {
    nombreInput.addEventListener('input', mostrarResumenTrabajadorSemanaModal);
    semanaInput.addEventListener('input', mostrarResumenTrabajadorSemanaModal);
  }
});

function agregarTrabajadorDirecto() {
  // ...código para agregar trabajador...
}

formLogin.addEventListener('submit', function(e) {
  e.preventDefault();
  const pass = document.getElementById('password').value;
  if (!localStorage.getItem('finca_pass')) {
    // Registrar nueva contraseña
    localStorage.setItem('finca_pass', pass);
    mostrarApp();
  } else {
    // Validar contraseña
    if (pass === localStorage.getItem('finca_pass')) {
      mostrarApp();
    } else {
      loginMensaje.textContent = "Contraseña incorrecta.";
    }
  }
});

document.getElementById('formAgregarMultiples').onsubmit = function(e) {
  e.preventDefault();
  let planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');
  const filas = this.querySelectorAll('tbody tr');
  let agregados = 0;
  filas.forEach(tr => {
    // Selecciona los inputs de cada fila de manera robusta
    const nombreInput = tr.querySelector('input[type="text"]');
    const tipoInput = tr.querySelector('select');
    const sueldoInput = tr.querySelector('input[type="number"]');
    if (!nombreInput || !tipoInput || !sueldoInput) return; // Si falta algún campo, salta la fila

    const nombre = nombreInput.value.trim();
    const tipo = tipoInput.value;
    const sueldo = parseFloat(sueldoInput.value) || 0;

    if (nombre && tipo && sueldo > 0) {
      planilla.push({
        nombre,
        tipo,
        sueldo,
        fecha: new Date().toISOString(),
        estado: 'Sin pagar'
      });
      agregados++;
    }
  });
  localStorage.setItem('finca_planilla', JSON.stringify(planilla));
  if (agregados > 0) {
    alert(`Se agregaron ${agregados} trabajadores.`);
    this.reset();
    if (typeof actualizarListas === 'function') actualizarListas();
  } else {
    alert('No se ingresó ningún trabajador válido.');
  }
}

// Función para obtener el resumen de la finca y planilla en texto
function obtenerResumenFincaYPlanilla() {
  const nombreFinca = localStorage.getItem('finca_nombre') || 'Sin nombre';
  const coordenadas = localStorage.getItem('finca_coordenadas') || 'Sin coordenadas';
  const ingresos = JSON.parse(localStorage.getItem('finca_ingresos') || '[]');
  const egresos = JSON.parse(localStorage.getItem('finca_egresos') || '[]');
  const inversiones = JSON.parse(localStorage.getItem('finca_inversiones') || '[]');
  const planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');

  const totalIngresos = ingresos.reduce((a, b) => a + (b.monto || b), 0);
  const totalEgresos = egresos.reduce((a, b) => a + (b.monto || b), 0);
  const totalInversiones = inversiones.reduce((a, b) => a + (b.monto || b), 0);

  let resumen = `Resumen de la Finca:\n`;
  resumen += `Nombre: ${nombreFinca}\n`;
  resumen += `Coordenadas: ${coordenadas}\n`;
  resumen += `Ingresos: $${totalIngresos}\n`;
  resumen += `Egresos: $${totalEgresos}\n`;
  resumen += `Inversiones: $${totalInversiones}\n`;
  resumen += `\nPlanilla de Trabajadores:\n`;

  if (planilla.length === 0) {
    resumen += 'No hay trabajadores registrados.\n';
  } else {
    planilla.forEach((emp, i) => {
      resumen += `${i + 1}. ${emp.nombre} (${emp.tipo}) - $${emp.sueldo} - ${emp.estado || 'Sin pagar'}\n`;
    });
  }
  return resumen;
}

// Compartir por correo con resumen
function compartirPorCorreo(correo, soloPlanilla = false) {
  let cuerpo;
  if (soloPlanilla) {
    cuerpo = encodeURIComponent(obtenerSoloPlanilla());
  } else {
    cuerpo = encodeURIComponent(obtenerResumenFincaYPlanilla());
    // Adjunta la imagen de la gráfica si existe
    const imgData = obtenerImagenGraficaResumen();
    if (imgData) {
      cuerpo += encodeURIComponent('\n\nGráfica de resumen general:\n<img src="' + imgData + '" style="max-width:100%;">');
    }
  }
  const asunto = encodeURIComponent("Resumen de mi finca y planilla");
  window.open(`mailto:${correo}?subject=${asunto}&body=${cuerpo}`);
}

// Compartir por WhatsApp con resumen
function compartirPorWhatsApp(telefono, soloPlanilla = false) {
  let mensaje;
  if (soloPlanilla) {
    mensaje = obtenerSoloPlanilla();
  } else {
    mensaje = obtenerResumenFincaYPlanilla();
    const imgData = obtenerImagenGraficaResumen();
    if (imgData) {
      mensaje += '\n\n[La gráfica no puede enviarse por WhatsApp automáticamente. Descárgala y envíala como imagen.]';
      // Muestra la imagen en un modal para que el usuario la descargue
      mostrarImagenGraficaModal(imgData);
    }
  }
  window.open(`https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// Muestra la imagen en un modal para descargar
function mostrarImagenGraficaModal(imgData) {
  let modal = document.getElementById('modalGraficaImagen');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'modalGraficaImagen';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = 99999;
  modal.innerHTML = `
    <div style="background:#fff;padding:24px;border-radius:16px;max-width:90vw;max-height:90vh;text-align:center;">
      <h3 style="margin-bottom:12px;">Descarga la gráfica y envíala por WhatsApp</h3>
      <img src="${imgData}" style="max-width:80vw;max-height:60vh;border:1px solid #ccc;border-radius:8px;">
      <br>
      <a href="${imgData}" download="grafica-resumen.png" style="display:inline-block;margin:12px 0 0 0;padding:8px 18px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Descargar imagen</a>
      <br>
      <button onclick="document.getElementById('modalGraficaImagen').remove()" style="margin-top:10px;background:#e5e7eb;color:#374151;padding:6px 16px;border:none;border-radius:8px;cursor:pointer;">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Obtiene contactos guardados desde localStorage
function obtenerContactos() {
  return JSON.parse(localStorage.getItem('finca_cuentas') || '[]');
}

// Selector de método de compartir, ahora acepta un parámetro para el tipo de información
function mostrarSelectorMetodoCompartir(tipoInfo = 'resumen') {
  let menu = document.getElementById('menuMetodoCompartir');
  if (menu) menu.remove();
  menu = document.createElement('div');
  menu.id = 'menuMetodoCompartir';
  menu.style.position = 'fixed';
  menu.style.top = '35%';
  menu.style.left = '50%';
  menu.style.transform = 'translate(-50%, -50%)';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #ccc';
  menu.style.borderRadius = '12px';
  menu.style.boxShadow = '0 4px 24px #0002';
  menu.style.padding = '18px 24px';
  menu.style.zIndex = 9999;
  menu.innerHTML = `
    <div style="font-weight:bold;margin-bottom:14px;">¿Cómo quieres compartir?</div>
    <button onclick="document.getElementById('menuMetodoCompartir').remove();mostrarMenuContactos('correo','${tipoInfo}')" style="display:block;width:100%;margin-bottom:10px;background:#2563eb;color:#fff;padding:10px 0;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
      <span style="margin-right:8px;" data-feather="mail"></span>Correo electrónico
    </button>
    <button onclick="document.getElementById('menuMetodoCompartir').remove();mostrarMenuContactos('wsp','${tipoInfo}')" style="display:block;width:100%;background:#059669;color:#fff;padding:10px 0;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
      <span style="margin-right:8px;" data-feather="message-circle"></span>WhatsApp
    </button>
    <button onclick="document.getElementById('menuMetodoCompartir').remove()" style="margin-top:14px;background:#e5e7eb;color:#374151;padding:6px 16px;border:none;border-radius:8px;cursor:pointer;width:100%;">Cancelar</button>
  `;
  document.body.appendChild(menu);
  if (window.feather) feather.replace();
}

// Modifica mostrarMenuContactos para aceptar el tipo de información a compartir
function mostrarMenuContactos(tipo, tipoInfo = 'resumen') {
  const contactos = obtenerContactos();
  let menu = document.getElementById('menuContactosCompartir');
  if (menu) menu.remove();
  menu = document.createElement('div');
  menu.id = 'menuContactosCompartir';
  menu.style.position = 'fixed';
  menu.style.top = '50%';
  menu.style.left = '50%';
  menu.style.transform = 'translate(-50%, -50%)';
  menu.style.background = 'linear-gradient(135deg, #f0f4f8 60%, #dbeafe 100%)';
  menu.style.border = '1.5px solid #60a5fa';
  menu.style.borderRadius = '18px';
  menu.style.boxShadow = '0 8px 32px #0003';
  menu.style.padding = '28px 24px 20px 24px';
  menu.style.zIndex = 9999;
  menu.style.minWidth = '340px';
  menu.style.maxWidth = '95vw';

  // Formulario con dos botones
  let formAgregar = `
    <form id="formAgregarContactoRapido" style="margin-bottom:16px;">
      <input type="text" id="nombreContactoRapido" placeholder="Nombre" ${tipo === 'correo' ? 'required' : ''} style="margin-bottom:6px;width:100%;padding:8px 10px;border-radius:8px;border:1.5px solid #93c5fd;font-size:16px;background:#fff;">
      ${tipo === 'correo'
        ? `<input type="email" id="correoContactoRapido" placeholder="Correo electrónico" required style="margin-bottom:6px;width:100%;padding:8px 10px;border-radius:8px;border:1.5px solid #93c5fd;font-size:16px;background:#fff;">`
        : `<input type="tel" id="telefonoContactoRapido" placeholder="WhatsApp (solo números)" required style="margin-bottom:6px;width:100%;padding:8px 10px;border-radius:8px;border:1.5px solid #93c5fd;font-size:16px;background:#fff;">`
      }
      <div style="display:flex;gap:10px;">
        <button type="button" id="btnSoloCompartir" style="flex:1;background:#059669;color:#fff;padding:9px 0;border:none;border-radius:8px;font-size:16px;font-weight:500;cursor:pointer;box-shadow:0 2px 8px #05966922;">Compartir sin guardar</button>
        <button type="submit" style="flex:1;background:#2563eb;color:#fff;padding:9px 0;border:none;border-radius:8px;font-size:16px;font-weight:500;cursor:pointer;box-shadow:0 2px 8px #2563eb22;">Agregar contacto</button>
      </div>
    </form>
    <hr style="margin:14px 0 10px 0; border:0; border-top:1.5px solid #d1d5db;">
  `;

  // Lista de contactos con botón para borrar
  let listaContactos = contactos
    .filter(c => (tipo === 'correo' ? c.correo : c.telefono))
    .map((c, i) => `
      <li style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <button style="flex:1;display:flex;align-items:center;gap:10px;padding:10px 14px;border:none;background:#f3f4f6;border-radius:10px;cursor:pointer;width:100%;transition:background 0.2s;font-size:16px;"
          onmouseover="this.style.background='#dbeafe';"
          onmouseout="this.style.background='#f3f4f6';"
          onclick="compartirConContacto(${i},'${tipo}','${tipoInfo}')">
          <span style="font-weight:600;color:#1e293b;">${c.nombre}</span>
          ${tipo==='correo' ? `<span style="color:#2563eb;font-weight:500;">${c.correo}</span>` : ''}
          ${tipo==='wsp' && c.telefono ? `<span style="color:#059669;font-weight:500;">${c.telefono}</span>` : ''}
        </button>
        <button title="Eliminar" onclick="event.stopPropagation();eliminarContactoGuardado(${i},'${tipo}','${tipoInfo}')" style="background:#fee2e2;color:#b91c1c;border:none;border-radius:7px;padding:5px 10px;margin-left:2px;cursor:pointer;font-size:17px;">&#10006;</button>
      </li>
    `).join('');

  menu.innerHTML = `
    <div style="font-weight:bold;margin-bottom:16px;font-size:19px;color:#1e293b;letter-spacing:0.5px;">Elige o agrega un contacto para compartir:</div>
    ${formAgregar}
    <ul style="list-style:none;padding:0;margin:0;max-height:240px;overflow:auto;">
      ${listaContactos || '<li class="text-gray-400" style="color:#64748b;font-size:15px;">No hay contactos guardados.</li>'}
    </ul>
    <button onclick="document.getElementById('menuContactosCompartir').remove()" style="margin-top:18px;background:#e5e7eb;color:#374151;padding:8px 0;border:none;border-radius:8px;cursor:pointer;width:100%;font-size:16px;">Cancelar</button>
  `;
  document.body.appendChild(menu);

  // Lógica para agregar contacto y compartir
  const form = document.getElementById('formAgregarContactoRapido');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const nombre = document.getElementById('nombreContactoRapido').value.trim();
      const correo = tipo === 'correo' ? document.getElementById('correoContactoRapido').value.trim() : '';
      const telefono = tipo === 'wsp' ? document.getElementById('telefonoContactoRapido').value.trim() : '';
      if (!nombre || (tipo === 'correo' && !correo) || (tipo === 'wsp' && !telefono)) return;
      let contactos = obtenerContactos();
      contactos.push({ nombre, correo, telefono });
      localStorage.setItem('finca_cuentas', JSON.stringify(contactos));
      // Compartir inmediatamente con el nuevo contacto
      if (tipo === 'correo') compartirPorCorreo(correo, tipoInfo === 'planilla');
      if (tipo === 'wsp') compartirPorWhatsApp(telefono, tipoInfo === 'planilla');
      document.getElementById('menuContactosCompartir').remove();
    };
    // Botón "Compartir sin guardar"
    document.getElementById('btnSoloCompartir').onclick = function() {
      const correo = tipo === 'correo' ? document.getElementById('correoContactoRapido').value.trim() : '';
      const telefono = tipo === 'wsp' ? document.getElementById('telefonoContactoRapido').value.trim() : '';
      if ((tipo === 'correo' && correo) || (tipo === 'wsp' && telefono)) {
        if (tipo === 'correo') compartirPorCorreo(correo, tipoInfo === 'planilla');
        if (tipo === 'wsp') compartirPorWhatsApp(telefono, tipoInfo === 'planilla');
        document.getElementById('menuContactosCompartir').remove();
      }
    };
  }
}

// Nueva función para eliminar contactos guardados y refrescar el menú
function eliminarContactoGuardado(idx, tipo, tipoInfo) {
  let contactos = obtenerContactos();
  contactos.splice(idx, 1);
  localStorage.setItem('finca_cuentas', JSON.stringify(contactos));
  mostrarMenuContactos(tipo, tipoInfo);
}

function obtenerImagenGraficaResumen() {
  const canvas = document.getElementById('graficaResumen');
  if (!canvas) return null;
  return canvas.toDataURL('image/png');
}

// Modifica la función eliminarTrabajador para mover a la papelera
function eliminarTrabajador(nombre, fecha) {
  let planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');
  const idx = planilla.findIndex(emp => emp.nombre === nombre && emp.fecha === fecha);
  if (idx !== -1) {
    // Mueve a la papelera
    papeleraTrabajadores.push(planilla[idx]);
    localStorage.setItem('finca_papelera_trabajadores', JSON.stringify(papeleraTrabajadores));
    // Elimina de la planilla
    planilla.splice(idx, 1);
    localStorage.setItem('finca_planilla', JSON.stringify(planilla));
    renderizarPlanillaCompleta();
    renderizarTablaPapeleraTrabajadores();
  }
}

// Renderiza la papelera
function renderizarTablaPapeleraTrabajadores() {
  const tbody = document.getElementById('tablaPapeleraTrabajadores');
  if (!tbody) return;
  papeleraTrabajadores = JSON.parse(localStorage.getItem('finca_papelera_trabajadores') || '[]');
  tbody.innerHTML = papeleraTrabajadores.length === 0
    ? `<tr><td colspan="5" class="text-center text-gray-400">No hay trabajadores eliminados.</td></tr>`
    : papeleraTrabajadores.map((emp, i) => `
      <tr>
        <td class="border px-2 py-1">${emp.nombre}</td>
        <td class="border px-2 py-1">${emp.tipo}</td>
        <td class="border px-2 py-1">$${emp.sueldo}</td>
        <td class="border px-2 py-1 text-xs text-gray-500">${emp.fecha || ''}</td>
        <td class="border px-2 py-1">
          <button onclick="restaurarTrabajador(${i})" class="text-green-600 hover:text-green-800" title="Recuperar">&#8634;</button>
        </td>
      </tr>
    `).join('');
}

// Restaurar trabajador desde la papelera
function restaurarTrabajador(idx) {
  let planilla = JSON.parse(localStorage.getItem('finca_planilla') || '[]');
  papeleraTrabajadores = JSON.parse(localStorage.getItem('finca_papelera_trabajadores') || '[]');
  if (papeleraTrabajadores[idx]) {
    planilla.push(papeleraTrabajadores[idx]);
    localStorage.setItem('finca_planilla', JSON.stringify(planilla));
    papeleraTrabajadores.splice(idx, 1);
    localStorage.setItem('finca_papelera_trabajadores', JSON.stringify(papeleraTrabajadores));
    renderizarPlanillaCompleta();
    renderizarTablaPapeleraTrabajadores();
  }
}

// Llama a esta función cada vez que abras la ventana de planilla completa
function mostrarVentanaPlanilla() {
  document.getElementById('infoFinca').classList.add('hidden');
  document.getElementById('ventanaPlanilla').classList.remove('hidden');
  renderizarPlanillaCompleta();
  renderizarTablaAgregarMultiples();
  renderizarTablaPapeleraTrabajadores(); // <-- Agrega esto
}
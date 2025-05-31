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
function compartirPorCorreo(correo) {
  const asunto = encodeURIComponent("Resumen de mi finca y planilla");
  const cuerpo = encodeURIComponent(obtenerResumenFincaYPlanilla());
  window.open(`mailto:${correo}?subject=${asunto}&body=${cuerpo}`);
}

// Compartir por WhatsApp con resumen
function compartirPorWhatsApp(telefono) {
  const mensaje = encodeURIComponent(obtenerResumenFincaYPlanilla());
  window.open(`https://wa.me/${telefono.replace(/\D/g, '')}?text=${mensaje}`, '_blank');
}

// Obtiene contactos guardados desde localStorage
function obtenerContactos() {
  return JSON.parse(localStorage.getItem('finca_cuentas') || '[]');
}

// Muestra un menú para elegir contacto y compartir
function mostrarMenuContactos(tipo) {
  const contactos = obtenerContactos();
  if (!contactos.length) {
    alert('No hay contactos guardados. Agrega contactos primero.');
    return;
  }
  // Crea el menú flotante
  let menu = document.getElementById('menuContactosCompartir');
  if (menu) menu.remove();
  menu = document.createElement('div');
  menu.id = 'menuContactosCompartir';
  menu.style.position = 'fixed';
  menu.style.top = '30%';
  menu.style.left = '50%';
  menu.style.transform = 'translate(-50%, -50%)';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #ccc';
  menu.style.borderRadius = '12px';
  menu.style.boxShadow = '0 4px 24px #0002';
  menu.style.padding = '18px 24px';
  menu.style.zIndex = 9999;
  menu.innerHTML = `<div style="font-weight:bold;margin-bottom:10px;">Elige un contacto para compartir:</div>
    <ul style="list-style:none;padding:0;margin:0;max-height:220px;overflow:auto;">
      ${contactos.map((c, i) => `
        <li style="margin-bottom:8px;">
          <button style="display:flex;align-items:center;gap:8px;padding:6px 12px;border:none;background:#f3f4f6;border-radius:8px;cursor:pointer;width:100%;"
            onclick="compartirConContacto(${i},'${tipo}')">
            <span style="font-weight:600;">${c.nombre}</span>
            ${tipo==='correo' ? `<span style="color:#2563eb;">${c.correo}</span>` : ''}
            ${tipo==='wsp' && c.telefono ? `<span style="color:#059669;">${c.telefono}</span>` : ''}
          </button>
        </li>
      `).join('')}
    </ul>
    <button onclick="document.getElementById('menuContactosCompartir').remove()" style="margin-top:14px;background:#e5e7eb;color:#374151;padding:6px 16px;border:none;border-radius:8px;cursor:pointer;">Cancelar</button>
  `;
  document.body.appendChild(menu);
}

// Lógica para compartir según contacto y tipo
window.compartirConContacto = function(idx, tipo) {
  const contactos = obtenerContactos();
  const c = contactos[idx];
  if (tipo === 'correo' && c.correo) compartirPorCorreo(c.correo);
  if (tipo === 'wsp' && c.telefono) compartirPorWhatsApp(c.telefono);
  document.getElementById('menuContactosCompartir').remove();
};
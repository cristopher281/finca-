// Geolocalización mejorada
function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      document.getElementById('coordenadas').value = `${latitude}, ${longitude}`;
    },
    (error) => {
      alert("No se pudo obtener la ubicación: " + error.message);
    }
  );
}

// Guardar en Firestore con validación
document.getElementById('formFinca').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const coordenadas = document.getElementById('coordenadas').value.trim();

  if (!nombre || !coordenadas) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  const finca = {
    nombre,
    coordenadas,
    fecha: new Date().toISOString()
  };

  try {
    await db.collection('fincas').add(finca);
    alert("¡Finca guardada!");
    e.target.reset();
  } catch (error) {
    console.error("Error al guardar la finca:", error);
    alert("Ocurrió un error al guardar la finca.");
  }
});
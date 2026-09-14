document.addEventListener('DOMContentLoaded', () => {
  const contenedorSismos = document.getElementById('lista-sismos');
  if (!contenedorSismos) return;

  async function obtenerSismos() {
    try {
      const respuesta = await fetch(URL_SISMOS);
      if (!respuesta.ok) throw new Error('Error al conectar con el servicio sísmico');

      const datos = await respuesta.json();
      contenedorSismos.innerHTML = '';

      // Mostramos los primeros 5 sismos recibidos
      const sismos = datos.features.slice(0, 5);

      sismos.forEach(sismo => {
        const { place, mag, time } = sismo.properties;
        const fecha = new Date(time).toLocaleString('es-CO');

        const elemento = document.createElement('div');
        elemento.className = 'tarjeta-sismo';
        elemento.innerHTML = `
          <p><strong>Ubicación:</strong> ${place}</p>
          <p><strong>Magnitud:</strong> ⚠️ ${mag}</p>
          <p><small>Fecha: ${fecha}</small></p>
          <hr>
        `;
        contenedorSismos.appendChild(elemento);
      });
    } catch (error) {
      console.error(error);
      contenedorSismos.innerHTML = '<p>Error al obtener la información de sismos en tiempo real.</p>';
    }
  }

  obtenerSismos();
});
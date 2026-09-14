document.addEventListener('DOMContentLoaded', () => {
  const contenedorTabla = document.getElementById('contenedor-csv');
  if (!contenedorTabla) return;

  async function cargarCSV() {
    try {
      const respuesta = await fetch(URL_CSV);
      if (!respuesta.ok) throw new Error('No se pudo cargar el archivo CSV');

      const texto = await respuesta.text();
      const filas = texto.trim().split('\n');

      if (filas.length === 0) return;

      let html = '<table class="tabla-datos"><thead><tr>';
      const encabezados = filas[0].split(',');

      encabezados.forEach(header => {
        html += `<th>${header.replace(/"/g, '')}</th>`;
      });
      html += '</tr></thead><tbody>';

      for (let i = 1; i < filas.length; i++) {
        if (!filas[i]) continue;
        const celdas = filas[i].split(',');
        html += '<tr>';
        celdas.forEach(celda => {
          html += `<td>${celda.replace(/"/g, '')}</td>`;
        });
        html += '</tr>';
      }

      html += '</tbody></table>';
      contenedorTabla.innerHTML = html;
    } catch (error) {
      console.error(error);
      contenedorTabla.innerHTML = '<p>Error al cargar los datos de la tabla CSV.</p>';
    }
  }

  cargarCSV();
});
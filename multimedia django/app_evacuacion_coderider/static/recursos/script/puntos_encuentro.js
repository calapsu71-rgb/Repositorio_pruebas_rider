document.addEventListener('DOMContentLoaded', () => {
    const btnPunto = document.getElementById('btn-punto');
    const infoInstitucion = document.getElementById('info-institucion');
    const listaPuntos = document.getElementById('lista-puntos');
  
    if (!btnPunto) return;
  
    btnPunto.addEventListener('click', async () => {
      if (infoInstitucion) {
        infoInstitucion.innerHTML = '<strong>Cargando puntos de encuentro...</strong>';
      }
  
      if (typeof URL_JSON === 'undefined' || !listaPuntos) return;
  
      try {
        const respuesta = await fetch(URL_JSON);
        if (!respuesta.ok) throw new Error('Error al leer el archivo JSON');
  
        const datos = await respuesta.json();
        listaPuntos.innerHTML = '';
        infoInstitucion.innerHTML = ''; // Limpiar mensaje de carga
  
        // Extraer los puntos del JSON (soporta si es un array directo o un objeto con propiedad 'puntos')
        const puntos = Array.isArray(datos) ? datos : (datos.puntos || []);
  
        if (puntos.length === 0) {
          listaPuntos.innerHTML = '<p>No hay puntos registrados.</p>';
          return;
        }
  
        puntos.forEach(punto => {
          listaPuntos.innerHTML += `
            <div style="background:#f9f9f9; border-left:4px solid #007bff; padding:10px; margin-bottom:10px;">
              <h3 style="margin:0 0 5px 0;">📍 ${punto.nombre || 'Punto Seguro'}</h3>
              <p style="margin:0;">${punto.descripcion || 'Zona de evacuación'}</p>
            </div>
          `;
        });
  
      } catch (error) {
        console.error('Error al cargar puntos:', error);
        listaPuntos.innerHTML = '<p style="color:red;">Error al cargar los puntos de encuentro (Revisa si el JSON existe).</p>';
      }
    });
  });
// Inicializa Notyf para notificaciones
const notyf = new Notyf({
    duration: 6000, // Duración de las notificaciones en milisegundos
    position: {
        x: 'right', // Esquina derecha
        y: 'top'    // Parte superior
    },
    ripple: true, // Animación de onda
    types: [
        {
            type: 'success',
            background: '#28a745', // Verde para éxito
            icon: {
                className: 'fas fa-check-circle',
                tagName: 'i',
                color: 'white'
            }
        },
        {
            type: 'error',
            background: '#dc3545', // Rojo para errores
            icon: {
                className: 'fas fa-times-circle',
                tagName: 'i',
                color: 'white'
            }
        }
    ]
});

// Función para verificar si hay una sesión activa
function checkSession() {
    const lastToken = localStorage.getItem("lastToken");
    if (!lastToken) {
        console.warn("Acceso denegado: usuario no autenticado.");
        
        // Limpiar la pantalla antes de redirigir
        document.body.innerHTML = "";

        // Redirigir a la página de acceso denegado
        window.location.href = "accesoDenegado.html";

        // Detener la ejecución de cualquier otro código
        return;
    }
}

// Cargar comandas desde la API
async function cargarComandas() {
    try {
        const response = await fetch(`${API_URL}ticket/getallQueue`);
        if (!response.ok) throw new Error(`Error al cargar las comandas: ${response.status}`);
        const data = await response.json();
        console.log("Comandas cargadas:", data);

        // Si no hay comandas, mostrar un mensaje
        if (!data || data.length === 0) {
            notyf.error('No hay comandas en la cola.');
            const contenedor = document.getElementById("comandasList");
            contenedor.innerHTML = '<p class="text-center">No hay comandas en la cola actualmente.</p>';
            return;
        }

        actualizarComandas(data);
    } catch (error) {
        console.error("Error al cargar las comandas:", error);
        notyf.error('Error al cargar las comandas.');
        const contenedor = document.getElementById("comandasList");
        contenedor.innerHTML = '<p class="text-center">Error al cargar las comandas. Intenta de nuevo más tarde.</p>';
    }
}

// Actualizar la lista de comandas
function actualizarComandas(comandas) {
    const contenedor = document.getElementById("comandasList");
    contenedor.innerHTML = "";

    comandas.forEach((comanda, index) => {
        const comandaCard = document.createElement("div");
        comandaCard.className = "comanda-card";

        // Determinar el color del semáforo según el estatus
        let statusColor = '';
        switch (comanda.estatus) {
            case 'En proceso':
                statusColor = '#805A3B'; // Cafe
                break;
            case 'Terminado':
                statusColor = '#4CAF50'; // Verde brillante
                break;
            case 'Entregado':
                statusColor = '#2196F3'; // Azul vibrante
                break;
            case 'Cancelado':
                statusColor = '#B0BEC5'; // Gris azulado claro
                break;
            default:
                statusColor = '#805A3B'; 
        }

        // Formatear la fecha manualmente
        const fecha = comanda.fecha ? new Date(comanda.fecha) : null;
        const fechaFormateada = fecha 
            ? `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`
            : 'Fecha no disponible';

        // Manejar el caso en que no haya detalles
        const detallesHTML = comanda.detalles && comanda.detalles.length > 0
            ? comanda.detalles.map((detalle) => `
                <tr>
                    <td>${detalle.producto && detalle.producto.nombre ? detalle.producto.nombre : 'Producto no disponible'}</td>
                    <td>${detalle.cantidad || 0}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2" class="text-center">No hay detalles disponibles</td></tr>';

        comandaCard.innerHTML = `
            <div class="comanda-header" style="border-left: 8px solid ${statusColor};">
                <h3>Folio: ${comanda.idComanda || 'N/A'}</h3>
                <p>Fecha y Hora: ${fechaFormateada}</p>
                <p>Estatus: <span class="status-label" style="background-color: ${statusColor};">${comanda.estatus || 'Desconocido'}</span></p>
                <select class="status-select" data-id="${comanda.idComanda}" onchange="cambiarEstatus(this)">
                    <option value="1" ${comanda.estatus === 'En proceso' ? 'selected' : ''}>En proceso</option>
                    <option value="2" ${comanda.estatus === 'Terminado' ? 'selected' : ''}>Terminado</option>
                    <option value="3" ${comanda.estatus === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="0" ${comanda.estatus === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            <div class="comanda-details">
                <h4 class="details-title">------- DETALLE POR COMANDA -------</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Descripción Producto</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detallesHTML}
                    </tbody>
                </table>
            </div>
        `;
        contenedor.appendChild(comandaCard);
    });
}

// Cambiar el estatus de una comanda
async function cambiarEstatus(selectElement) {
    const idComanda = selectElement.getAttribute('data-id');
    const nuevoEstatus = parseInt(selectElement.value); // Convertimos a entero

    try {
        const response = await fetch(`${API_URL}ticket/updateEstatus?idComanda=${idComanda}&estatus=${nuevoEstatus}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
            "Authorization": localStorage.getItem("lastToken") }
             
        });

        if (!response.ok) throw new Error('Error al actualizar el estatus');
        const data = await response.json();
        notyf.success('Estatus actualizado correctamente');
        cargarComandas(); // Recargar la lista para reflejar los cambios
    } catch (error) {
        notyf.error('Error al actualizar el estatus');
    }
}

// Cargar las comandas al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    checkSession(); // Verificar sesión al cargar el documento
    cargarComandas();
    setInterval(cargarComandas, 5000); // Actualizar cada 10 segundos
});
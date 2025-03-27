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

// Cargar pedidos desde la API
async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}ticket/getallQueue`);
        if (!response.ok) throw new Error(`Error al cargar los pedidos: ${response.status}`);
        const data = await response.json();
        console.log("Pedidos cargados:", data);

        // Si no hay pedidos, mostrar un mensaje
        if (!data || data.length === 0) {
            notyf.error('No hay pedidos en la cola.');
            const contenedor = document.getElementById("orderQueue");
            contenedor.innerHTML = '<p class="text-center">No hay pedidos en la cola actualmente.</p>';
            return;
        }

        actualizarColaPedidos(data);
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        notyf.error('Error al cargar la cola de pedidos.');
        const contenedor = document.getElementById("orderQueue");
        contenedor.innerHTML = '<p class="text-center">Error al cargar los pedidos. Intenta de nuevo más tarde.</p>';
    }
}

// Actualizar la cola de pedidos
function actualizarColaPedidos(pedidos) {
    const contenedor = document.getElementById("orderQueue");
    contenedor.innerHTML = "";

    pedidos.forEach((pedido, index) => {
        const orderCard = document.createElement("div");
        orderCard.className = `order-card ${index === 0 ? 'active-order' : 'background-order'}`; // Resaltar el primer pedido

        // Determinar el color del semáforo según el estatus
        let statusColor = '';
        switch (pedido.estatus) {
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
        const fecha = pedido.fecha ? new Date(pedido.fecha) : null;
        const fechaFormateada = fecha 
            ? `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`
            : 'Fecha no disponible';

        orderCard.innerHTML = `
            <div class="order-header" style="border-left: 8px solid ${statusColor};">
                <h3>Folio: ${pedido.idComanda || 'N/A'}</h3>
                <p>Fecha y Hora: ${fechaFormateada}</p>
                <p>Estatus: <span class="status-label" style="background-color: ${statusColor};">${pedido.estatus || 'Desconocido'}</span></p>
            </div>
        `;
        contenedor.appendChild(orderCard);
    });
}

// Cargar los pedidos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();
    setInterval(cargarPedidos, 5000); // Actualizar cada 10 segundos
});
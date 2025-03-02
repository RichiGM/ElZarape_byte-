/* global fetch */

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

// Función para cerrar el carrito (limpiar ítems)
function closeCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = ''; // Limpia los ítems del carrito
    updateCartTotal(); // Actualiza el total a 0
}


// Función para incrementar la cantidad de un ítem en el carrito
function increaseQuantity(button) {
    const input = button.previousElementSibling;
    input.value = parseInt(input.value) + 1;
    updateCartTotal();
}

// Función para decrementar la cantidad de un ítem en el carrito
function decreaseQuantity(button) {
    const input = button.nextElementSibling; // Obtener el input de cantidad
    const currentQuantity = parseInt(input.value);

    if (currentQuantity > 1) {
        input.value = currentQuantity - 1; // Decrementa la cantidad
    } else {
        // Si la cantidad es 1 y se intenta decrementar, eliminar el producto
        const row = button.closest('tr'); // Encuentra la fila más cercana
        row.remove(); // Elimina la fila del carrito
    }
    updateCartTotal(); // Actualiza el total después de eliminar
}

// Función para actualizar el total del carrito
function updateCartTotal() {
    let subtotal = 0;
    const items = document.querySelectorAll('#cartItems tr');
    items.forEach(item => {
        const price = parseFloat(item.cells[2].textContent.replace('$', ''));
        const quantity = parseInt(item.querySelector('.cantidad-input').value);
        subtotal += price * quantity;
    });
    const iva = subtotal * 0.13; // 13% IVA (ajusta según tu país o necesidad)
    const total = subtotal + iva;

    document.querySelector('.text-end p:nth-child(1)').textContent = `SubTotal: $${subtotal.toFixed(2)}`;
    document.querySelector('.text-end p:nth-child(2)').textContent = `IVA: $${iva.toFixed(2)}`;
    document.querySelector('.text-end p:nth-child(3)').textContent = `Total: $${total.toFixed(2)}`;
}

// Función para cargar alimentos desde la API
async function cargarAlimentos() {
    const ruta = 'http://localhost:8080/ElZarape2/api/alimento/getallCliente';

    try {
        const response = await fetch(ruta);
        if (!response.ok) {
            throw new Error(`Error al cargar los alimentos: ${response.status}`);
        }

        const data = await response.json();
        console.log("Alimentos cargados:", data); // Log de la respuesta
        actualizarMenuAlimentos(data);
    } catch (error) {
        console.error("Error al cargar los alimentos:", error);
    }
}

// Función para cargar bebidas desde la API
async function cargarBebidas() {
    const ruta = 'http://localhost:8080/ElZarape2/api/bebida/getallCliente';

    try {
        const response = await fetch(ruta);
        if (!response.ok) {
            throw new Error(`Error al cargar las bebidas: ${response.status}`);
        }

        const data = await response.json();
        console.log("Bebidas cargadas:", data); // Log de la respuesta
        actualizarMenuBebidas(data);
    } catch (error) {
        console.error("Error al cargar las bebidas:", error);
    }
}

// Función para cargar sucursales desde la API
async function cargarSucursales() {
    const ruta = 'http://localhost:8080/ElZarape2/api/sucursal/getallCliente';

    try {
        const response = await fetch(ruta);
        if (!response.ok) {
            throw new Error(`Error al cargar las sucursales: ${response.status}`);
        }

        const data = await response.json();
        console.log("Sucursales cargadas:", data); // Log de la respuesta
        actualizarSucursalDropdown(data);
    } catch (error) {
        console.error("Error al cargar las sucursales:", error);
    }
}

// Función para actualizar el menú de alimentos
function actualizarMenuAlimentos(alimentos) {
    const contenedor = document.getElementById("alimentos");
    contenedor.innerHTML = ""; // Limpiar el contenedor

    alimentos.forEach(alimento => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.border = "none";
        card.style.background = "none";

        card.innerHTML = `
            <img src="${alimento.producto.foto}" alt="${alimento.producto.nombre}" class="card-img-top">
            <div class="card-body text-center">
                <h5 class="card-title">${alimento.producto.nombre}</h5>
                <p class="card-text">$${alimento.producto.precio}</p>
            </div>
        `;
        
        // Agregar evento para agregar al carrito
        card.addEventListener('click', () => {
            addToCart(alimento.producto.nombre, alimento.producto.precio, alimento.producto.idProducto);
        });

        contenedor.appendChild(card);
    });
}

// Función para actualizar el menú de bebidas
function actualizarMenuBebidas(bebidas) {
    const contenedor = document.getElementById("bebidas");
    contenedor.innerHTML = ""; // Limpiar el contenedor

    bebidas.forEach(bebida => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.border = "none";
        card.style.background = "none";

        card.innerHTML = `
            <img src="${bebida .producto.foto}" alt="${bebida.producto.nombre}" class="card-img-top">
            <div class="card-body text-center">
                <h5 class="card-title">${bebida.producto.nombre}</h5>
                <p class="card-text">$${bebida.producto.precio}</p>
            </div>
        `;
        
        // Agregar evento para agregar al carrito
        card.addEventListener('click', () => {
            addToCart(bebida.producto.nombre, bebida.producto.precio, bebida.producto.idProducto);
        });

        contenedor.appendChild(card);
    });
}

// Función para actualizar el dropdown de sucursales
function actualizarSucursalDropdown(sucursales) {
    const dropdown = document.getElementById('sucursalDropdown');

    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal.idSucursal; // Usar el ID de la sucursal
        option.textContent = `${sucursal.nombre} - ${sucursal.calle} ${sucursal.numCalle}, ${sucursal.colonia}, ${sucursal.ciudad.nombre}`; // Formato del texto
        dropdown.appendChild(option);
    });
}

// Agregar el listener para cambiar el texto del encabezado
document.getElementById('sucursalDropdown').addEventListener('change', function() {
    const selectedSucursalId = this.value; // Obtener el ID de la sucursal seleccionada
    const selectedSucursal = Array.from(this.options).find(option => option.value === selectedSucursalId); // Encontrar la opción seleccionada

    // Cambiar el texto del encabezado
    const header = document.querySelector('.cart-content h3');
    if (selectedSucursal) {
        header.innerHTML = `Sucursal: ${selectedSucursal.textContent} <span class="location-icon">📍</span>`;
    }
});
// Función para agregar un producto al carrito
function addToCart(name, price, idProducto) {
    const cartItems = document.getElementById('cartItems');
    const existingItem = Array.from(cartItems.getElementsByTagName('tr')).find(row => {
        // Verifica si el nombre y el ID del producto coinciden
        return row.cells[0].textContent === name && row.getAttribute('data-id') === idProducto.toString();
    });

    if (existingItem) {
        const quantityInput = existingItem.querySelector('.cantidad-input');
        quantityInput.value = parseInt(quantityInput.value) + 1; // Incrementa la cantidad
    } else {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', idProducto); // Agregar el ID del producto
        newRow.innerHTML = `
            <td>${name}</td>
            <td>
                <div class="input-group" style="max-width: 120px;">
                    <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity(this)">-</button>
                    <input type="number" class="form-control cantidad-input" value="1" min="1">
                    <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity(this)">+</button>
                </div>
            </td>
            <td>$${price.toFixed(2)}</td>
        `;
        cartItems.appendChild(newRow);
    }
    updateCartTotal();
}


// Función para agregar detalles al ticket
async function agregarDetalleTicket(ticketId) {
    const items = document.querySelectorAll('#cartItems tr');
    for (const item of items) {
        const cantidad = parseInt(item.querySelector('.cantidad-input').value);
        const precio = parseFloat(item.cells[2].textContent.replace('$', ''));
        const idProducto = item.getAttribute('data-id'); // Obtener el ID del producto

        const detalle = {
            idTicket: ticketId,
            cantidad: cantidad,
            precio: precio,
            idCombo: null, // Si no usas combos, puedes dejarlo como null
            idProducto: idProducto
        };

        const response = await fetch('http://localhost:8080/ElZarape2/api/ticket/detalle/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detalle)
        });

        if (!response.ok) {
            throw new Error('Error al agregar el detalle del ticket');
        }
        console.log("Detalle agregado:", detalle); // Log de la respuesta
    }
}

let currentTicketId = null; // Variable para almacenar el ID del ticket actual

// Función para manejar el proceso de pago (generar ticket)
async function procesarPago() {
    // Validar que el carrito no esté vacío
        

    const cartItems = document.getElementById('cartItems');
    if (cartItems.children.length === 0) {
        notyf.error('El carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    // Validar que se haya seleccionado una sucursal
    const idSucursal = document.getElementById('sucursalDropdown').value;
    if (!idSucursal) {
        notyf.error('Por favor, selecciona una sucursal.');
        return;
    }

    try {
        document.getElementById('paymentModal').style.display = 'block';
        currentTicketId = await crearTicket(idSucursal); // Crear el ticket y almacenar el ID
        await agregarDetalleTicket(currentTicketId); // Agregar detalles al ticket
        notyf.success('Ticket creado correctamente. Ahora completa el pago.');
    } catch (error) {
        notyf.error(error.message);
    }
}

// Función para crear un ticket
async function crearTicket(idSucursal) {
    const ticketData = {
        idSucursal: idSucursal // Enviar el ID de la sucursal
    };

    const response = await fetch('http://localhost:8080/ElZarape2/api/ticket/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData) // Enviar el objeto como cuerpo de la solicitud
    });

    if (!response.ok) {
        throw new Error('Error al crear el ticket');
    }

    const data = await response.json();
    console.log("Ticket creado:", data); // Log de la respuesta
    return data.ticketId; // Retorna el ID del ticket creado
}

// Función para manejar el formulario de pago
async function completarPago(event) {
    event.preventDefault(); // Evitar el envío del formulario

    // Validar el formulario de pago
    const titular = document.getElementById('titular').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!titular || !cardNumber || !expiryDate || !cvv) {
        notyf.error('Por favor, completa todos los campos del formulario de pago.');
        return;
    }

    // Validar la tarjeta (puedes implementar una validación más robusta)
    if (!validarTarjeta(cardNumber)) {
        notyf.error('Número de tarjeta inválido.');
        return;
    }

    try {
        // Llamar a la API para marcar el ticket como pagado
        const response = await fetch('http://localhost:8080/ElZarape2/api/ticket/pagado?idTicket=' + currentTicketId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al procesar el pago');
        }

        const data = await response.json();
        console.log("Pago procesado:", data); // Log de la respuesta
        notyf.success('Pago procesado correctamente');
        closeCart(); // Cierra el carrito después de procesar el pago
        document.getElementById('paymentModal').style.display = 'none';
    } catch (error) {
        notyf.error(error.message);
    }
}

// Función para validar el número de tarjeta (ejemplo simple)
function validarTarjeta(cardNumber) {
    // Aquí puedes implementar una validación más robusta
    return /^\d{16}$/.test(cardNumber); // Verifica que sea un número de 16 dígitos
}

// Asigna el evento al botón de pagar
document.querySelector('.btn.btn-danger').addEventListener('click', procesarPago);

// Asigna el evento al botón de completar pago
document.querySelector('#paymentForm .btn.btn-danger').addEventListener('click', completarPago);

// Manejar el cierre del modal de pago
document.querySelector('.close-btn').addEventListener('click', async () => {
    if (currentTicketId) {
        await fetch('http://localhost:8080/ElZarape2/api/ticket/estatus?idTicket=' + currentTicketId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        currentTicketId = null; // Limpiar el ID del ticket al cerrar el modal
    }
    document.getElementById('paymentModal').style.display = 'none';
});


// Llama a las funciones para cargar los datos al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarAlimentos();
    cargarBebidas();
    cargarSucursales(); // Cargar sucursales al iniciar
});
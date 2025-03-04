/* global fetch */

// Inicializa Notyf para notificaciones
const notyf = new Notyf({
    duration: 6000,
    position: { x: 'right', y: 'top' },
    ripple: true,
    types: [
        { type: 'success', background: '#28a745', icon: { className: 'fas fa-check-circle', tagName: 'i', color: 'white' } },
        { type: 'error', background: '#dc3545', icon: { className: 'fas fa-times-circle', tagName: 'i', color: 'white' } }
    ]
});

// Función para cerrar el carrito
function closeCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    updateCartTotal();
}

// Funciones para manejar la cantidad en el carrito
function increaseQuantity(button) {
    const input = button.previousElementSibling;
    input.value = parseInt(input.value) + 1;
    updateCartTotal();
}

function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    const currentQuantity = parseInt(input.value);
    if (currentQuantity > 1) {
        input.value = currentQuantity - 1;
    } else {
        button.closest('tr').remove();
    }
    updateCartTotal();
}

// Actualizar el total del carrito
function updateCartTotal() {
    let subtotal = 0;
    const items = document.querySelectorAll('#cartItems tr');
    items.forEach(item => {
        const price = parseFloat(item.cells[2].textContent.replace('$', ''));
        const quantity = parseInt(item.querySelector('.cantidad-input').value);
        subtotal += price * quantity;
    });
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    document.querySelector('.text-end p:nth-child(1)').textContent = `SubTotal: $${subtotal.toFixed(2)}`;
    document.querySelector('.text-end p:nth-child(2)').textContent = `IVA: $${iva.toFixed(2)}`;
    document.querySelector('.text-end p:nth-child(3)').textContent = `Total: $${total.toFixed(2)}`;
}

// Cargar datos desde la API
async function cargarAlimentos() {
    try {
        const response = await fetch(`${API_URL}alimento/getallCliente`);
        if (!response.ok) throw new Error(`Error al cargar los alimentos: ${response.status}`);
        const data = await response.json();
        console.log("Alimentos cargados:", data);
        actualizarMenuAlimentos(data);
    } catch (error) {
        console.error("Error al cargar los alimentos:", error);
    }
}

async function cargarBebidas() {
    try {
        const response = await fetch(`${API_URL}bebida/getallCliente`);
        if (!response.ok) throw new Error(`Error al cargar las bebidas: ${response.status}`);
        const data = await response.json();
        console.log("Bebidas cargadas:", data);
        actualizarMenuBebidas(data);
    } catch (error) {
        console.error("Error al cargar las bebidas:", error);
    }
}

async function cargarSucursales() {
    try {
        const response = await fetch(`${API_URL}sucursal/getallCliente`);
        if (!response.ok) throw new Error(`Error al cargar las sucursales: ${response.status}`);
        const data = await response.json();
        console.log("Sucursales cargadas:", data);
        actualizarSucursalDropdown(data);
    } catch (error) {
        console.error("Error al cargar las sucursales:", error);
    }
}

// Actualizar menús y dropdown
function actualizarMenuAlimentos(alimentos) {
    const contenedor = document.getElementById("alimentos");
    contenedor.innerHTML = "";
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
        card.addEventListener('click', () => addToCart(alimento.producto.nombre, alimento.producto.precio, alimento.producto.idProducto));
        contenedor.appendChild(card);
    });
}

function actualizarMenuBebidas(bebidas) {
    const contenedor = document.getElementById("bebidas");
    contenedor.innerHTML = "";
    bebidas.forEach(bebida => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.border = "none";
        card.style.background = "none";
        card.innerHTML = `
            <img src="${bebida.producto.foto}" alt="${bebida.producto.nombre}" class="card-img-top">
            <div class="card-body text-center">
                <h5 class="card-title">${bebida.producto.nombre}</h5>
                <p class="card-text">$${bebida.producto.precio}</p>
            </div>
        `;
        card.addEventListener('click', () => addToCart(bebida.producto.nombre, bebida.producto.precio, bebida.producto.idProducto));
        contenedor.appendChild(card);
    });
}

function actualizarSucursalDropdown(sucursales) {
    const dropdown = document.getElementById('sucursalDropdown');
    dropdown.innerHTML = "";
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal.idSucursal;
        option.textContent = `${sucursal.nombre} - ${sucursal.calle} ${sucursal.numCalle}, ${sucursal.colonia}, ${sucursal.ciudad.nombre}`;
        dropdown.appendChild(option);
    });
}

// Listener para el dropdown de sucursales
document.getElementById('sucursalDropdown').addEventListener('change', function() {
    const selectedSucursalId = this.value;
    const selectedSucursal = Array.from(this.options).find(option => option.value === selectedSucursalId);
    const header = document.querySelector('.cart-content h3');
    if (selectedSucursal) {
        header.innerHTML = `Sucursal: ${selectedSucursal.textContent} <span class="location-icon">📍</span>`;
    }
});

// Agregar al carrito
function addToCart(name, price, idProducto) {
    const cartItems = document.getElementById('cartItems');
    const existingItem = Array.from(cartItems.getElementsByTagName('tr')).find(row => 
        row.cells[0].textContent === name && row.getAttribute('data-id') === idProducto.toString()
    );

    if (existingItem) {
        const quantityInput = existingItem.querySelector('.cantidad-input');
        quantityInput.value = parseInt(quantityInput.value) + 1;
    } else {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', idProducto);
        newRow.innerHTML = `
            <td>${name}</td>
            <td><div class="input-group" style="max-width: 120px;">
                <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity(this)">-</button>
                <input type="number" class="form-control cantidad-input" value="1" min="1">
                <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity(this)">+</button>
            </div></td>
            <td>$${price.toFixed(2)}</td>
        `;
        cartItems.appendChild(newRow);
    }
    updateCartTotal();
}

// Agregar detalles al ticket
async function agregarDetalleTicket(ticketId) {
    const items = document.querySelectorAll('#cartItems tr');
    for (const item of items) {
        const cantidad = parseInt(item.querySelector('.cantidad-input').value);
        const precio = parseFloat(item.cells[2].textContent.replace('$', ''));
        const idProducto = item.getAttribute('data-id');

        const detalle = { idTicket: ticketId, cantidad, precio, idCombo: null, idProducto };
        const response = await fetch(`${API_URL}ticket/detalle/insert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detalle)
        });

        if (!response.ok) throw new Error('Error al agregar el detalle del ticket');
        console.log("Detalle agregado:", detalle);
    }
}

let currentTicketId = null;

// Procesar el pago
async function procesarPago() {
    const cartItems = document.getElementById('cartItems');
    if (cartItems.children.length === 0) {
        notyf.error('El carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    const idSucursal = document.getElementById('sucursalDropdown').value;
    if (!idSucursal) {
        notyf.error('Por favor, selecciona una sucursal.');
        return;
    }

    try {
        document.getElementById('paymentModal').style.display = 'block';
        currentTicketId = await crearTicket(idSucursal);
        await agregarDetalleTicket(currentTicketId);
        notyf.success('Ticket creado correctamente. Ahora completa el pago.');
    } catch (error) {
        notyf.error(error.message);
    }
}

// Crear ticket
async function crearTicket(idSucursal) {
    const ticketData = { idSucursal };
    const response = await fetch(`${API_URL}ticket/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
    });

    if (!response.ok) throw new Error('Error al crear el ticket');
    const data = await response.json();
    console.log("Ticket creado:", data);
    return data.ticketId;
}

// Método consolidado de validaciones
function validarFormularioPago(titular, cardNumber, expiryDate, cvv) {
    if (!titular || !cardNumber || !expiryDate || !cvv) {
        notyf.error('Por favor, completa todos los campos del formulario de pago.');
        return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(titular)) {
        notyf.error('El titular solo debe contener letras.');
        return false;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
        notyf.error('El número de tarjeta debe contener exactamente 16 dígitos numéricos.');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        notyf.error('La fecha de vencimiento debe tener el formato MM/YY.');
        return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
        notyf.error('El CVV debe ser exactamente 3 dígitos numéricos.');
        return false;
    }

    return true;
}

// Validaciones en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    cargarAlimentos();
    cargarBebidas();
    cargarSucursales();

    const titularInput = document.getElementById('titular');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');

    titularInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });

    cardNumberInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 16);
    });

    expiryDateInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '').slice(0, 4);
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        this.value = value.slice(0, 5);
    });

    cvvInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });
});

// Nueva función para limpiar el formulario
function limpiarFormularioPago() {
    document.getElementById('titular').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiryDate').value = '';
    document.getElementById('cvv').value = '';
}

// Completar pago
async function completarPago(event) {
    event.preventDefault();

    const titular = document.getElementById('titular').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!validarFormularioPago(titular, cardNumber, expiryDate, cvv)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}ticket/pagado?idTicket=${currentTicketId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Error al procesar el pago');
        const data = await response.json();
        console.log("Pago procesado:", data);
        notyf.success('Pago procesado correctamente');
        closeCart();
        limpiarFormularioPago(); // Limpiar formulario al completar el pago
        document.getElementById('paymentModal').style.display = 'none';
    } catch (error) {
        notyf.error(error.message);
    }
}

// Listeners para botones
document.querySelector('.btn.btn-danger').addEventListener('click', procesarPago);
document.querySelector('#paymentForm .btn.btn-danger').addEventListener('click', completarPago);
document.querySelector('.close-btn').addEventListener('click', async () => {
    if (currentTicketId) {
        await fetch(`${API_URL}ticket/estatus?idTicket=${currentTicketId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        currentTicketId = null;
    }
    document.getElementById('paymentModal').style.display = 'none';
    limpiarFormularioPago(); // Limpiar formulario al cerrar el modal
});
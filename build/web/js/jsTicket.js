// Función para cerrar el carrito (limpiar ítems)
function closeCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = ''; // Limpia los ítems del carrito
    updateCartTotal(); // Actualiza el total a 0
}

// Función para abrir el modal de pago
function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'block';
}

// Función para cerrar el modal de pago
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Función para incrementar la cantidad de un ítem en el carrito
function increaseQuantity(button) {
    const input = button.previousElementSibling;
    input.value = parseInt(input.value) + 1;
    updateCartTotal();
}

// Función para decrementar la cantidad de un ítem en el carrito
function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateCartTotal();
    }
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

// Asegúrate de que el carrito se actualice dinámicamente cuando se seleccionen productos
document.addEventListener('DOMContentLoaded', () => {
    // Lógica para agregar productos al carrito desde los elementos del menú (ajustada para API)
    fetch('https://api.example.com/productos') // Reemplaza con tu endpoint real
        .then(response => response.json())
        .then(data => {
            const menuItems = document.querySelectorAll('.menu-items .card');
            menuItems.forEach(item => {
                item.addEventListener('click', () => {
                    const name = item.querySelector('.card-title').textContent;
                    const price = parseFloat(item.querySelector('.card-text').textContent.replace('$', ''));
                    addToCart(name, price);
                });
            });
        })
        .catch(error => console.error('Error fetching products:', error));

    // Lógica para cargar sucursales desde API
    fetch('https://api.example.com/sucursales') // Reemplaza con tu endpoint real
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('sucursalDropdown');
            data.forEach(sucursal => {
                const option = document.createElement('option');
                option.value = sucursal.id;
                option.textContent = sucursal.nombre;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching branches:', error));
});

// Función para agregar un producto al carrito
function addToCart(name, price) {
    const cartItems = document.getElementById('cartItems');
    const existingItem = Array.from(cartItems.getElementsByTagName('tr')).find(row => row.cells[0].textContent === name);

    if (existingItem) {
        const quantityInput = existingItem.querySelector('.cantidad-input');
        quantityInput.value = parseInt(quantityInput.value) + 1;
    } else {
        const newRow = document.createElement('tr');
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
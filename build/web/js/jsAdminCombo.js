/* global fetch */
const btnModificar = document.getElementById("btnModificar");
const btnEliminar = document.getElementById("btnEliminar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnAgregar = document.getElementById("btnAgregar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");

btnModificar.style.display = "none";
btnEliminar.style.display = "none";
btnCambiarEstatus.style.display = "none";

let obj = [];
let indexComboSeleccionado;
let fotoBase64 = "";
let alimentosSeleccionados = [];
let bebidasSeleccionadas = [];

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

// Cargar alimentos y bebidas en los checkboxes
fetch('../json/jsonAlimento.json')
    .then(response => response.json())
    .then(alimentos => {
        let alimentosCheckboxes = document.getElementById("alimentosCheckboxes");
        alimentos.forEach(alimento => {
            let row = document.createElement("tr");
            let checkboxCell = document.createElement("td");
            let cantidadCell = document.createElement("td");
            
            let checkbox = document.createElement("input");
            checkbox.className = "form-check-input";
            checkbox.type = "checkbox";
            checkbox.value = alimento.nombre;
            checkbox.id = `alimento-${alimento.nombre}`;
            checkbox.dataset.nombre = alimento.nombre;

            let label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = `alimento-${alimento.nombre}`;
            label.innerText = alimento.nombre;

            let inputCantidad = document.createElement("input");
            inputCantidad.type = "number";
            inputCantidad.min = "0";
            inputCantidad.value = "0";
            inputCantidad.className = "form-control cantidad-input";
            inputCantidad.dataset.nombre = alimento.nombre;

            inputCantidad.addEventListener('input', function() {
                checkbox.checked = this.value > 0;
            });

            checkboxCell.appendChild(checkbox);
            checkboxCell.appendChild(label);
            cantidadCell.appendChild(inputCantidad);
            row.appendChild(checkboxCell);
            row.appendChild(cantidadCell);
            alimentosCheckboxes.appendChild(row);
        });
    });

fetch('../json/jsonBebida.json')
    .then(response => response.json())
    .then(bebidas => {
        let bebidasCheckboxes = document.getElementById("bebidasCheckboxes");
        bebidas.forEach(bebida => {
            let row = document.createElement("tr");
            let checkboxCell = document.createElement("td");
            let cantidadCell = document.createElement("td");

            let checkbox = document.createElement("input");
            checkbox.className = "form-check-input";
            checkbox.type = "checkbox";
            checkbox.value = bebida.nombre;
            checkbox.id = `bebida-${bebida.nombre}`;
            checkbox.dataset.nombre = bebida.nombre;

            let label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = `bebida-${bebida.nombre}`;
            label.innerText = bebida.nombre;

            let inputCantidad = document.createElement("input");
            inputCantidad.type = "number";
            inputCantidad.min = "0";
            inputCantidad.value = "0";
            inputCantidad.className = "form-control cantidad-input";
            inputCantidad.dataset.nombre = bebida.nombre;

            inputCantidad.addEventListener('input', function() {
                checkbox.checked = this.value > 0;
            });

            checkboxCell.appendChild(checkbox);
            checkboxCell.appendChild(label);
            cantidadCell.appendChild(inputCantidad);
            row.appendChild(checkboxCell);
            row.appendChild(cantidadCell);
            bebidasCheckboxes.appendChild(row);
        });
    });

function generarDescripcion() {
    let descripcion = "";
    let items = [];

    if (alimentosSeleccionados.length > 0) {
        items = items.concat(alimentosSeleccionados.map(item => `${item.cantidad} ${item.nombre}`));
    }
    if (bebidasSeleccionadas.length > 0) {
        items = items.concat(bebidasSeleccionadas.map(item => `${item.cantidad} ${item.nombre}`));
    }

    if (items.length > 0) {
        descripcion = items.slice(0, -1).join(", ") + (items.length > 1 ? " y " : "") + items.slice(-1);
    }

    document.getElementById("txtDescripcion").value = descripcion;
}

// Guardar alimentos seleccionados
function guardarAlimentosSeleccionados() {
    const checkboxes = document.querySelectorAll("#alimentosCheckboxes .form-check-input:checked");
    alimentosSeleccionados = Array.from(checkboxes).map(checkbox => {
        const cantidad = document.querySelector(`#alimentosCheckboxes .cantidad-input[data-nombre="${checkbox.dataset.nombre}"]`).value;
        return { nombre: checkbox.value, cantidad: parseInt(cantidad, 10) };
    }).filter(item => item.cantidad > 0);
    actualizarSeleccionados('selectedAlimentos', alimentosSeleccionados);
    generarDescripcion();
}

// Guardar bebidas seleccionadas
function guardarBebidasSeleccionadas() {
    const checkboxes = document.querySelectorAll("#bebidasCheckboxes .form-check-input:checked");
    bebidasSeleccionadas = Array.from(checkboxes).map(checkbox => {
        const cantidad = document.querySelector(`#bebidasCheckboxes .cantidad-input[data-nombre="${checkbox.dataset.nombre}"]`).value;
        return { nombre: checkbox.value, cantidad: parseInt(cantidad, 10) };
    }).filter(item => item.cantidad > 0);
    actualizarSeleccionados('selectedBebidas', bebidasSeleccionadas);
    generarDescripcion();
}

// Actualiza la visualización de los elementos seleccionados
function actualizarSeleccionados(id, seleccionados) {
    const container = document.getElementById(id);
    container.innerHTML = seleccionados.map(item => `${item.nombre} (${item.cantidad})`).join(', ');
}

// Convierte una imagen a base64
function convertToBase64(event) {
    const file = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    
    if (!allowedTypes.includes(file.type)) {
        alert("Formato de archivo no permitido. Por favor, sube una imagen en formato JPEG, JPG, o PNG.");
        document.getElementById("txtFotoRuta").value = "";
        return;
    }
    
    const reader = new FileReader();
    reader.onloadend = function () {
        fotoBase64 = reader.result;
        document.getElementById("txtFoto").src = fotoBase64;
    };
    reader.readAsDataURL(file);
}

// Selecciona un combo y llena el formulario
function selectCombo(index) {
    document.getElementById("txtNombre").value = obj[index].nombre;
    document.getElementById("txtDescripcion").value = obj[index].descripcion;
    document.getElementById("txtPrecio").value = obj[index].precio;
    document.getElementById("txtFoto").src = obj[index].foto;
    document.getElementById("txtFotoRuta").value = "";
    indexComboSeleccionado = index;

    btnModificar.style.display = "inline-block";
    btnEliminar.style.display = "none";
    btnCambiarEstatus.style.display = "inline-block";
    btnLimpiar.style.display = "inline-block";
    btnAgregar.style.display = "none";
}

// Cambia el estatus del combo seleccionado
function cambiarEstatus() {
    if (indexComboSeleccionado !== undefined) {
        let combo = obj[indexComboSeleccionado];
        combo.estatus = (combo.estatus === "Activo") ? "Baja" : "Activo";
        actualizaTabla();
        selectCombo(indexComboSeleccionado);
    }
    limpiar();
}

// Limpia el formulario y oculta botones específicos
function limpiar() {
    document.getElementById("txtNombre").value = "";
    document.getElementById("txtDescripcion").value = "";
    document.getElementById("txtPrecio").value = "";
    document.getElementById("txtFoto").src = "img/placeholder.png";
    document.getElementById("txtFotoRuta").value = "";
    alimentosSeleccionados = [];
    bebidasSeleccionadas = [];
    document.querySelectorAll("#alimentosCheckboxes .form-check-input").forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll("#bebidasCheckboxes .form-check-input").forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll("#alimentosCheckboxes .cantidad-input").forEach(input => input.value = "0");
    document.querySelectorAll("#bebidasCheckboxes .cantidad-input").forEach(input => input.value = "0");
    document.getElementById("selectedAlimentos").innerHTML = "";
    document.getElementById("selectedBebidas").innerHTML = "";

    btnModificar.style.display = "none";
    btnEliminar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnLimpiar.style.display = "inline-block";
    btnAgregar.style.display = "inline-block";
}

// Agrega un nuevo combo a la lista
function agregarCombo() {
    let nombre = document.getElementById("txtNombre").value;
    let descripcion = document.getElementById("txtDescripcion").value;
    let precio = document.getElementById("txtPrecio").value;
    let foto = fotoBase64;

    if (nombre && descripcion && precio && foto) {
        let newCombo = {nombre, descripcion, precio, foto, estatus: "Activo"};
        obj.push(newCombo);

        console.log(JSON.stringify(obj));
        limpiar();
        actualizaTabla();
    } else {
        alert("Hay campos obligatorios para agregar el combo");
    }
}

// Modifica un combo existente en la lista
function modificarCombo() {
    if (indexComboSeleccionado !== undefined) {
        let nombre = document.getElementById("txtNombre").value;
        let descripcion = document.getElementById("txtDescripcion").value;
        let precio = document.getElementById("txtPrecio").value;

        obj[indexComboSeleccionado] = {
            ...obj[indexComboSeleccionado],
            nombre,
            descripcion,
            precio,
            estatus: "Activo"
        };

        console.log(obj[indexComboSeleccionado].nombre, document.getElementById("txtNombre").value, nombre);
        actualizaTabla();
        selectCombo(indexComboSeleccionado);
    }
}

// Elimina el combo seleccionado de la lista
function eliminarCombo() {
    if (indexComboSeleccionado !== undefined) {
        obj = obj.filter((_, index) => index !== indexComboSeleccionado);
        limpiar();
        actualizaTabla();
    }
}

// Normaliza el texto para la búsqueda (minúsculas y sin acentos)
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Filtra los combos en la tabla según el texto de búsqueda
function filtrarCombos() {
    const textoBusqueda = normalizarTexto(document.getElementById("buscarCombo").value);
    const filas = document.querySelectorAll("#tblCombos tr");

    filas.forEach(fila => {
        const nombre = normalizarTexto(fila.cells[1].textContent);
        const descripcion = normalizarTexto(fila.cells[2].textContent);
        const precio = normalizarTexto(fila.cells[3].textContent);
        const estatus = normalizarTexto(fila.cells[5].textContent);

        if (nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda) || precio.includes(textoBusqueda) || estatus.includes(textoBusqueda)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// Cargar datos y actualizar la tabla
fetch('../json/jsonCombo.json')
    .then(response => response.json())
    .then(jasondata => {
        obj = jasondata;
        console.log(obj);
        actualizaTabla();
    });

// Actualiza la tabla con los datos de obj
function actualizaTabla() {
    let cuerpo = "";
    obj.forEach((elemento, index) => {
        let registro = `
            <tr onclick="selectCombo(${index});" class="table-row">
                <td>${index + 1}</td>
                <td>${elemento.nombre}</td>
                <td>${elemento.descripcion}</td>
                <td>$${parseFloat(elemento.precio).toFixed(2)}</td>
                <td><img src="${elemento.foto}" class="img-thumbnail" width="100" alt="${elemento.nombre}"></td>
                <td>${elemento.estatus}</td>
            </tr>`;
        cuerpo += registro;
    });
    document.getElementById("tblCombos").innerHTML = cuerpo;
    filtrarCombos();
}

// Verificar sesión al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
});
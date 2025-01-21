/* global fetch */

// Inicialización de Notyf
const notyf = new Notyf({
    duration: 6000,
    position: {
        x: 'right', // Esquina derecha
        y: 'top'    // Parte superior
    },
    types: [
        {
            type: 'success',
            background: '#28a745',
            icon: {
                className: 'fas fa-check-circle',
                tagName: 'i',
                color: 'white'
            }
        },
        {
            type: 'error',
            background: '#dc3545',
            icon: {
                className: 'fas fa-times-circle',
                tagName: 'i',
                color: 'white'
            }
        }
    ]
});

// Inicialización de botones y variables globales
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");

btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";

let bebidas = [];
let filaSeleccionada = null; // Fila seleccionada actualmente
let bebidaSeleccionada = null; // Bebida seleccionada actualmente

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias(); // Cargar categorías al inicio
    cargarBebidas(); // Cargar bebidas registradas
});

// Función para cargar las bebidas desde el backend
function cargarBebidas() {
    const ruta = `${API_URL}bebidas/getall`;

    fetch(ruta)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error al cargar las bebidas: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Bebidas cargadas:", data); // Debugging
                if (Array.isArray(data)) {
                    bebidas = data;
                    actualizarTablaBebidas(bebidas);
                    
                } else {
                    console.error("Error: Formato de datos incorrecto", data);
                    notyf.error("El servidor devolvió un formato de datos incorrecto.");
                }
            })
            .catch((error) => {
                console.error("Error al cargar las bebidas:", error);
                notyf.error("No se pudieron cargar las bebidas. Consulte con el administrador.");
            });
}

function agregarBebida() {
    // Validar campos y precio
    if (!validarCampos() || !validarPrecio()) {
        return;
    }

    const nombre = document.getElementById("txtNombre").value.trim();
    const descripcion = document.getElementById("txtDescripcion").value.trim();
    const precio = parseFloat(document.getElementById("txtPrecio").value);
    const foto = document.getElementById("txtFoto").src; // Imagen en Base64
    const idCategoria = parseInt(document.getElementById("txtCategoria").value);

    // Crear objeto de bebida para enviar
    const bebida = {
        producto: {
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            foto: foto,
            categoria: {idCategoria: idCategoria},
        },
    };

    fetch(`${API_URL}bebidas/insert`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bebida),
    })
            .then((response) => {
                if (!response.ok)
                    throw new Error("Error al agregar la bebida.");
                return response.json();
            })
            .then((data) => {
                console.log("Respuesta al agregar bebida:", data); // Debugging
                notyf.success("Bebida agregada correctamente.");
                cargarBebidas(); // Refrescar la lista de bebidas
                limpiar(); // Limpiar el formulario
            })
            .catch((error) => {
                console.error("Error al agregar bebida:", error);
                notyf.error("Hubo un problema al agregar la bebida. Consulta con el administrador.");
            });
}

// Función para cargar categorías de tipo "bebida"
function cargarCategorias() {
    const ruta = `${API_URL}categoria/getall/bebidas`;

    fetch(ruta)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error al cargar las categorías: ${response.status}`);
                }
                return response.json();
            })
            .then((categorias) => {
                console.log("Categorías cargadas:", categorias); // Debugging
                const select = document.getElementById("txtCategoria");
                select.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';

                categorias.forEach((categoria) => {
                    if (categoria.activo === 1) { // Solo categorías activas
                        const option = document.createElement("option");
                        option.value = categoria.idCategoria;
                        option.textContent = categoria.descripcion;
                        select.appendChild(option);
                    }
                });
            })
            .catch((error) => {
                console.error("Error al cargar las categorías:", error);
                notyf.error("No se pudieron cargar las categorías. Consulte con el administrador.");
            });
}

function modificarBebida() {
    if (!validarCampos() || !validarPrecio()) {
        return;
    }

    const nombre = document.getElementById("txtNombre").value.trim();
    const descripcion = document.getElementById("txtDescripcion").value.trim();
    const precio = parseFloat(document.getElementById("txtPrecio").value);
    const foto = document.getElementById("txtFoto").src; // Usa la imagen actual (nueva o cargada)
    const idCategoria = parseInt(document.getElementById("txtCategoria").value);

    const bebida = {
        idProducto: bebidaSeleccionada.producto.idProducto,
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        foto: foto,
        categoria: {
            idCategoria: idCategoria,
        },
    };

    fetch(`${API_URL}bebidas/update`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bebida),
    })
            .then((response) => {
                if (!response.ok)
                    throw new Error("Error al modificar la bebida.");
                notyf.success("Bebida modificada correctamente.");
                cargarBebidas();
                limpiar();
            })
            .catch((error) => {
                console.error("Error al modificar bebida:", error);
                notyf.error("Hubo un problema al modificar la bebida.");
            });
}

// Función para actualizar la tabla con las bebidas cargadas
function actualizarTablaBebidas(bebidasParaMostrar) {
    const tabla = document.getElementById("tblBebidas");
    if (!tabla) {
        console.error("El elemento 'tblBebidas' no se encuentra en el DOM.");
        return;
    }

    tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevas filas

    // Asegúrate de que bebidasParaMostrar sea un array
    if (Array.isArray(bebidasParaMostrar)) {
        bebidasParaMostrar.forEach((bebida, index) => {
            // Comprobar que bebida tenga las propiedades necesarias
            const producto = bebida.producto || bebida; // Usar bebida.producto si existe
            if (producto) {
                const row = tabla.insertRow();

                // Generar las celdas de la tabla
                row.innerHTML = `
                    <td>${producto.nombre || producto.nombreProducto || "N/A"}</td>
                    <td>${bebida.descripcionProducto || producto.descripcion || "N/A"}</td>
                    <td>$${producto.precio ? producto.precio.toFixed(2) : "0.00"}</td>
                    <td>${producto.categoria ? producto.categoria.descripcion : "N/A"}</td>
                    <td><img src="${producto.foto || './img/placeholder.png'}" alt="Foto" width="50"></td>
                    <td class="${producto.activo === 1 ? 'activo' : 'inactivo'}">
                        ${producto.activo === 1 ? "Activo" : "Inactivo"}
                    </td>
                `;

                // Asignar evento para seleccionar la fila
                row.addEventListener("click", () => seleccionarFila(bebida, index, row));
            } else {
                console.warn("Bebida no definida en el resultado:", bebida);
            }
        });
    } else {
        console.error("Error: Se esperaba un array, pero se recibió:", bebidasParaMostrar);
    }
}

// Función para seleccionar una fila y mostrar los datos en el formulario
function seleccionarFila(bebida, index, fila) {
    bebidaSeleccionada = bebida;

    // Llenar los datos del formulario
    document.getElementById("txtNombre").value = bebida.producto.nombre || "";
    document.getElementById("txtDescripcion").value = bebida.producto.descripcion || "";
    document.getElementById("txtPrecio").value = bebida.producto.precio || "";
    document.getElementById("txtCategoria").value = bebida.producto.categoria.idCategoria || "";

    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = bebida.producto.foto || "./img/placeholder.png"; // Mostrar la imagen del registro
    txtFoto.dataset.originalSrc = bebida.producto.foto || "./img/placeholder.png";

    const fileInput = document.getElementById("fileInput");
    if (fileInput)
        fileInput.value = ""; // Limpiar el input de archivo

    // Mostrar los botones correspondientes
    btnModificar.style.display = "inline-block";
    btnCambiarEstatus.style.display = "inline-block";
    btnAgregar.style.display = "none";

    // Resaltar la fila seleccionada
    const filas = document.querySelectorAll("#tblBebidas tr");
    filas.forEach(f => f.classList.remove("selected")); // Quitar selección previa
    fila.classList.add("selected"); // Agregar selección a la fila actual
}

// Función para limpiar el formulario
function limpiar() {
    document.getElementById("bebidaForm").reset();
    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = "./img/placeholder.png"; // Regresar al placeholder
    txtFoto.dataset.originalSrc = ""; // Limpiar enlace original

    const fileInput = document.getElementById("fileInput");
    if (fileInput)
        fileInput.value = ""; // Restablecer el campo del archivo

    bebidaSeleccionada = null;

    // Restablecer los botones
    btnModificar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnAgregar.style.display = "inline";

    // Quitar selección de la tabla
    const filas = document.querySelectorAll("#tblBebidas tr");
    filas.forEach(f => f.classList.remove("selected"));
}

function cambiarEstatus() {
    if (!bebidaSeleccionada) {
        notyf.error("Por favor selecciona una bebida para cambiar su estatus.");
        return;
    }

    const idProducto = bebidaSeleccionada.producto.idProducto;

    fetch(`${API_URL}bebidas/cambiarEstatus/${idProducto}`, {
        method: "PUT",
    })
            .then((response) => {
                if (!response.ok)
                    throw new Error("Error al cambiar el estatus de la bebida.");
                notyf.success("Estatus cambiado correctamente.");
                cargarBebidas(); // Recargar todas las bebidas
                limpiar(); // Limpiar el formulario
            })
            .catch((error) => {
                console.error("Error al cambiar el estatus:", error);
                notyf.error("Hubo un problema al cambiar el estatus de la bebida.");
            });
}

function filtrarBebidas() {
    const textoBusqueda = document.getElementById("searchInput").value.trim();

    // Si no hay texto de búsqueda, cargar todas las bebidas
    if (!textoBusqueda) {
        cargarBebidas(); 
        return;
    }

    // Construir la ruta para la API
    const ruta = `${API_URL}bebidas/search/${encodeURIComponent(textoBusqueda)}`;
    
    fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resultados de la búsqueda:", data);

            if (Array.isArray(data) && data.length > 0) {
                actualizarTablaBebidas(data); // Actualizar la tabla con los resultados
            } else {
                notyf.error("No se encontraron resultados.");
                actualizarTablaBebidas([]); // Limpiar la tabla si no hay resultados
            }
        })
        .catch(error => {
            console.error("Error al buscar bebidas:", error);
            notyf.error("Error al realizar la búsqueda. Consulte con el administrador.");
        });
}

// Función para convertir una imagen a Base64
function convertToBase64(event) {
    const file = event.target.files[0];
    const txtFoto = document.getElementById("txtFoto");
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            txtFoto.src = e.target.result; // Actualizar la imagen en el formulario
        };
        reader.readAsDataURL(file);
    }
}

function validarCampos() {
    const nombre = document.getElementById("txtNombre").value.trim();
    const descripcion = document.getElementById("txtDescripcion").value.trim();
    const precio = document.getElementById("txtPrecio").value.trim();
    const idCategoria = document.getElementById("txtCategoria").value;
    const foto = document.getElementById("txtFoto").src;

    if (!nombre || !descripcion || !precio || !idCategoria) {
        notyf.error("Por favor, completa todos los campos obligatorios.");
        return false;
    }

    if (!foto || foto.includes("placeholder")) {
        notyf.error("Por favor, selecciona una imagen válida.");
        return false;
    }

    return true;
}

function validarPrecio() {
    const precio = parseFloat(document.getElementById("txtPrecio").value);
    if (isNaN(precio) || precio <= 0) {
        notyf.error("El precio debe ser un número mayor a 0.");
        return false;
    }
    return true;
}

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
// Botones de acción
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");

// Ocultar botones innecesarios al inicio
btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";

let alimentos = []; // Lista de alimentos cargados
let filaSeleccionada = null; // Fila seleccionada actualmente
let alimentoSeleccionado = null; // Alimento seleccionado actualmente

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarAlimentos();
});

// Validar que los campos del formulario estén completos
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
        notyf.error("Por favor, selecciona una foto válida.");
        return false;
    }

    return true;
}

// Validar precio
function validarPrecio() {
    const precio = parseFloat(document.getElementById("txtPrecio").value);
    if (isNaN(precio) || precio <= 0) {
        notyf.error("El precio debe ser un número mayor a 0.");
        return false;
    }
    return true;
}

// Cargar las categorías de tipo "alimento"
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}categoria/getall`);
        if (!response.ok) {
            throw new Error(`Error al cargar las categorías: ${response.status}`);
        }

        const categorias = await response.json();
        const select = document.getElementById("txtCategoria");
        select.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';

        categorias.forEach((categoria) => {
            if (categoria.tipo === "A" && categoria.activo === 1) {
                const option = document.createElement("option");
                option.value = categoria.idCategoria;
                option.textContent = categoria.descripcion;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        notyf.error("Hubo un problema al cargar las categorías.");
    }
}

// Cargar la tabla de alimentos
function cargarAlimentos() {
    const ruta = `${API_URL}alimento/getall`;

    fetch(ruta)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error al cargar los alimentos: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Alimentos cargados:", data); // Debugging
                if (Array.isArray(data)) {
                    alimentos = data;
                    actualizarTablaAlimentos(alimentos);
                    
                } else {
                    console.error("Error: Formato de datos incorrecto", data);
                    notyf.error("El servidor devolvió un formato de datos incorrecto.");
                }
            })
            .catch((error) => {
                console.error("Error al cargar las bebidas:", error);
                notyf.error("No se pudieron cargar los alimentos. Consulte con el administrador.");
            });
}

// Actualizar la tabla con los alimentos cargados
function actualizarTablaAlimentos(alimentosParaMostrar) {
    const tabla = document.getElementById("tblAlimentos");
    if (!tabla) {
        console.error("El elemento 'tblAlimentos' no se encuentra en el DOM.");
        return;
    }

    tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevas filas

    // Asegúrate de que bebidasParaMostrar sea un array
    if (Array.isArray(alimentosParaMostrar)) {
        alimentosParaMostrar.forEach((alimento, index) => {
            // Comprobar que bebida tenga las propiedades necesarias
            const producto = alimento.producto || alimento; // Usar bebida.producto si existe
            if (producto) {
                const row = tabla.insertRow();

                // Generar las celdas de la tabla
                row.innerHTML = `
                    <td>${producto.nombre || producto.nombreProducto || "N/A"}</td>
                    <td>${alimento.descripcionProducto || producto.descripcion || "N/A"}</td>
                    <td>$${producto.precio ? producto.precio.toFixed(2) : "0.00"}</td>
                    <td>${producto.categoria ? producto.categoria.descripcion : "N/A"}</td>
                    <td><img src="${producto.foto || './img/placeholder.png'}" alt="Foto" width="50"></td>
                    <td class="${producto.activo === 1 ? 'activo' : 'inactivo'}">
                        ${producto.activo === 1 ? "Activo" : "Inactivo"}
                    </td>
                `;

                // Asignar evento para seleccionar la fila
                row.addEventListener("click", () => seleccionarFila(alimento, index, row));
            } else {
                console.warn("Alimento no definida en el resultado:", alimento);
            }
        });
    } else {
        console.error("Error: Se esperaba un array, pero se recibió:", alimentosParaMostrar);
    }
}

// Seleccionar una fila de la tabla
function seleccionarFila(alimento) {
    if (!alimento) {
        console.error("Error: No se seleccionó un alimento válido.");
        return;
    }

    alimentoSeleccionado = alimento;
    document.getElementById("txtNombre").value = alimento.producto.nombre || '';
    document.getElementById("txtDescripcion").value = alimento.producto.descripcion || '';
    document.getElementById("txtPrecio").value = alimento.producto.precio || '';
    document.getElementById("txtCategoria").value = alimento.producto.categoria.idCategoria || '';

    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = alimento.producto.foto ? alimento.producto.foto : "./img/placeholder.png";

    const fileInput = document.getElementById("txtFotoRuta");
    fileInput.value = "";

    btnModificar.style.display = "inline";
    btnCambiarEstatus.style.display = "inline";
    btnAgregar.style.display = "none";
}

// Limpiar el formulario
function limpiar() {
    document.getElementById("alimentoForm").reset();
    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = "./img/placeholder.png";
    txtFoto.dataset.originalSrc = "";

    const fileInput = document.getElementById("txtFotoRuta");
    fileInput.value = "";

    alimentoSeleccionado = null;

    btnModificar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnAgregar.style.display = "inline";
}

// Agregar un alimento
async function agregarAlimento() {
    if (!validarCampos() || !validarPrecio()) {
        return;
    }

    const data = {
        producto: {
            nombre: document.getElementById("txtNombre").value.trim(),
            descripcion: document.getElementById("txtDescripcion").value.trim(),
            precio: parseFloat(document.getElementById("txtPrecio").value),
            foto: document.getElementById("txtFoto").src,
            categoria: {idCategoria: parseInt(document.getElementById("txtCategoria").value)},
        },
    };

    try {
        const response = await fetch(`${API_URL}alimento/insert`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (response.ok) {
            notyf.success("Alimento agregado correctamente.");
            cargarAlimentos();
            limpiar();
        } else {
            throw new Error("Error al agregar el alimento.");
        }
    } catch (error) {
        console.error("Error al agregar el alimento:", error);
        notyf.error("Hubo un problema al agregar el alimento.");
    }
}

// Modificar un alimento
async function modificarAlimento() {
    if (!validarCampos() || !validarPrecio()) {
        return;
    }

    const data = {
        idProducto: alimentoSeleccionado.producto.idProducto,
        nombre: document.getElementById("txtNombre").value.trim(),
        descripcion: document.getElementById("txtDescripcion").value.trim(),
        precio: parseFloat(document.getElementById("txtPrecio").value),
        foto: document.getElementById("txtFoto").src,
        categoria: {idCategoria: parseInt(document.getElementById("txtCategoria").value)},
    };

    try {
        const response = await fetch(`${API_URL}alimento/update`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (response.ok) {
            notyf.success("Alimento modificado correctamente.");
            cargarAlimentos();
            limpiar();
        } else {
            throw new Error("Error al modificar el alimento.");
        }
    } catch (error) {
        console.error("Error al modificar el alimento:", error);
        notyf.error("Hubo un problema al modificar el alimento.");
    }
}

// Cambiar el estatus de un alimento
async function cambiarEstatus() {
    if (!alimentoSeleccionado) {
        notyf.error("Debe seleccionar un alimento para cambiar su estatus.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}alimento/delete/${alimentoSeleccionado.producto.idProducto}`, {
            method: "POST",
        });

        if (response.ok) {
            notyf.success("Estatus cambiado correctamente.");
            cargarAlimentos();
            limpiar();
        } else {
            throw new Error("Error al cambiar el estatus.");
        }
    } catch (error) {
        console.error("Error al cambiar el estatus:", error);
        notyf.error("Hubo un problema al cambiar el estatus del alimento.");
    }
}

// Filtrar alimentos por búsqueda
function filtrarAlimentos() {
    const textoBusqueda = document.getElementById("searchInput").value.trim();

    // Si no hay texto de búsqueda, cargar todos los alimentos
    if (!textoBusqueda) {
        cargarAlimentos(); 
        return;
    }

    // Construir la ruta para la API
    const ruta = `${API_URL}alimento/search/${encodeURIComponent(textoBusqueda)}`;
    
    fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resultados de la búsqueda:", data);

            if (Array.isArray(data)) {
                actualizarTablaAlimentos(data); // Actualizar la tabla con los resultados
            } else {
                notyf.error("No se encontraron resultados.");
                actualizarTablaAlimentos([]); // Limpiar la tabla si no hay resultados
            }
        })
        .catch(error => {
            console.error("Error al buscar alimentos:", error);
            notyf.error("Error al realizar la búsqueda. Consulte con el administrador.");
        });
}
// Convertir la imagen a Base64
function convertToBase64(event) {
    const file = event.target.files[0];
    const txtFoto = document.getElementById("txtFoto");
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            txtFoto.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        txtFoto.src = txtFoto.dataset.originalSrc || "./img/placeholder.png";
    }
}

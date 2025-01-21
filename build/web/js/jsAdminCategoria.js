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

// Botones de acción
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");

// Ocultar botones innecesarios al inicio
btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";

let categorias = []; // Lista global de categorías obtenidas desde la API
let categoriaSeleccionada = null; // Categoría seleccionada para modificar o cambiar estatus

document.addEventListener("DOMContentLoaded", () => {
    cargarTabla();
});

// Función para validar campos vacíos
function validarCampos() {
    const descripcion = document.getElementById("txtDescripcion").value.trim();
    const tipo = document.getElementById("txtTipo").value;

    if (!descripcion) {
        notyf.error("El campo 'Descripción' no puede estar vacío.");
        return false;
    }

    if (!tipo || (tipo !== "A" && tipo !== "B")) {
        notyf.error("Debes seleccionar un tipo válido ('A' para Alimento o 'B' para Bebida).");
        return false;
    }

    return true;
}

// Función para cargar la tabla de categorías
async function cargarTabla() {
    try {
        const response = await fetch(`${API_URL}categoria/getall`);
        if (!response.ok) {
            throw new Error('Error al obtener las categorías: ' + response.status);
        }

        categorias = await response.json(); // Obtén los datos
        let cuerpo = ""; // Construcción de la tabla

        categorias.forEach((categoria, index) => {
            let fila = `
                <tr onclick="selectCategoria(${index});">
                    <td>${categoria.descripcion}</td>
                    <td>${categoria.tipo === "A" ? "Alimento" : "Bebida"}</td>
                    <td>${categoria.activo === 1 ? "Activo" : "Inactivo"}</td>
                </tr>`;
            cuerpo += fila;
        });

        document.getElementById("tblCategorias").innerHTML = cuerpo;

    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        notyf.error("Hubo un problema al cargar las categorías. Por favor, intenta de nuevo.");
    }
}

// Seleccionar una categoría y mostrarla en el formulario
function selectCategoria(index) {
    categoriaSeleccionada = categorias[index]; // Guarda la categoría seleccionada

    document.getElementById("txtDescripcion").value = categoriaSeleccionada.descripcion;
    document.getElementById("txtTipo").value = categoriaSeleccionada.tipo;

    btnModificar.style.display = "inline-block";
    btnCambiarEstatus.style.display = "inline-block";
    btnAgregar.style.display = "none";
}

// Limpiar el formulario
function limpiar() {
    document.getElementById("categoriaForm").reset();
    categoriaSeleccionada = null;

    // Restablecer la visibilidad de los botones
    btnModificar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnAgregar.style.display = "inline-block";
}

// Agregar una categoría
async function agregarCategoria() {
    if (!validarCampos()) return;

    try {
        const data = {
            descripcion: document.getElementById("txtDescripcion").value.trim(),
            tipo: document.getElementById("txtTipo").value
        };

        const response = await fetch(`${API_URL}categoria/insert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success(result.result || "Categoría agregada correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.error || "Error al agregar la categoría");
        }
    } catch (error) {
        console.error("Error al agregar la categoría:", error);
        notyf.error("Hubo un problema al agregar la categoría. Por favor, intenta de nuevo.");
    }
}

// Modificar una categoría
async function modificarCategoria() {
    if (!categoriaSeleccionada) {
        notyf.error("Debes seleccionar una categoría antes de modificar.");
        return;
    }

    if (!validarCampos()) return;

    try {
        const data = {
            idCategoria: categoriaSeleccionada.idCategoria,
            descripcion: document.getElementById("txtDescripcion").value.trim(),
            tipo: document.getElementById("txtTipo").value,
            activo: categoriaSeleccionada.activo,
        };

        const response = await fetch(`${API_URL}categoria/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success(result.result || "Categoría modificada correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.result || "Error al modificar la categoría");
        }
    } catch (error) {
        console.error("Error al modificar la categoría:", error);
        notyf.error("Hubo un problema al modificar la categoría.");
    }
}

// Cambiar el estatus de una categoría
async function cambiarEstatus() {
    if (!categoriaSeleccionada) {
        notyf.error("Debes seleccionar una categoría antes de cambiar el estatus.");
        return;
    }

    try {
        const data = {
            idCategoria: categoriaSeleccionada.idCategoria,
        };

        const response = await fetch(`${API_URL}categoria/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success(result.result || "Estatus cambiado correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.result || "Error al cambiar el estatus");
        }
    } catch (error) {
        console.error("Error al cambiar el estatus de la categoría:", error);
        notyf.error("Hubo un problema al cambiar el estatus de la categoría.");
    }
}

// Filtrar categorías
async function filtrarCategorias() {
    const searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput === "") {
        cargarTabla(); // Si está vacío, recargar todas las categorías
        return;
    }

    try {
        const response = await fetch(`${API_URL}categoria/search?descripcion=${encodeURIComponent(searchInput)}`);
        if (!response.ok) {
            throw new Error("Error al buscar categorías: " + response.status);
        }

        const categoriasFiltradas = await response.json();
        let cuerpo = ""; // Construcción de la tabla

        categoriasFiltradas.forEach((categoria, index) => {
            let fila = `
                <tr onclick="selectCategoria(${index});">
                    <td>${categoria.descripcion}</td>
                    <td>${categoria.tipo === "A" ? "Alimento" : "Bebida"}</td>
                    <td>${categoria.activo === 1 ? "Activo" : "Inactivo"}</td>
                </tr>`;
            cuerpo += fila;
        });

        document.getElementById("tblCategorias").innerHTML = cuerpo;

    } catch (error) {
        console.error("Error al buscar las categorías:", error);
        notyf.error("Hubo un problema al buscar las categorías.");
    }
}

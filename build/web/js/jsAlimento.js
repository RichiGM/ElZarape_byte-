let alimentos = [];

// Cargar alimentos desde la API y actualizar la tabla
async function cargarAlimentos() {
    const ruta = `${API_URL}alimento/getall`;

    try {
        const response = await fetch(ruta, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al cargar los alimentos: ${response.status}`);
        }

        const data = await response.json();
        console.log("Alimentos cargados:", data); // Debugging
        if (Array.isArray(data)) {
            alimentos = data;
            actualizarTablaAlimentos(alimentos);
        } else {
            console.error("Error: Formato de datos incorrecto", data);
            notyf.error("El servidor devolvió un formato de datos incorrecto.");
        }
    } catch (error) {
        console.error("Error al cargar los alimentos:", error);
        notyf.error("No se pudieron cargar los alimentos. Consulte con el administrador.");
    }
}

// Actualizar la tabla de alimentos con los datos cargados
function actualizarTablaAlimentos(alimentosParaMostrar) {
    const tabla = document.getElementById("tblAlimentos");
    if (!tabla) {
        console.error("El elemento 'tblAlimentos' no se encuentra en el DOM.");
        return;
    }

    tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevas filas

    // Asegúrate de que alimentosParaMostrar sea un array
    if (Array.isArray(alimentosParaMostrar)) {
        alimentosParaMostrar.forEach((alimento, index) => {
            const producto = alimento.producto || alimento; // Usar alimento.producto si existe
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
                console.warn("Alimento no definido en el resultado:", alimento);
            }
        });
    } else {
        console.error("Error: Se esperaba un array, pero se recibió:", alimentosParaMostrar);
    }
}

// Función para realizar búsqueda dinámica en la tabla
async function filtrarAlimentos() {
    const textoBusqueda = document.getElementById("searchInput").value.trim();

    // Si no hay texto de búsqueda, cargar todos los alimentos
    if (!textoBusqueda) {
        cargarAlimentos(); 
        return;
    }

    // Construir la ruta para la API
    const ruta = `${API_URL}alimento/search/${encodeURIComponent(textoBusqueda)}`;
    
    try {
        const response = await fetch(ruta, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resultados de la búsqueda:", data);

        if (Array.isArray(data)) {
            actualizarTablaAlimentos(data); // Actualizar la tabla con los resultados
        } else {
            notyf.error("No se encontraron resultados.");
            actualizarTablaAlimentos([]); // Limpiar la tabla si no hay resultados
        }
    } catch (error) {
        console.error("Error al buscar alimentos:", error);
        notyf.error("Error al realizar la búsqueda. Consulte con el administrador.");
    }
}

// Escuchar el evento de búsqueda dinámica
document.getElementById("searchInput").addEventListener("keyup", filtrarAlimentos);

// Cargar los alimentos al cargar la página 
document.addEventListener("DOMContentLoaded", cargarAlimentos);
let bebidas = [];

// Cargar bebidas desde la API y actualizar la tabla
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
                    
                }
            })
            .catch((error) => {
                console.error("Error al cargar las bebidas:", error);
               
            });
}

// Actualizar la tabla de bebidas con los datos cargados
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

// Función para realizar búsqueda dinámica en la tabla
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
               
                actualizarTablaBebidas([]); // Limpiar la tabla si no hay resultados
            }
        })
        .catch(error => {
            console.error("Error al buscar bebidas:", error);
            
        });
}



// Cargar las bebidas al cargar la página
document.addEventListener("DOMContentLoaded", cargarBebidas);

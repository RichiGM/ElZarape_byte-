// Obtener las sucursales desde la API y cargarlas en la tabla

function cargarSucursales() {
    const ruta = `${API_URL}sucursal/getall`;

    fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener las sucursales: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Sucursales cargadas desde la API:", data);

            // Validar que los datos sean un arreglo
            if (Array.isArray(data)) {
                sucursales = data; // Actualizar la variable global
                actualizarTabla(sucursales); // Llamar a la función para actualizar la tabla
            } else {
                console.error("Error: Formato de datos incorrecto", data);
                alert("Formato de datos incorrecto.");
            }
        })
        .catch(error => {
            console.error("Error al cargar las sucursales:", error);
            alert("No se pudieron cargar las sucursales. Consulte con el administrador.");
        });
}

// Función para actualizar la tabla con las sucursales cargadas
function actualizarTabla(data) {
    const tblSucursales = document.getElementById("tblSucursales");
    tblSucursales.innerHTML = ""; // Limpiar la tabla antes de llenarla

    data.forEach((sucursal) => {
        console.log(`Sucursal: ${sucursal.nombre}, Activo: ${sucursal.sucursalActivo}`); // Depuración

        const direccion = `
            ${(sucursal.estado && sucursal.estado.nombre) || "N/A"}, 
            ${(sucursal.ciudad && sucursal.ciudad.nombre) || "N/A"}, 
            ${sucursal.calle || "N/A"} ${sucursal.numCalle || "N/A"}, 
            ${sucursal.colonia || "N/A"}`.trim();

        // Crear la fila de la tabla
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${sucursal.nombre || "N/A"}</td>
            <td>${direccion}</td>
            <td><a href="${sucursal.urlWeb || "#"}" target="_blank">${sucursal.urlWeb || "N/A"}</a></td>
            <td>${sucursal.horarios || "N/A"}</td>
            <td><img src="${sucursal.foto || ""}" alt="Foto" width="50"></td>
            <td>${sucursal.sucursalActivo === 1 ? "Activo" : "Inactivo"}</td>
        `;

        // Asignar evento de selección a la fila
        fila.addEventListener("click", () => seleccionarSucursal(sucursal));

        tblSucursales.appendChild(fila); // Agregar la fila a la tabla
    });
}


// Búsqueda dinámica de sucursales desde el backend
function buscarSucursales() {
    const filtro = document.getElementById("searchInput").value.trim();

    // Si el campo está vacío, carga todas las sucursales
    if (!filtro) {
        cargarSucursales();
        return;
    }

    const ruta = `${API_URL}sucursal/search/${filtro}`;

    fetch(ruta)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al realizar la búsqueda: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Resultados de búsqueda desde la API:", data);
                if (Array.isArray(data)) {
                    actualizarTabla(data); // Actualiza la tabla con los resultados filtrados
                } else {
                    alert("No se encontraron resultados.");
                }
            })
            .catch(error => {
                console.error("Error en la búsqueda dinámica:", error);
                alert("Error al realizar la búsqueda. Consulte con el administrador.");
            });
}

// Modifica el evento del campo de búsqueda
document.getElementById("searchInput").addEventListener("input", buscarSucursales);


// Normalizar texto para búsquedas (elimina acentos y pasa a minúsculas)
function normalizarTexto(texto) {
    return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
}

// Llamar a cargar las sucursales al cargar la página
document.addEventListener("DOMContentLoaded", cargarSucursales);

// Función para verificar si hay una sesión activa
function checkSession() {
    const lastToken = localStorage.getItem("lastToken");
    if (!lastToken) {
        console.warn("Acceso denegado: usuario no autenticado.");
        
        // Limpiar la pantalla antes de redirigir
        document.body.innerHTML = "";

        // Redirigir a la página de acceso denegado
        window.location.href = "acceso_denegado.html";

        // Detener la ejecución de cualquier otro código
        return;
    }
}

// Función para cargar componentes asíncronamente
async function loadComponent(id, file) {
    try {
        const element = document.getElementById(id);
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Error al cargar ${file}: ${response.status}`);
        }
        const html = await response.text();
        element.innerHTML = html;

        // Verificar si es el header y ejecutar la lógica del usuario
        if (id === "header") {
            updateUserInfo();
        }
    } catch (error) {
        console.error("Error al cargar el componente:", error);
    }
}

// Obtener las sucursales desde la API y cargarlas en la tabla
function cargarSucursales() {
    const ruta = `${API_URL}sucursal/getall`;
    const lastToken = localStorage.getItem("lastToken"); // Obtener el token
    console.log("Token actual:", lastToken); // Verificar el token
    console.log("URL de la API:", ruta); // Verificar la URL

    fetch(ruta, {
        method: "GET",
        headers: {
            "Content-Type": "application/json", // Sin espacio
            "Authorization": lastToken // Enviar el token
        }
    })
        .then(response => {
            console.log("Respuesta de la API:", response); // Verificar la respuesta
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
        });
}

// Función para actualizar la tabla con las sucursales cargadas
function actualizarTabla(data) {
    const tblSucursales = document.getElementById("tblSucursales");
    tblSucursales.innerHTML = ""; // Limpiar la tabla antes de llenarla

    data.forEach((sucursal) => {
        console.log(`Sucursal: ${sucursal.nombre}, Activo: ${sucursal.sucursalActivo}`);

        const direccion = `
            ${(sucursal.estado && sucursal.estado.nombre) || "N/A"}, 
            ${(sucursal.ciudad && sucursal.ciudad.nombre) || "N/A"}, 
            ${sucursal.calle || "N/A"} ${sucursal.numCalle || "N/A"}, 
            ${sucursal.colonia || "N/A"}`.trim();

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${sucursal.nombre || "N/A"}</td>
            <td>${direccion}</td>
            <td><a href="${sucursal.urlWeb || "#"}" target="_blank">${sucursal.urlWeb || "N/A"}</a></td>
            <td>${sucursal.horarios || "N/A"}</td>
            <td><img src="${sucursal.foto || ""}" alt="Foto" width="50"></td>
            <td>${sucursal.sucursalActivo === 1 ? "Activo" : "Inactivo"}</td>
        `;

        fila.addEventListener("click", () => seleccionarSucursal(sucursal));
        tblSucursales.appendChild(fila);
    });
}

// Búsqueda dinámica de sucursales desde el backend
function buscarSucursales() {
    const filtro = document.getElementById("searchInput").value.trim();
    const lastToken = localStorage.getItem("lastToken"); // Obtener el token

    if (!filtro) {
        cargarSucursales();
        return;
    }

    const ruta = `${API_URL}sucursal/search/${filtro}`;

    fetch(ruta, {
        method: "GET",
        headers: {
            "Content-Type": "application/json", // Sin espacio
            "Authorization": lastToken // Enviar el token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al realizar la búsqueda: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resultados de búsqueda desde la API:", data);
            if (Array.isArray(data)) {
                actualizarTabla(data);
            } else {
                alert("No se encontraron resultados.");
            }
        })
        .catch(error => {
            console.error("Error en la búsqueda dinámica:", error);
        });
}

// Evento para búsqueda dinámica
document.getElementById("searchInput").addEventListener("input", buscarSucursales);
window.onload = function() {
    checkSession();
    cargarSucursales(); // Llama a cargarSucursales después de verificar la sesión
};
// Inicialización de Notyf
const notyf = new Notyf({
    duration: 5000,
    position: { x: 'right', y: 'top' },
    types: [
        {
            type: 'success',
            background: 'green',
            icon: { className: 'fas fa-check-circle', tagName: 'i', color: 'white' },
        },
        {
            type: 'error',
            background: 'red',
            icon: { className: 'fas fa-times-circle', tagName: 'i', color: 'white' },
        },
    ],
});

// Inicialización de botones y variables globales
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");
let indexSucursalSeleccionada = null;
let imagenBase64 = ""; // Variable global para guardar la imagen en Base64

// Ocultar botones específicos al cargar la página
btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";

document.addEventListener("DOMContentLoaded", function () {
    cargarSucursales();
    cargarEstados();
});

let sucursales = []; // Lista de sucursales cargadas desde el servidor

// Función para cargar las sucursales desde el servidor
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

            if (Array.isArray(data)) {
                sucursales = data; 
                actualizarTabla(sucursales); 
               
            } else {
                console.error("Error: Formato de datos incorrecto", data);
                notyf.error("Formato de datos incorrecto.");
            }
        })
        .catch(error => {
            console.error("Error al cargar las sucursales:", error);
            notyf.error("No se pudieron cargar las sucursales. Consulte con el administrador.");
        });
}

function cargarEstados() {
    return new Promise((resolve, reject) => {
        const ruta = `${API_URL}sucursal/getestados`;
        fetch(ruta)
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar los estados.");
                return response.json();
            })
            .then(data => {
                console.log("Estados cargados:", data);
                if (Array.isArray(data)) {
                    const selectEstado = document.getElementById("selectEstado");
                    selectEstado.innerHTML = "<option value=''>Seleccione un estado</option>";
                    data.forEach(estado => {
                        const option = document.createElement("option");
                        option.value = estado.idEstado;
                        option.textContent = estado.nombre;
                        selectEstado.appendChild(option);
                    });
                    resolve();
                   
                } else {
                    reject(new Error("Formato de datos incorrecto."));
                }
            })
            .catch(error => {
                console.error("Error al cargar los estados:", error);
                notyf.error("No se pudieron cargar los estados.");
                reject(error);
            });
    });
}

function cargarCiudadesPorEstado(idEstado) {
    return new Promise((resolve, reject) => {
        const ruta = `${API_URL}sucursal/getciudades/${idEstado}`;
        fetch(ruta)
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar las ciudades.");
                return response.json();
            })
            .then(data => {
                console.log("Ciudades cargadas:", data);
                const selectCiudad = document.getElementById("selectCiudad");
                selectCiudad.innerHTML = "<option value=''>Seleccione una ciudad</option>";
                data.forEach(ciudad => {
                    const option = document.createElement("option");
                    option.value = ciudad.idCiudad;
                    option.textContent = ciudad.nombre;
                    selectCiudad.appendChild(option);
                });
                resolve();
                
            })
            .catch(error => {
                console.error("Error al cargar las ciudades:", error);
                notyf.error("No se pudieron cargar las ciudades.");
                reject(error);
            });
    });
}

// Evento para cambiar ciudades según el estado seleccionado
document.getElementById("selectEstado").addEventListener("change", (event) => {
    const idEstado = event.target.value;
    if (idEstado) {
        cargarCiudadesPorEstado(idEstado);
    } else {
        document.getElementById("selectCiudad").innerHTML = "<option value=''>Seleccione una ciudad</option>";
    }
});

// Función para actualizar la tabla con las sucursales
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




// Función para convertir la imagen a Base64 con el prefijo intacto
function convertToBase64(event) {
    const file = event.target.files[0];
    const txtFoto = document.getElementById("txtFoto");
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            txtFoto.src = e.target.result; // Actualiza la vista previa con la imagen seleccionada
            imagenBase64 = e.target.result; // Guarda la imagen en la variable global
        };
        reader.readAsDataURL(file);
    } else {
        txtFoto.src = txtFoto.dataset.originalSrc || "./img/placeholder.png"; // Regresa al placeholder si no hay archivo
        imagenBase64 = ""; // Limpia la variable global si no hay archivo seleccionado
    }
}


// Función para seleccionar una sucursal y llenar el formulario
async function seleccionarSucursal(sucursal) {
    if (!sucursal) {
        console.error("Error: Sucursal no encontrada.");
        return;
    }

    console.log("Sucursal seleccionada:", sucursal);

    // Cargar estados y esperar a que se completen
    await cargarEstados();

    // Seleccionar el estado
    const selectEstado = document.getElementById("selectEstado");
    selectEstado.value = sucursal.estado && sucursal.estado.idEstado ? sucursal.estado.idEstado : "";

    // Si hay un estado seleccionado, cargar las ciudades correspondientes
    if (sucursal.estado && sucursal.estado.idEstado) {
        await cargarCiudadesPorEstado(sucursal.estado.idEstado);
    }

    // Seleccionar la ciudad
    const selectCiudad = document.getElementById("selectCiudad");
    selectCiudad.value = sucursal.ciudad && sucursal.ciudad.idCiudad ? sucursal.ciudad.idCiudad : "";

    // Llenar otros campos del formulario
    document.getElementById("txtNombre").value = sucursal.nombre || '';
    document.getElementById("txtLatitud").value = sucursal.latitud || '';
    document.getElementById("txtLongitud").value = sucursal.longitud || '';
    document.getElementById("txtUrlWeb").value = sucursal.urlWeb || '';
    document.getElementById("txtHorarios").value = sucursal.horarios || '';
    document.getElementById("txtCalle").value = sucursal.calle || '';
    document.getElementById("txtNumCalle").value = sucursal.numCalle || '';
    document.getElementById("txtColonia").value = sucursal.colonia || '';

    // Actualizar la vista previa de la imagen
    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = sucursal.foto || "./img/placeholder.png";
    txtFoto.dataset.originalSrc = sucursal.foto || "./img/placeholder.png";

    document.getElementById("txtFotoRuta").value = ""; // Restablecer el campo de archivo

    // Guardar el índice de la sucursal seleccionada
    indexSucursalSeleccionada = sucursal.idSucursal;

    // Mostrar los botones correspondientes
    btnModificar.style.display = "inline-block";
    btnCambiarEstatus.style.display = "inline-block";
    btnAgregar.style.display = "none";
}





// Función para limpiar el formulario
function limpiar() {
    document.getElementById("sucursalForm").reset();
    const txtFoto = document.getElementById("txtFoto");
    txtFoto.src = "./img/placeholder.png"; // Regresar al placeholder
    txtFoto.dataset.originalSrc = ""; // Limpiar referencia de imagen original

    const fileInput = document.getElementById("txtFotoRuta");
    fileInput.value = ""; // Restablecer el campo del archivo

    imagenBase64 = ""; // Vaciar la variable global de la imagen
    indexSucursalSeleccionada = null;

    btnModificar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnAgregar.style.display = "inline-block";
}


// Función para agregar una sucursal
function agregarSucursal() {
    const nuevaSucursal = obtenerDatosFormulario();
    if (!nuevaSucursal) return; // Si los datos son inválidos, no continuar
  
    fetch(`${API_URL}sucursal/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSucursal),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error || "Error al agregar la sucursal.");
                });
            }
            return response.json();
        })
        .then((data) => {
            notyf.success("Sucursal agregada correctamente.");
            cargarSucursales();
            limpiar();
        })
        .catch((error) => {
            console.error("Error al agregar sucursal:", error);
            notyf.error(error.message || "Error al agregar sucursal.");
        });
}

// Función para modificar una sucursal
function modificarSucursal() {
    if (!indexSucursalSeleccionada) {
        notyf.error("Seleccione una sucursal para modificar.");
        return;
    }

    const sucursalModificada = obtenerDatosFormulario();
    if (!sucursalModificada) return; // Si los datos son inválidos, no continuar

    sucursalModificada.idSucursal = indexSucursalSeleccionada; // Agregar el ID de la sucursal seleccionada

    fetch(`${API_URL}sucursal/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalModificada),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error || "Error al modificar la sucursal.");
                });
            }
            return response.json();
        })
        .then((data) => {
            notyf.success("Sucursal modificada correctamente.");
            cargarSucursales();
            limpiar();
        })
        .catch((error) => {
            console.error("Error al modificar sucursal:", error);
            notyf.error(error.message || "Error al modificar sucursal.");
        });
}

// Función para cambiar el estatus de una sucursal
function cambiarEstatus() {
    if (!indexSucursalSeleccionada) {
        notyf.error("Seleccione una sucursal para cambiar el estatus.");
        return;
    }

    fetch(`${API_URL}sucursal/delete/${indexSucursalSeleccionada}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error || "Error al cambiar el estatus.");
                });
            }
            return response.json();
        })
        .then((data) => {
            notyf.success("Estatus cambiado correctamente.");
            cargarSucursales(); // Recargar la tabla para reflejar los cambios
            limpiar(); // Limpiar el formulario
        })
        .catch((error) => {
            console.error("Error al cambiar el estatus de la sucursal:", error);
            notyf.error(error.message || "Error al cambiar el estatus de la sucursal.");
        });
}

// Función para validar el formulario
function validarFormulario() {
    const camposRequeridos = ["txtNombre", "txtLatitud", "txtLongitud", "txtCalle", "txtUrlWeb", "txtHorarios","txtNumCalle", "txtColonia","selectEstado", "selectCiudad"];
    for (let campo of camposRequeridos) {
        const elemento = document.getElementById(campo);
        if (!elemento || elemento.value.trim() === "") {
            notyf.error("Todos los campos requeridos deben llenarse.");
            return false;
        }
    }

    const foto = imagenBase64 || document.getElementById("txtFoto").src;
    if (!foto || foto.includes("placeholder")) {
        notyf.error("Debe cargar una imagen válida.");
        return false;
    }

    return true;
}

// Ajustar la función para obtener los datos del formulario
function obtenerDatosFormulario() {
    const nombre = document.getElementById("txtNombre").value.trim();
    const latitud = document.getElementById("txtLatitud").value.trim();
    const longitud = document.getElementById("txtLongitud").value.trim();
    const urlWeb = document.getElementById("txtUrlWeb").value.trim();
    const horarios = document.getElementById("txtHorarios").value.trim();
    const calle = document.getElementById("txtCalle").value.trim();
    const numCalle = document.getElementById("txtNumCalle").value.trim();
    const colonia = document.getElementById("txtColonia").value.trim();
    const idCiudad = parseInt(document.getElementById("selectCiudad").value, 10);
    const foto = imagenBase64 || document.getElementById("txtFoto").src; // Usar Base64 o la imagen existente

    if (!idCiudad || isNaN(idCiudad)) {
        notyf.error("Seleccione una ciudad válida.");
        return null;
    }

    if (!foto || foto.includes("placeholder")) {
        notyf.error("Debe cargar una imagen válida.");
        return null;
    }
     if (!validarFormulario()) 
         return;
    return {
        nombre,
        latitud,
        longitud,
        urlWeb,
        horarios,
        calle,
        numCalle,
        colonia,
        ciudad: {
            idCiudad: idCiudad,
        },
        foto,
    };
}

// Función para buscar sucursales
function buscarSucursales() {
    const textoBusqueda = document.getElementById("searchInput").value.trim();

    if (!textoBusqueda) {
        cargarSucursales(); // Si no hay texto, cargar todas las sucursales
        return;
    }

    const ruta = `${API_URL}sucursal/search/${textoBusqueda}`;
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
                actualizarTabla(data); // Actualizar la tabla con los resultados
                
            } else {
                notyf.error("No se encontraron resultados.");
            }
        })
        .catch(error => {
            console.error("Error al buscar sucursales:", error);
            notyf.error("Error al realizar la búsqueda. Consulte con el administrador.");
        });
}

// Cargar sucursales al iniciar
cargarSucursales();

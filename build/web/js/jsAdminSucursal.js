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

const malasPalabras = [
    "idiota", "imbécil", "estúpido", "tonto", "bobo", "menso", "tarado", "loco",
    "inútil", "baboso", "gilipollas", "huevón", "fregado", "burro", "torpe",
    "mierda", "basura", "asco", "pendejo", "cabrón", "puto", "puta", "perra",
    "zorra", "chingar", "joder", "coño", "carajo", "mamón", "chingada", "chingado",
    "maldito", "malparido", "ojete", "pelotudo", "culero", "cabrona", "putazo",
    "chingón", "chingona", "verga", "pinche", "culiao", "mierdero", "gil", 
    "estúpida", "babosa", "burra", "basofia", "desgraciado", "culito", 
    "retrasado", "anormal", "baboso", "hueca", "grosera", "cornudo",
    "cornuda", "boludo", "malnacido", "corrupto", "estafador", "tramposo",
    "traidor", "farsante", "malcriado", "pedazo de mierda", "infeliz", 
    "hijo de puta", "cabeza hueca", "patán", "sinvergüenza", "holgazán",
    "haragán", "gandul", "bribón", "truhan", "bandido", "villano", "idiota",
    "cretino", "tarúpido", "torombolo", "gordinflón", "cuadrúpedo", 
    "grotesco", "tontín", "babieca", "tarúpido", "canalla", "sin remedio", "chingue su madre",
    "cabron", "estupido de mierda"
];

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
    checkSession();
});

let sucursales = []; // Lista de sucursales cargadas desde el servidor

// funcion para detectar malas palabras
function contieneMalasPalabras(texto) {
    const textoNormalizado = texto.toLowerCase(); // Convertir a minúsculas para comparación
    return malasPalabras.some((palabra) => textoNormalizado.includes(palabra));
}

// Función para cargar las sucursales desde el servidor
function cargarSucursales() {
    const ruta = `${API_URL}sucursal/getall`;
    const lastToken = localStorage.getItem("lastToken"); // Obtener el token almacenado

    fetch(ruta, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": lastToken // 🔥 Enviar el token en los headers
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al obtener las sucursales: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Sucursales cargadas desde la API:", data);
        if (Array.isArray(data)) {
            actualizarTabla(data);
        } else {
            console.error("Error: Formato de datos incorrecto", data);
        }
    })
    .catch(error => {
        console.error("Error al cargar las sucursales:", error);
    });
}


function cargarEstados() {
    return new Promise((resolve, reject) => {
        const ruta = `${API_URL}sucursal/getestados`;
        const lastToken = localStorage.getItem("lastToken"); // Obtener el token

        fetch(ruta, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": lastToken // Enviar el token
            }
        })
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
        const lastToken = localStorage.getItem("lastToken"); // Obtener el token

        fetch(ruta, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": lastToken // Enviar el token
            }
        })
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

    // Limpia los estilos de error antes de llenar los campos
    const campos = document.querySelectorAll(".is-invalid");
    campos.forEach((campo) => campo.classList.remove("is-invalid"));

    const feedbacks = document.querySelectorAll(".invalid-feedback");
    feedbacks.forEach((feedback) => (feedback.style.display = "none"));

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

    // Eliminar estilos de error
    const campos = document.querySelectorAll(".is-invalid");
    campos.forEach((campo) => campo.classList.remove("is-invalid"));

    const feedbacks = document.querySelectorAll(".invalid-feedback");
    feedbacks.forEach((feedback) => (feedback.style.display = "none"));
}



// Función para agregar una sucursal
function agregarSucursal() {
    const nuevaSucursal = obtenerDatosFormulario();
    if (!nuevaSucursal) return; // Si los datos son inválidos, no continuar

    const lastToken = localStorage.getItem("lastToken"); // Obtener el token

    fetch(`${API_URL}sucursal/add`, {
        method: "POST",
 headers: { 
            "Content-Type": "application/json",
            "Authorization": lastToken // Enviar el token
        },
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

    const lastToken = localStorage.getItem("lastToken"); // Obtener el token

    fetch(`${API_URL}sucursal/update`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": lastToken // Enviar el token
        },
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

    const lastToken = localStorage.getItem("lastToken"); // Obtener el token

    fetch(`${API_URL}sucursal/delete/${indexSucursalSeleccionada}`, {
        method: "DELETE",
        headers: {
            "Authorization": lastToken // Enviar el token
        },
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

//validar duplicados de nombres
function esNombreDuplicado(nombre) {
    return sucursales.some((sucursal) => sucursal.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
}


// Función para validar el formulario
function validarFormulario() {
    const mensajesCampos = {
        txtNombre: "El campo 'Nombre de la Sucursal' es obligatorio.",
        txtLatitud: "El campo 'Latitud' es obligatorio y debe estar entre -90 y 90 grados.",
        txtLongitud: "El campo 'Longitud' es obligatorio y debe estar entre -180 y 180 grados.",
        txtUrlWeb: "El campo 'URL Web' es obligatorio y debe comenzar con 'http://' o 'https://'.",
        txtHorarios: "El campo 'Horarios' es obligatorio y debe tener un formato como 'Lunes a Viernes 9:00 - 18:00'.",
        txtCalle: "El campo 'Calle' es obligatorio.",
        txtNumCalle: "El campo 'Número de la Calle' es obligatorio.",
        txtColonia: "El campo 'Colonia' es obligatorio.",
        selectEstado: "Debe seleccionar un estado.",
        selectCiudad: "Debe seleccionar una ciudad.",
    };

    let formularioValido = true;

    // Validar cada campo según los mensajes especificados
    Object.keys(mensajesCampos).forEach((campoId) => {
        const elemento = document.getElementById(campoId);
        const texto = elemento.value.trim();
        const mensajeError = mensajesCampos[campoId];

        // Crear o encontrar el div de error
        let feedback = elemento.nextElementSibling;
        if (!feedback || !feedback.classList.contains("invalid-feedback")) {
            feedback = document.createElement("div");
            feedback.className = "invalid-feedback";
            elemento.parentNode.appendChild(feedback);
        }

        // Validar si el campo está vacío
        if (!texto) {
            elemento.classList.add("is-invalid");
            feedback.textContent = mensajeError;
            feedback.style.display = "block";
            formularioValido = false;
        } 
        // Validar si contiene malas palabras
        else if (contieneMalasPalabras(texto)) {
            elemento.classList.add("is-invalid");
            feedback.textContent = "El campo contiene lenguaje inapropiado.";
            feedback.style.display = "block";
            formularioValido = false;
        
        } 
         // Validar nombres duplicados (aplicable solo al campo 'txtNombre')
        else if (campoId === "txtNombre" && esNombreDuplicado(texto) && !indexSucursalSeleccionada) {
            elemento.classList.add("is-invalid");
            feedback.textContent = "El nombre de la sucursal ya está registrado.";
            feedback.style.display = "block";
            formularioValido = false;
        }
        else {
            elemento.classList.remove("is-invalid");
            feedback.style.display = "none";
        }
    });

    // Validar rango de latitud
    const latitud = parseFloat(document.getElementById("txtLatitud").value);
    if (isNaN(latitud) || latitud < -90 || latitud > 90) {
        const elemento = document.getElementById("txtLatitud");
        elemento.classList.add("is-invalid");
        const feedback = elemento.nextElementSibling;
        feedback.textContent = "La latitud debe estar entre -90 y 90 grados.";
        feedback.style.display = "block";
        formularioValido = false;
    }

    // Validar rango de longitud
    const longitud = parseFloat(document.getElementById("txtLongitud").value);
    if (isNaN(longitud) || longitud < -180 || longitud > 180) {
        const elemento = document.getElementById("txtLongitud");
        elemento.classList.add("is-invalid");
        const feedback = elemento.nextElementSibling;
        feedback.textContent = "La longitud debe estar entre -180 y 180 grados.";
        feedback.style.display = "block";
        formularioValido = false;
    }

    // Validar formato de URL
    const urlWeb = document.getElementById("txtUrlWeb").value.trim();
    if (!/^https?:\/\/.+/.test(urlWeb)) {
        const elemento = document.getElementById("txtUrlWeb");
        elemento.classList.add("is-invalid");
        const feedback = elemento.nextElementSibling;
        feedback.textContent = "El campo 'URL Web' debe comenzar con 'http://' o 'https://'.";
        feedback.style.display = "block";
        formularioValido = false;
    }

    // Validar formato de horarios
    const horarios = document.getElementById("txtHorarios").value.trim();
    const regexHorarios = /^[A-Za-z\sáéíóúÁÉÍÓÚñÑ]+ \d{1,2}:\d{2} - \d{1,2}:\d{2}$/;
    if (!regexHorarios.test(horarios)) {
        const elemento = document.getElementById("txtHorarios");
        elemento.classList.add("is-invalid");
        const feedback = elemento.nextElementSibling;
        feedback.textContent = "El campo 'Horarios' debe tener un formato como 'Lunes a Viernes 9:00 - 18:00'.";
        feedback.style.display = "block";
        formularioValido = false;
    }

    // Validar si se cargó una imagen
    const foto = imagenBase64 || document.getElementById("txtFoto").src;
    const txtFoto = document.getElementById("txtFoto");
    const contenedorFoto = document.getElementById("txtFotoRuta").parentNode;
    let feedbackFoto = contenedorFoto.querySelector(".invalid-feedback");

    if (!feedbackFoto) {
        feedbackFoto = document.createElement("div");
        feedbackFoto.className = "invalid-feedback";
        contenedorFoto.appendChild(feedbackFoto);
    }

    if (!foto || foto.includes("placeholder")) {
        txtFoto.classList.add("is-invalid");
        contenedorFoto.classList.add("is-invalid");
        feedbackFoto.textContent = "Debe cargar una imagen válida.";
        feedbackFoto.style.display = "block";
        formularioValido = false;
    } else {
        txtFoto.classList.remove("is-invalid");
        contenedorFoto.classList.remove("is-invalid");
        feedbackFoto.style.display = "none";
    }

    return formularioValido;
}



// Ajustar la función para obtener los datos del formulario
function obtenerDatosFormulario() {
    const nombre = document.getElementById("txtNombre").value.trim();
    const latitud = parseFloat(document.getElementById("txtLatitud").value);
    const longitud = parseFloat(document.getElementById("txtLongitud").value);
    const urlWeb = document.getElementById("txtUrlWeb").value.trim();
    const horarios = document.getElementById("txtHorarios").value.trim();
    const calle = document.getElementById("txtCalle").value.trim();
    const numCalle = document.getElementById("txtNumCalle").value.trim();
    const colonia = document.getElementById("txtColonia").value.trim();
    const idCiudad = parseInt(document.getElementById("selectCiudad").value, 10);
    const foto = imagenBase64 || document.getElementById("txtFoto").src;

    // Validar formulario antes de continuar
    if (!validarFormulario()) return null;

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
            "Content-Type": "application/json",
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


// Cargar sucursales al iniciar
cargarSucursales();

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

// Función para verificar si hay una sesión activa
function checkSession() {
    const lastToken = localStorage.getItem("lastToken");
    if (!lastToken) {
        console.warn("Acceso denegado: usuario no autenticado.");
        
        // Limpiar la pantalla antes de redirigir
        document.body.innerHTML = "";

        // Redirigir a la página de acceso denegado
        window.location.href = "AccesoDenegado.html";

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
// Inicialización de botones
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelarCambioContrasenia = document.getElementById("btnCancelarCambioContrasenia");
const inputContrasenia = document.getElementById("txtContrasenia");
const btnTogglePassword = document.getElementById("togglePassword");
const inputConfirmarContrasenia = document.getElementById("txtConfirmarContrasenia");
const btnToggleConfirmPassword = document.getElementById("toggleConfirmPassword");

btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";
btnCancelarCambioContrasenia.style.display = "none";

let usuarios = []; // Lista global de usuarios obtenidos desde la API
let usuarioSeleccionado = null; // Usuario seleccionado para modificar o cambiar estatus
let cambioContraseniaActivo = false;


document.addEventListener("DOMContentLoaded", () => {
    cargarTabla();
    cargarEstados();
    cargarSucursales();
    checkSession();
});

// Función para cargar la tabla de usuarios desde la API
async function cargarTabla() {
    try {
        const response = await fetch(`${API_URL}usuario/getall`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener los usuarios: ${response.status}`);
        }

        usuarios = await response.json();
        let cuerpo = "";

        usuarios.forEach((usuario, index) => {
            const esEmpleado = usuario.hasOwnProperty("idEmpleado");
            const esCliente = usuario.hasOwnProperty("idCliente");

            let fila = `
                <tr onclick="selectUsuario(${index});">
                    <td>${usuario.usuario.nombre}</td>
                    <td>${usuario.usuario.contrasenia}</td>
                    <td>${usuario.persona ? usuario.persona.nombre : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.apellidos : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.telefono : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.nombreCiudad : "N/A"}</td>
                    <td>${esEmpleado ? "Empleado" : esCliente ? "Cliente" : "N/A"}</td>
                    <td>${esEmpleado && usuario.nombreSucursal ? usuario.nombreSucursal : "N/A"}</td>
                    <td>${usuario.usuario.activo === 1 ? "Activo" : "Inactivo"}</td>
                </tr>`;
            cuerpo += fila;
        });

        document.getElementById("tblUsuarios").innerHTML = cuerpo;

    } catch (error) {
        console.error("Error al cargar los datos:", error);
        notyf.error("Hubo un problema al cargar los datos de usuarios. Por favor, intenta nuevamente.");
    }
}

// Seleccionar un usuario y mostrarlo en el formulario
async function selectUsuario(index) {
    limpiar();
    usuarioSeleccionado = usuarios[index];

    document.getElementById("txtNombreUsuario").value = usuarioSeleccionado.usuario.nombre || "";
    document.getElementById("txtNombrePersona").value = usuarioSeleccionado.persona.nombre || "";
    document.getElementById("txtApellidosPersona").value = usuarioSeleccionado.persona.apellidos || "";
    document.getElementById("txtTelefono").value = usuarioSeleccionado.persona.telefono || "";

    if (usuarioSeleccionado.persona.idCiudad) {
        const idCiudad = usuarioSeleccionado.persona.idCiudad;
        const idEstado = await obtenerEstadoPorCiudad(idCiudad);

        if (idEstado) {
            await cargarEstados();
            document.getElementById("txtEstado").value = idEstado;

            await cargarCiudadesPorEstado(idEstado);
            document.getElementById("txtCiudad").value = idCiudad;
        }
    }

    await cargarSucursales();
    const tipoEntidad = usuarioSeleccionado.idEmpleado ? "empleado" : "cliente";
    document.getElementById("txtTipoEntidad").value = tipoEntidad;

    if (tipoEntidad === "empleado") {
        document.getElementById("divSucursal").style.display = "block";
        document.getElementById("txtSucursal").value = usuarioSeleccionado.idSucursal || "";
    } else {
        document.getElementById("divSucursal").style.display = "none";
    }

    btnModificar.style.display = "inline-block";
    btnCambiarEstatus.style.display = "inline-block";
    btnAgregar.style.display = "none";

    // Ocultar los campos de contraseña y mostrar solo el botón "Modificar Contraseña"
    document.getElementById("divModificarContrasenia").style.display = "flex";
    document.getElementById("divCamposContrasenia").style.display = "none";
    btnCancelarCambioContrasenia.style.display = "none";
}


// Obtener el estado basado en la ciudad seleccionada
async function obtenerEstadoPorCiudad(idCiudad) {
    try {
        const response = await fetch(`${API_URL}ciudad/getall`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener las ciudades: ${response.status}`);
        }

        const ciudades = await response.json();
        const ciudad = ciudades.find(c => c.idCiudad === idCiudad);
        return ciudad ? ciudad.idEstado : null;
    } catch (error) {
        console.error("Error al obtener el estado de la ciudad:", error);
        notyf.error("No se pudo cargar el estado de la ciudad. Por favor, intenta de nuevo.");
        return null;
    }
}

// Generar una contraseña aleatoria
window.generarContrasenia = function () {
    const longitud = 12;
    const caracteres = "abcdefghijklmnopqrstuvwxyz";
    const caracteresMayus = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeros = "0123456789";
    const caracteresEspeciales = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    let contrasenia = "";

    contrasenia += caracteresMayus[Math.floor(Math.random() * caracteresMayus.length)];
    contrasenia += numeros[Math.floor(Math.random() * numeros.length)];
    contrasenia += caracteresEspeciales[Math.floor(Math.random() * caracteresEspeciales.length)];

    const todosCaracteres = caracteres + caracteresMayus + numeros + caracteresEspeciales;
    for (let i = contrasenia.length; i < longitud; i++) {
        contrasenia += todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)];
    }

    contrasenia = contrasenia.split('').sort(() => Math.random() - 0.5).join('');
    document.getElementById("txtContrasenia").value = contrasenia;
    document.getElementById("txtConfirmarContrasenia").value = contrasenia;
    notyf.success("Contraseña generada correctamente.");
};

// Mostrar/ocultar contraseña
window.mostrarOcultarContrasenia = function () {
    if (inputContrasenia.type === "password") {
        inputContrasenia.type = "text";
        btnTogglePassword.textContent = "Ocultar";
    } else {
        inputContrasenia.type = "password";
        btnTogglePassword.textContent = "Mostrar";

    }
};

// Mostrar/ocultar confirmación de contraseña
window.mostrarOcultarConfirmarContrasenia = function () {
    if (inputConfirmarContrasenia.type === "password") {
        inputConfirmarContrasenia.type = "text";
        btnToggleConfirmPassword.textContent = "Ocultar";
    } else {
        inputConfirmarContrasenia.type = "password";
        btnToggleConfirmPassword.textContent = "Mostrar";
    }
};

function habilitarCambioContrasenia() {
    cambioContraseniaActivo = true;

    document.getElementById("divCamposContrasenia").style.display = "block";
    document.getElementById("divModificarContrasenia").style.display = "none";
    btnCancelarCambioContrasenia.style.display = "inline-block";

    document.getElementById("txtContrasenia").removeAttribute("disabled");
    document.getElementById("txtConfirmarContrasenia").removeAttribute("disabled");
    document.getElementById("btnGenerarContrasenia").removeAttribute("disabled");
    document.getElementById("togglePassword").removeAttribute("disabled");
    document.getElementById("toggleConfirmPassword").removeAttribute("disabled");

    // Limpiar los campos de contraseña antes de comenzar la modificación
    document.getElementById("txtContrasenia").value = "";
    document.getElementById("txtConfirmarContrasenia").value = "";
}



// Agregar un usuario
async function agregarUsuario() {
    if (!validarFormularioSinContrasenia()) {
        notyf.error("Por favor, completa correctamente todos los campos antes de agregar un usuario.");
        return;
    }
    if (!validarSoloContrasenia()) {
        notyf.error("Por favor, completa correctamente todos los campos antes de agregar un usuario.");
        return;
    }

    try {
        const data = new URLSearchParams({
            nombreUsuario: document.getElementById("txtNombreUsuario").value,
            contrasenia: document.getElementById("txtContrasenia").value,
            nombrePersona: document.getElementById("txtNombrePersona").value,
            apellidosPersona: document.getElementById("txtApellidosPersona").value,
            telefono: document.getElementById("txtTelefono").value,
            idCiudad: document.getElementById("txtCiudad").value,
            tipoEntidad: document.getElementById("txtTipoEntidad").value,
            idSucursal: document.getElementById("txtSucursal").value || ""
        });

        const response = await fetch(`${API_URL}usuario/insert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            },
            body: data,
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success("Usuario agregado correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.result || "Error al agregar usuario.");
        }
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        notyf.error("Hubo un problema al agregar el usuario. Consulta con el administrador.");
    }
}

// Modificar usuario (sin modificar contraseña)
async function modificarUsuario() {
    if (cambioContraseniaActivo) {
        if (!validarSoloContrasenia()) {
            notyf.error("Las contraseñas no cumplen con los requisitos o no coinciden.");
            return;
        }
    }
    if (!usuarioSeleccionado) {
        notyf.error("Debes seleccionar un usuario antes de modificar.");
        return;
    }
    if (!validarFormularioSinContrasenia()) {
        notyf.error("Por favor, completa todos los campos antes de modificar un usuario.");
        return;
    }

    const data = {
        idUsuario: usuarioSeleccionado.usuario.idUsuario || 0,
        nombreUsuario: document.getElementById("txtNombreUsuario").value || "",
        idPersona: usuarioSeleccionado.persona.idPersona || 0,
        nombrePersona: document.getElementById("txtNombrePersona").value || "",
        apellidosPersona: document.getElementById("txtApellidosPersona").value || "",
        telefono: document.getElementById("txtTelefono").value || "",
        idCiudad: parseInt(document.getElementById("txtCiudad").value) || 0,
        tipoEntidad: document.getElementById("txtTipoEntidad").value || "",
        idSucursal: document.getElementById("txtTipoEntidad").value === "empleado"
                ? parseInt(document.getElementById("txtSucursal").value) || null
                : null,
    };

    try {
        const response = await fetch(`${API_URL}usuario/updateSinContrasenia`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.result || "Error al modificar usuario.");
        }

        notyf.success("Usuario modificado correctamente.");

        // Si el usuario activó el cambio de contraseña, ejecutar la función
        if (cambioContraseniaActivo) {
            modificarContrasenia();
        }

        cargarTabla();
        limpiar();
    } catch (error) {
        console.error("Error al modificar usuario:", error);
        notyf.error("Hubo un problema al modificar el usuario. Consulta con el administrador.");
    }
}


// Modificar solo la contraseña (llamará a la API nueva)
async function modificarContrasenia() {
    const nuevaContrasenia = document.getElementById("txtContrasenia").value;
    const confirmarContrasenia = document.getElementById("txtConfirmarContrasenia").value;

    // Verificar que las contraseñas coincidan
    if (nuevaContrasenia !== confirmarContrasenia) {
        notyf.error("Las contraseñas no coinciden.");
        return;
    }

    try {
        const data = {
            idUsuario: usuarioSeleccionado.usuario.idUsuario,
            nuevaContrasenia: nuevaContrasenia
        };

        const response = await fetch(`${API_URL}usuario/updatePassword`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.result || "Error al modificar la contraseña.");
        }

        notyf.success("Contraseña modificada correctamente.");

        // Ocultar nuevamente los campos de contraseña
        document.getElementById("divCamposContrasenia").style.display = "none";
        document.getElementById("divModificarContrasenia").style.display = "block";

        cambioContraseniaActivo = false;
    } catch (error) {
        console.error("Error al modificar la contraseña:", error);
        notyf.error("Hubo un problema al modificar la contraseña.");
    }
}

// Cambiar el estatus de un usuario
async function cambiarEstatus() {
    try {
        const data = new URLSearchParams({
            idUsuario: usuarioSeleccionado.usuario.idUsuario
        });

        const response = await fetch(`${API_URL}usuario/cambiarEstatus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            },
            body: data
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success("Estatus del usuario actualizado correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.result || "Error al cambiar estatus.");
        }
    } catch (error) {
        console.error("Error al cambiar estatus:", error);
        notyf.error("Hubo un problema al cambiar el estatus del usuario. Consulta con el administrador.");
    }
}

// Validar contraseña en tiempo real
document.getElementById("txtContrasenia").addEventListener("input", function () {
    const contrasenia = this.value;
    const passwordError = document.getElementById("passwordError");
    if (!validarContrasenia(contrasenia)) {
        passwordError.style.display = "block";
        passwordError.textContent = "La contraseña debe tener al menos 12 caracteres, incluir una letra mayúscula y un carácter especial.";
    } else {
        passwordError.style.display = "none";
    }
});

function mostrarSucursal(tipo) {
    const divSucursal = document.getElementById('divSucursal');
    divSucursal.style.display = (tipo === 'empleado') ? 'block' : 'none';
}

// Limpiar el formulario
function limpiar() {
    limpiarErrores();
    document.getElementById("usuarioForm").reset();

    // Limpiar el campo de selección de ciudad
    const selectCiudad = document.getElementById("txtCiudad");
    selectCiudad.innerHTML = '<option value="" disabled selected>Seleccionar una ciudad</option>';

    // Ocultar el campo de sucursal si estaba visible
    document.getElementById("divSucursal").style.display = "none";

    // Restablecer la visibilidad de los botones
    btnModificar.style.display = "none";
    btnCambiarEstatus.style.display = "none";
    btnAgregar.style.display = "inline-block";
    btnCancelarCambioContrasenia.style.display = "none";


    document.getElementById("divCamposContrasenia").style.display = "block";
    document.getElementById("divModificarContrasenia").style.display = "none";

    document.getElementById("txtContrasenia").removeAttribute("disabled");
    document.getElementById("txtConfirmarContrasenia").removeAttribute("disabled");
    document.getElementById("btnGenerarContrasenia").removeAttribute("disabled");
    document.getElementById("togglePassword").removeAttribute("disabled");
    document.getElementById("toggleConfirmPassword").removeAttribute("disabled");

    // Limpiar los campos de contraseña antes de comenzar la modificación
    document.getElementById("txtContrasenia").value = "";
    document.getElementById("txtConfirmarContrasenia").value = "";

    cambioContraseniaActivo = false;

    inputContrasenia.type = "password";
    btnTogglePassword.textContent = "Mostrar";
    inputConfirmarContrasenia.type = "password";
    btnToggleConfirmPassword.textContent = "Mostrar";
}



// Cargar estados
async function cargarEstados() {
    try {
        const response = await fetch(`${API_URL}estado/getall`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener los estados: ${response.status}`);
        }

        const estados = await response.json();
        const selectEstado = document.getElementById("txtEstado");

        selectEstado.innerHTML = '<option value="" disabled selected>Seleccionar un estado</option>';
        estados.forEach(estado => {
            const option = document.createElement("option");
            option.value = estado.idEstado.toString();
            option.textContent = estado.nombre;
            selectEstado.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar los estados:", error);
        notyf.error("No se pudieron cargar los estados. Consulta con el administrador.");
    }
}

// Cargar ciudades por estado
window.cargarCiudadesPorEstado = async function cargarCiudadesPorEstado() {
    const idEstado = document.getElementById("txtEstado").value;

    if (!idEstado) {
        console.warn("No se seleccionó un estado. Limpiando ciudades...");
        const selectCiudad = document.getElementById("txtCiudad");
        selectCiudad.innerHTML = '<option value="" disabled selected>Seleccionar una ciudad</option>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}ciudad/getbyestado?idEstado=${idEstado}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener las ciudades: ${response.status}`);
        }

        const ciudades = await response.json();
        const selectCiudad = document.getElementById("txtCiudad");

        selectCiudad.innerHTML = '<option value="" disabled selected>Seleccionar una ciudad</option>';
        ciudades.forEach(ciudad => {
            const option = document.createElement("option");
            option.value = ciudad.idCiudad.toString();
            option.textContent = ciudad.nombre;
            selectCiudad.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar las ciudades:", error);
        notyf.error("Hubo un problema al cargar las ciudades. Intente nuevamente.");
    }
};

// Cargar sucursales
async function cargarSucursales() {
    try {
        const response = await fetch(`${API_URL}sucursal/getall`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener las sucursales: ${response.status}`);
        }

        const sucursales = await response.json();
        const selectSucursal = document.getElementById("txtSucursal");

        selectSucursal.innerHTML = '<option value="" disabled selected>Seleccionar sucursal</option>';
        const sucursalesActivas = sucursales.filter(sucursal => sucursal.sucursalActivo === 1);

        sucursalesActivas.forEach(sucursal => {
            const option = document.createElement("option");
            option.value = sucursal.idSucursal.toString();
            option.textContent = `${sucursal.nombre} (${sucursal.ciudad.nombre})`;
            selectSucursal.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar las sucursales:", error);
        notyf.error("No se pudieron cargar las sucursales activas. Consulta con el administrador.");
    }
}

// Mostrar/ocultar sucursal
function mostrarSucursal(tipo) {
    const divSucursal = document.getElementById("divSucursal");
    if (tipo === "empleado") {
        divSucursal.style.display = "block";
        cargarSucursales();
    } else {
        divSucursal.style.display = "none";
    }
}

// Filtrar usuarios
async function filtrarUsuarios() {
    const searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput === "") {
        cargarTabla();
        return;
    }

    try {
        const response = await fetch(`${API_URL}usuario/search?nombreUsuario=${encodeURIComponent(searchInput)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("lastToken") // Enviar el token
            }
        });

        if (!response.ok) {
            throw new Error(`Error al buscar usuarios: ${response.status}`);
        }

        const usuariosFiltrados = await response.json();
        let cuerpo = "";

        usuariosFiltrados.forEach((usuario, index) => {
            const esEmpleado = usuario.hasOwnProperty("idEmpleado");
            const esCliente = usuario.hasOwnProperty("idCliente");

            let fila = `
                <tr onclick="selectUsuario(${index});">
                    <td>${usuario.usuario.nombre}</td>
                    <td>${usuario.usuario.contrasenia}</td>
                    <td>${usuario.persona ? usuario.persona.nombre : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.apellidos : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.telefono : "N/A"}</td>
                    <td>${usuario.persona ? usuario.persona.nombreCiudad : "N/A"}</td>
                    <td>${esEmpleado ? "Empleado" : esCliente ? "Cliente" : "N/A"}</td>
                    <td>${esEmpleado && usuario.nombreSucursal ? usuario.nombreSucursal : "N/A"}</td>
                    <td>${usuario.usuario.activo === 1 ? "Activo" : "Inactivo"}</td>
                </tr>`;
            cuerpo += fila;
        });

        document.getElementById("tblUsuarios").innerHTML = cuerpo;

    } catch (error) {
        console.error("Error al buscar usuarios:", error);
        notyf.error("Hubo un problema al buscar los usuarios. Intente nuevamente.");
    }
}

// Vincular el evento de búsqueda
document.getElementById("searchInput").addEventListener("input", filtrarUsuarios);

function validarFormularioSinContrasenia() {
    const mensajesCampos = {
        txtNombreUsuario: "El 'Nombre de Usuario' es obligatorio, debe contener entre 3 y 65 caracteres, permitiendo solo alfanuméricos y guiones bajos, y no se permiten malas palabras.",
        txtNombrePersona: "El campo 'Nombre' es obligatorio, solo debe contener letras, y no se permiten malas palabras.",
        txtApellidosPersona: "El campo 'Apellidos' es obligatorio, solo debe contener letras, y no se permiten malas palabras.",
        txtTelefono: "El 'Teléfono' es obligatorio y debe seguir el formato 477-777-77-77.",
        txtEstado: "Debe seleccionar un estado.",
        txtCiudad: "Debe seleccionar una ciudad.",
        txtTipoEntidad: "Debe seleccionar un tipo de entidad.",
        txtSucursal: "Debe seleccionar una sucursal si el tipo de entidad es 'empleado'.",
    };

    let formularioValido = true;

    Object.keys(mensajesCampos).forEach((campoId) => {
        const elemento = document.getElementById(campoId);
        const texto = elemento.value.trim();
        const mensajeError = mensajesCampos[campoId];

        let feedback = elemento.nextElementSibling;
        if (!feedback || !feedback.classList.contains("invalid-feedback")) {
            feedback = document.createElement("div");
            feedback.className = "invalid-feedback";
            elemento.parentNode.appendChild(feedback);
        }

        const existingFeedbacks = Array.from(
                elemento.parentNode.querySelectorAll(".invalid-feedback")
                );
        existingFeedbacks.forEach((fb) => {
            if (fb !== feedback)
                fb.remove();
        });

        if (!texto) {
            if (campoId === "txtSucursal" && document.getElementById("txtTipoEntidad").value === "cliente") {
                feedback.style.display = "none";
                elemento.classList.remove("is-invalid");
                return;
            }

            elemento.classList.add("is-invalid");
            feedback.textContent = mensajeError;
            feedback.style.display = "block";
            formularioValido = false;
        } else {
            let valido = true;

            switch (campoId) {
                case "txtNombreUsuario":
                    valido = /^[a-zA-Z0-9_]{3,65}$/.test(texto);
                    break;
                case "txtNombrePersona":
                case "txtApellidosPersona":
                    valido = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]+$/.test(texto);
                    break;
                case "txtTelefono":
                    valido = /^\d{3}-\d{3}-\d{2}-\d{2}$/.test(texto);
                    break;
                case "txtEstado":
                case "txtCiudad":
                case "txtTipoEntidad":
                    valido = texto !== "";
                    break;
                case "txtSucursal":
                    if (document.getElementById("txtTipoEntidad").value === "empleado") {
                        valido = texto !== "";
                    }
                    break;
            }

            if (["txtNombreUsuario", "txtNombrePersona", "txtApellidosPersona"].includes(campoId) &&
                    contieneMalasPalabras(texto)) {
                valido = false;
                feedback.textContent = "El campo contiene lenguaje inapropiado.";
                feedback.style.display = "block";
                formularioValido = false;
            }

            if (!valido) {
                elemento.classList.add("is-invalid");
                feedback.textContent = mensajeError;
                feedback.style.display = "block";
                formularioValido = false;
            } else {
                elemento.classList.remove("is-invalid");
                feedback.style.display = "none";
            }
        }
    });

    return formularioValido;
}

function validarSoloContrasenia() {
    const mensajesCampos = {
        txtContrasenia: "La 'Contraseña' es obligatoria, debe tener al menos 12 caracteres, incluyendo una mayúscula, un número y un carácter especial.",
        txtConfirmarContrasenia: "La confirmación de la contraseña es obligatoria y debe coincidir con la contraseña ingresada.",
    };

    let formularioValido = true;

    Object.keys(mensajesCampos).forEach((campoId) => {
        const elemento = document.getElementById(campoId);
        const texto = elemento.value.trim();
        const mensajeError = mensajesCampos[campoId];

        let feedback = elemento.nextElementSibling;
        if (!feedback || !feedback.classList.contains("invalid-feedback")) {
            feedback = document.createElement("div");
            feedback.className = "invalid-feedback";
            elemento.parentNode.appendChild(feedback);
        }

        const existingFeedbacks = Array.from(
                elemento.parentNode.querySelectorAll(".invalid-feedback")
                );
        existingFeedbacks.forEach((fb) => {
            if (fb !== feedback)
                fb.remove();
        });

        if (!texto) {
            elemento.classList.add("is-invalid");
            feedback.textContent = mensajeError;
            feedback.style.display = "block";
            formularioValido = false;
        } else {
            let valido = true;

            switch (campoId) {
                case "txtContrasenia":
                    valido = validarContrasenia(texto);
                    break;
                case "txtConfirmarContrasenia":
                    const contrasenia = document.getElementById("txtContrasenia").value;
                    valido = texto === contrasenia;
                    if (!valido) {
                        feedback.textContent = "Las contraseñas no coinciden.";
                    }
                    break;
            }

            if (["txtContrasenia"].includes(campoId) && contieneMalasPalabras(texto)) {
                valido = false;
                feedback.textContent = "El campo contiene lenguaje inapropiado.";
                feedback.style.display = "block";
                formularioValido = false;
            }

            if (!valido) {
                elemento.classList.add("is-invalid");
                feedback.textContent = mensajeError;
                feedback.style.display = "block";
                formularioValido = false;
            } else {
                elemento.classList.remove("is-invalid");
                feedback.style.display = "none";
            }
        }
    });

    return formularioValido;
}



function validarContrasenia(contrasenia) {
    if (!contrasenia.trim()) {
        return false; // Retorna falso si la contraseña está vacía o solo tiene espacios
    }
    const tieneLongitud = contrasenia.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(contrasenia);
    const tieneNumero = /[0-9]/.test(contrasenia);
    const tieneEspecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(contrasenia);
    return tieneLongitud && tieneMayuscula && tieneNumero && tieneEspecial;
}

document.getElementById("txtConfirmarContrasenia").addEventListener("input", function () {
    const confirmPassword = this.value;
    const originalPassword = document.getElementById("txtContrasenia").value;
    const confirmPasswordError = document.getElementById("confirmPasswordHelp");

    if (confirmPassword !== originalPassword) {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.textContent = "Las contraseñas no coinciden.";
    } else {
        confirmPasswordError.style.display = "none";
    }
});

function contieneMalasPalabras(texto) {
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
    return malasPalabras.some((palabra) => texto.toLowerCase().includes(palabra));
}

// Mostrar/ocultar campos de contraseña según la acción
function toggleCamposContrasenia(mostrar) {
    const divModificarContrasenia = document.getElementById("divModificarContrasenia");
    const divCamposContrasenia = document.getElementById("divCamposContrasenia");

    if (mostrar) {
        divModificarContrasenia.style.display = "none"; // Ocultar el botón de modificar contraseña
        divCamposContrasenia.style.display = "block"; // Mostrar campos de contraseña
        document.getElementById("txtContrasenia").removeAttribute("disabled");
        document.getElementById("txtConfirmarContrasenia").removeAttribute("disabled");
        document.getElementById("btnGenerarContrasenia").removeAttribute("disabled");
        document.getElementById("togglePassword").removeAttribute("disabled");
        document.getElementById("toggleConfirmPassword").removeAttribute("disabled");
    } else {
        divModificarContrasenia.style.display = "block"; // Mostrar el botón de modificar contraseña
        divCamposContrasenia.style.display = "none"; // Ocultar los campos de contraseña
        document.getElementById("txtContrasenia").setAttribute("disabled", true);
        document.getElementById("txtConfirmarContrasenia").setAttribute("disabled", true);
        document.getElementById("btnGenerarContrasenia").setAttribute("disabled", true);
        document.getElementById("togglePassword").setAttribute("disabled", true);
        document.getElementById("toggleConfirmPassword").setAttribute("disabled", true);
    }
}

function cancelarCambioContrasenia() {
    cambioContraseniaActivo = false;

    document.getElementById("divCamposContrasenia").style.display = "none";
    document.getElementById("divModificarContrasenia").style.display = "flex";
    btnCancelarCambioContrasenia.style.display = "none";

    // Limpiar y deshabilitar los campos de contraseña
    document.getElementById("txtContrasenia").value = "";
    document.getElementById("txtConfirmarContrasenia").value = "";
    document.getElementById("txtContrasenia").setAttribute("disabled", true);
    document.getElementById("txtConfirmarContrasenia").setAttribute("disabled", true);
    document.getElementById("btnGenerarContrasenia").setAttribute("disabled", true);
    document.getElementById("togglePassword").setAttribute("disabled", true);
    document.getElementById("toggleConfirmPassword").setAttribute("disabled", true);

    inputContrasenia.type = "password";
    btnTogglePassword.textContent = "Mostrar";
    inputConfirmarContrasenia.type = "password";
    btnToggleConfirmPassword.textContent = "Mostrar";
}

function limpiarErrores() {
    // Obtener todos los elementos con la clase 'is-invalid' y eliminarla
    document.querySelectorAll(".is-invalid").forEach((elemento) => {
        elemento.classList.remove("is-invalid");
    });

    // Ocultar todos los mensajes de error
    document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
        feedback.style.display = "none";
    });

    // Limpiar cualquier contenido en los mensajes de error
    document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
        feedback.textContent = "";
    });
}

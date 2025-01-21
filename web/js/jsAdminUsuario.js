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

// Inicialización de botones
const btnModificar = document.getElementById("btnModificar");
const btnCambiarEstatus = document.getElementById("btnCambiarEstatus");
const btnAgregar = document.getElementById("btnAgregar");

btnModificar.style.display = "none";
btnCambiarEstatus.style.display = "none";

let usuarios = []; // Lista global de usuarios obtenidos desde la API
let usuarioSeleccionado = null; // Usuario seleccionado para modificar o cambiar estatus

document.addEventListener("DOMContentLoaded", () => {
    cargarTabla();
    cargarEstados();
    cargarSucursales();

    document.getElementById("txtTelefono").addEventListener("input", validarTelefono);
});

// Función para cargar la tabla de usuarios desde la API
async function cargarTabla() {
    try {
        const response = await fetch(`${API_URL}usuario/getall`);
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
    usuarioSeleccionado = usuarios[index];
    console.log("Usuario seleccionado:", usuarioSeleccionado);

    document.getElementById("txtNombreUsuario").value = usuarioSeleccionado.usuario.nombre || "";
    document.getElementById("txtContrasenia").value = usuarioSeleccionado.usuario.contrasenia || "";
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

    const divSucursal = document.getElementById("divSucursal");
    if (tipoEntidad === "empleado") {
        divSucursal.style.display = "block";
        await cargarSucursales();
        document.getElementById("txtSucursal").value = usuarioSeleccionado.idSucursal || "";
    } else {
        divSucursal.style.display = "none";
    }

    btnModificar.style.display = "inline-block";
    btnCambiarEstatus.style.display = "inline-block";
    btnAgregar.style.display = "none";

    limpiarErrores();
    
}

// Obtener el estado basado en la ciudad seleccionada
async function obtenerEstadoPorCiudad(idCiudad) {
    try {
        const response = await fetch(`${API_URL}ciudad/getall`);
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

// Limpiar errores del formulario
function limpiarErrores() {
    const telefonoError = document.getElementById("telefonoError");
    telefonoError.style.display = "none";
    document.getElementById("txtTelefono").classList.remove("is-invalid");
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
    notyf.success("Contraseña generada correctamente.");
};

// Mostrar/ocultar contraseña
window.mostrarOcultarContrasenia = function () {
    const inputContrasenia = document.getElementById("txtContrasenia");
    const btnTogglePassword = document.getElementById("togglePassword");

    if (inputContrasenia.type === "password") {
        inputContrasenia.type = "text";
        btnTogglePassword.textContent = "Ocultar";
    } else {
        inputContrasenia.type = "password";
        btnTogglePassword.textContent = "Mostrar";
    }
};


// Validación de contraseña
function validarContrasenia(contrasenia) {
    const tieneLongitud = contrasenia.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(contrasenia);
    const tieneEspecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(contrasenia);

    return tieneLongitud && tieneMayuscula && tieneEspecial;
}

// Validación de teléfono
function validarTelefono() {
    const telefono = document.getElementById("txtTelefono").value.trim();
    const telefonoError = document.getElementById("telefonoError");

    if (/^\d{10}$/.test(telefono)) {
        telefonoError.style.display = "none";
        document.getElementById("txtTelefono").classList.remove("is-invalid");
        return true;
    } else {
        telefonoError.style.display = "block";
        telefonoError.textContent = "El número debe tener exactamente 10 dígitos.";
        telefonoError.classList.add("text-danger");
        document.getElementById("txtTelefono").classList.add("is-invalid");
        return false;
    }
}

// Agregar un usuario
async function agregarUsuario() {
    if (!validarCamposLlenos()) {
        notyf.error("Por favor, completa todos los campos antes de agregar un usuario.");
        return;
    }
    if (!validarTelefono()) {
        notyf.error("El número de teléfono debe contener exactamente 10 dígitos.");
        return;
    }

    const contrasenia = document.getElementById("txtContrasenia").value;

    if (!validarContrasenia(contrasenia)) {
        notyf.error("La contraseña debe tener al menos 12 caracteres, incluir una letra mayúscula y un carácter especial.");
        return;
    }

    try {
        const data = new URLSearchParams({
            nombreUsuario: document.getElementById("txtNombreUsuario").value,
            contrasenia: contrasenia,
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

// Modificar un usuario
async function modificarUsuario() {
    if (!usuarioSeleccionado) {
        notyf.error("Debes seleccionar un usuario antes de modificar.");
        return;
    }
    if (!validarCamposLlenos()) {
        notyf.error("Por favor, completa todos los campos antes de modificar un usuario.");
        return;
    }
    if (!validarTelefono()) {
        notyf.error("El número de teléfono debe contener exactamente 10 dígitos.");
        return;
    }

    const contrasenia = document.getElementById("txtContrasenia").value;

    if (!validarContrasenia(contrasenia)) {
        notyf.error("La contraseña debe tener al menos 12 caracteres, incluir una letra mayúscula y un carácter especial.");
        return;
    }

    const data = {
        idUsuario: usuarioSeleccionado.usuario.idUsuario || 0,
        nombreUsuario: document.getElementById("txtNombreUsuario").value || "",
        contrasenia: document.getElementById("txtContrasenia").value || "",
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
        const response = await fetch(`${API_URL}usuario/update`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        if (response.ok) {
            notyf.success("Usuario modificado correctamente.");
            cargarTabla();
            limpiar();
        } else {
            throw new Error(result.result || "Error al modificar usuario.");
        }
    } catch (error) {
        console.error("Error al modificar usuario:", error);
        notyf.error("Hubo un problema al modificar el usuario. Consulta con el administrador.");
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
                "Content-Type": "application/x-www-form-urlencoded"
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
}



// Cargar estados
async function cargarEstados() {
    try {
        const response = await fetch(`${API_URL}estado/getall`);
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
        const response = await fetch(`${API_URL}ciudad/getbyestado?idEstado=${idEstado}`);
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
        const response = await fetch(`${API_URL}sucursal/getall`);
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

// Validar campos llenos
function validarCamposLlenos() {
    const getCampo = id => document.getElementById(id) || {value: ""};

    const tipoEntidad = getCampo("txtTipoEntidad").value.trim().toLowerCase();
    const campos = [
        getCampo("txtNombreUsuario"),
        getCampo("txtContrasenia"),
        getCampo("txtNombrePersona"),
        getCampo("txtApellidosPersona"),
        getCampo("txtTelefono"),
        getCampo("txtCiudad"),
        getCampo("txtTipoEntidad")
    ];

    if (tipoEntidad === "empleado") {
        campos.push(getCampo("txtSucursal"));
    }

    const camposCompletos = campos.every(campo => campo.value.trim() !== "");
    if (!camposCompletos) {
        notyf.error("Por favor, completa todos los campos obligatorios.");
    }
    return camposCompletos;
}

// Filtrar usuarios
async function filtrarUsuarios() {
    const searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput === "") {
        cargarTabla();
        return;
    }

    try {
        const response = await fetch(`${API_URL}usuario/search?nombreUsuario=${encodeURIComponent(searchInput)}`);
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
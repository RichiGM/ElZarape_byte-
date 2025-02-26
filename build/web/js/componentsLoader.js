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
            updateUserInfo(); // Sin espacios
        }
    } catch (error) {
        console.error("Error al cargar el componente:", error);
    }
}

// Cargar el header y el footer
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "Header.html");
    loadComponent("footer", "Footer.html");
});

const API_URL = "http://10.16.8.55:8080/ElZarape2/api/";

// Función para mostrar el usuario en el header
function updateUserInfo() {
    console.log("Ejecutando updateUser Info()"); // 🔍 Verifica que la función se ejecuta

    const username = localStorage.getItem("username");
    const usernameDisplay = document.getElementById("username-display");
    const userInfo = document.getElementById("user-info");

    console.log("Usuario en localStorage:", username); // 🔍 Verifica el valor guardado

    if (username && usernameDisplay && userInfo) {
        usernameDisplay.textContent = username;
        userInfo.style.display = "flex"; // Asegurar que el div se muestre
        console.log("Nombre de usuario mostrado en la UI."); // 🔍 Confirmar que se actualizó
    } else {
        if (userInfo) userInfo.style.display = "none"; // Ocultar si no hay usuario
        console.log("No se encontró usuario, ocultando la sección."); // 🔍 Mensaje en caso de fallo
    }

    // Evento para logout con API REST
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function (event) {
            event.preventDefault(); // Evitar la redirección inmediata

            const username = localStorage.getItem("username");

            if (!username) {
                console.warn("No hay usuario logueado.");
                return;
            }

            try {
                console.log("Iniciando logout para el usuario:", username);

                const response = await fetch(`${API_URL}usuario/logout`, { // ✅ RUTA CORREGIDA
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `nombreUsuario=${encodeURIComponent(username)}`
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Respuesta del servidor:", result); // 🔍 Verificar la respuesta del servidor

                    if (result.result.includes("Logout exitoso")) {
                        console.log("Logout exitoso en el servidor.");
                    } else {
                        console.warn("El servidor respondió, pero no con éxito:", result);
                    }
                } else {
                    console.error("Error en la petición de logout:", response.status);
                }
            } catch (error) {
                console.error("Error al realizar el logout:", error);
            } finally {
                // ✅ Borrar `localStorage` SIEMPRE, sin importar la respuesta
                console.log("Borrando localStorage...");
                localStorage.removeItem("username");
                localStorage.removeItem("lastToken");

                // Actualizar la UI después de eliminar el localStorage
                updateUserInfo(); // Asegúrate de que la UI se actualice

                // ✅ Redirigir SIEMPRE después de borrar `localStorage`
                console.log("Redirigiendo al login...");
                window.location.href = "Login.html"; // Cambia a la página de login
            }
        });
    }
}
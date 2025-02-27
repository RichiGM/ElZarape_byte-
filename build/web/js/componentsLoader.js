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

// Cargar el header y el footer
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "header.html");
    loadComponent("footer", "footer.html");
});

const API_URL = "http://localhost:8080/ElZarape2/api/";

// Función para mostrar el usuario en el header
function updateUserInfo() {
    console.log("Ejecutando updateUserInfo()");

    const username = localStorage.getItem("username");
    const usernameDisplay = document.getElementById("username-display");
    const userInfo = document.getElementById("user-info");

    console.log("Usuario en localStorage:", username);

    if (username && usernameDisplay && userInfo) {
        usernameDisplay.textContent = username;
        userInfo.style.display = "flex"; // Asegurar que el div se muestre
        console.log("Nombre de usuario mostrado en la UI.");
    } else {
        if (userInfo) userInfo.style.display = "none"; // Ocultar si no hay usuario
        console.log("No se encontró usuario, ocultando la sección.");
    }

    // Evento para logout con API REST
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function (event) {
            event.preventDefault(); // Evitar la redirección inmediata

            console.log("Cerrando sesión...");

            try {
                const username = localStorage.getItem("username");

                if (username) {
                    console.log("Iniciando logout en el servidor para:", username);

                    const response = await fetch(`${API_URL}usuario/logout`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: `nombreUsuario=${encodeURIComponent(username)}`
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log("Respuesta del servidor:", result);

                        if (!result.result.includes("Logout exitoso")) {
                            console.warn("El servidor respondió, pero no con éxito:", result);
                        }
                    } else {
                        console.error("Error en la petición de logout:", response.status);
                    }
                }
            } catch (error) {
                console.error("Error al realizar el logout:", error);
            } finally {
                console.log("Borrando localStorage...");
                localStorage.removeItem("username");
                localStorage.removeItem("lastToken");

                console.log("Redirigiendo al login...");
                window.location.href = "login.html"; // Redirigir al login siempre que se haga logout
            }
        });
    }
}

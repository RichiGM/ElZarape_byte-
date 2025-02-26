
const notyf = new Notyf({
    duration: 7000,
    position: {
        x: 'left',
        y: 'top'
    },
    ripple: true,
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

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}login/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Obtener el lastToken
                const tokenResponse = await fetch(`${API_URL}usuario/cheecky?nombre=${username}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (tokenResponse.ok) {
                    const tokenResult = await tokenResponse.json();
                    if (tokenResult.token) {
                        console.log("Token asignado:", tokenResult.token);
                        // Guardar en localStorage
                        localStorage.setItem("username", username);
                        localStorage.setItem("lastToken", tokenResult.token);
                    } else {
                        notyf.error('No se pudo asignar el token.');
                    }
                } else {
                    notyf.error('Error al obtener el token.');
                }

                notyf.success(`¡Inicio de sesión exitoso! Bienvenido, ${username}. Redirigiendo al menú principal...`);
                setTimeout(() => {
                    window.location.href = "Menu.html";
                }, 1000);
            } else {
                notyf.error('Credenciales incorrectas. Por favor, verifica tu nombre de usuario y contraseña.');
            }
        } else {
            notyf.error('Error al validar las credenciales. Intenta nuevamente.');
        }
    } catch (error) {
        console.error("Error:", error);
        notyf.error('Error de conexión con el servidor. Intenta más tarde.');
    }
});

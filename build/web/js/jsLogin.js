const notyf = new Notyf({
    duration: 7000, // Duración en milisegundos
    position: {
        x: 'left', // Esquina derecha
        y: 'top'    // Parte superior
    },
    ripple: true, // Animación de onda
    types: [
        {
            type: 'success',
            background: '#28a745', // Verde para éxito
            icon: {
                className: 'fas fa-check-circle',
                tagName: 'i',
                color: 'white'
            }
        },
        {
            type: 'error',
            background: '#dc3545', // Rojo para errores
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
                const checkResponse = await fetch(`${API_URL}usuario/cheecky?nombre=${username}`);
                if (checkResponse.ok) {
                    const checkResult = await checkResponse.json();
                    if (checkResult.error) {
                        notyf.error('Usuario no encontrado. Por favor, verifica tu nombre de usuario.');
                        return;
                    }
                    notyf.success('¡Inicio de sesión exitoso! Redirigiendo al menú principal...');
                    setTimeout(() => {
                        window.location.href = "menu.html";
                    }, 1000); // Redirige después de 1 segundo
                } else {
                    notyf.error('Error al verificar el usuario. Intenta nuevamente.');
                }
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
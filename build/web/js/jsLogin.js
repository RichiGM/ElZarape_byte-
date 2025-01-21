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
                notyf.success('¡Inicio de sesión exitoso! Redirigiendo al menú principal...');
                setTimeout(() => {
                    window.location.href = "menu.html";
                }, 1000); // Redirige después de 2 segundos
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

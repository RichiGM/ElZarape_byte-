

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



/* global fetch */
// Arreglo que se llenará de objetos JSON
let obj = [];
fetch('./json/jsonCombo.json')
        .then(response => response.json())
        .then(jasondata => {
            obj = jasondata;
            console.log(obj);
            actualizaTabla(); // Actualiza la tabla al cargar la página
        });

function actualizaTabla() {
    let cuerpo = "";
    obj.forEach(elemento => {
        if (elemento.estatus === "Activo") {
            let registro = `
                <tr>
                    <td>${elemento.nombre}</td>
                    <td>${elemento.descripcion}</td>
                    <td>$${parseFloat(elemento.precio).toFixed(2)}</td>
                    <td><img src="${elemento.foto}" class="img-thumbnail" width="100" alt="${elemento.nombre}"></td>
                </tr>`;
            cuerpo += registro;
        }
    });
    document.getElementById("tblCombos").innerHTML = cuerpo;
}

function normalizarTexto(texto) {
    return texto
            .toLowerCase() // Convertir a minúsculas
            .normalize("NFD") // Descomponer caracteres acentuados
            .replace(/[\u0300-\u036f]/g, ""); // Eliminar marcas de acento
}

function filtrarTabla() {
    let input = document.getElementById("searchInput");
    let filtro = normalizarTexto(input.value);
    let filas = document.querySelectorAll("#tblCombos tr");

    filas.forEach(fila => {
        let nombre = normalizarTexto(fila.cells[0].textContent);
        let descripcion = normalizarTexto(fila.cells[1].textContent);
        let precio = normalizarTexto(fila.cells[2].textContent);

        if (nombre.includes(filtro) || descripcion.includes(filtro) || precio.includes(filtro)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

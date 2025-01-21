let obj = []; // Asignando el texto del JSON al arreglo obj
let indexProductoSeleccionado; // Es el índice del arreglo
let ruta = 'img/'; // Ruta de imágenes

fetch("http://localhost:8080/ElZarape/Modulos/moduloProducto/datoProducto.json")
        .then((response) => {
            return response.json();
        })
                .then(function(jsondata) {
           obj=jsondata;
           console.log(obj);
           actualizaTabla();
        });

function actualizaTabla() {
    let cuerpo = "";
    obj.forEach(function (elemento) {
        let registro = '<tr onclick="selectProducto(' + obj.indexOf(elemento) + ');">' +
            '<td>' + obj.indexOf(elemento) + '</td>' +
            '<td>' + elemento.nombre + '</td>' +
            '<td>' + elemento.descripcion + '</td>' +
            '<td>' + elemento.precio + '</td>' +
            '<td> <img src="' + ruta + elemento.foto + '" width="100"> </td>' +
            '<td>' + elemento.tipo + '</td>' +
            '<td>' + elemento.estatus + '</td>' +
            '</tr>';
        cuerpo += registro;
    });

    document.getElementById("tblProductos").innerHTML = cuerpo;
}

function selectProducto(index) {
    document.getElementById("txtNombre").value = obj[index].nombre;
    document.getElementById("txtDescripcion").value = obj[index].descripcion;
    document.getElementById("txtPrecio").value = obj[index].precio;
    document.getElementById("txtTipo").value = obj[index].tipo;
    document.getElementById("txtFoto").src = ruta + obj[index].foto;
    document.getElementById("txtFotoRuta").value = "";
    indexProductoSeleccionado = index;

    document.getElementById("btnModificar").classList.remove("disabled");
    document.getElementById("btnEliminar").classList.remove("disabled");
    document.getElementById("btnLimpiar").classList.remove("disabled");
    document.getElementById("btnAgregar").classList.add("disabled");
}

function limpiar() {
    document.getElementById("txtNombre").value = "";
    document.getElementById("txtDescripcion").value = "";
    document.getElementById("txtPrecio").value = "";
    document.getElementById("txtTipo").value = "C";
    document.getElementById("txtFoto").src = ruta + "nada.jpg";
    document.getElementById("txtFotoRuta").value = "";

    document.getElementById("btnModificar").classList.add("disabled");
    document.getElementById("btnEliminar").classList.add("disabled");
    document.getElementById("btnLimpiar").classList.add("disabled");
    document.getElementById("btnAgregar").classList.remove("disabled");
    indexProductoSeleccionado = null;
}

function obtenerNombreFoto() {
    let nombreFoto = document.getElementById("txtFotoRuta").value;
    nombreFoto = nombreFoto.substring(nombreFoto.lastIndexOf("\\") + 1);
    return nombreFoto;
}

function agregarProducto() {
    let nombre = document.getElementById("txtNombre").value;
    let descripcion = document.getElementById("txtDescripcion").value;
    let precio = document.getElementById("txtPrecio").value;
    let fotoNueva = obtenerNombreFoto();

    let newProd = {
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        foto: fotoNueva,
        tipo: document.getElementById("txtTipo").value,
        estatus: "Activo"
    };

    obj.push(newProd);

    let jsonData = JSON.stringify(obj);

    console.log(jsonData);
    console.log(typeof jsonData);

    limpiar();
    actualizaTabla();
}

function modificaProducto() {
    if (indexProductoSeleccionado !== undefined && indexProductoSeleccionado !== null) {
        obj[indexProductoSeleccionado].nombre = document.getElementById("txtNombre").value;
        obj[indexProductoSeleccionado].descripcion = document.getElementById("txtDescripcion").value;
        obj[indexProductoSeleccionado].precio = document.getElementById("txtPrecio").value;
        obj[indexProductoSeleccionado].tipo = document.getElementById("txtTipo").value;

        let fotoNueva = obtenerNombreFoto();
        if (fotoNueva !== "") {
            obj[indexProductoSeleccionado].foto = fotoNueva;
            document.getElementById("txtFoto").src = ruta + fotoNueva;
        }

        actualizaTabla();
        limpiar();
    }
}

function eliminarProducto() {
    if (indexProductoSeleccionado !== undefined && indexProductoSeleccionado !== null) {
        obj.splice(indexProductoSeleccionado, 1);
        actualizaTabla();
        limpiar();
    }
}

document.getElementById("btnLimpiar").addEventListener("click", limpiar);

actualizaTabla();

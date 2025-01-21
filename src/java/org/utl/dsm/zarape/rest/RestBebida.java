package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.utl.dsm.zarape.controller.ControllerBebida;
import org.utl.dsm.zarape.model.Bebida;
import org.utl.dsm.zarape.model.Categoria;
import org.utl.dsm.zarape.model.Producto;

@Path("bebidas")
public class RestBebida extends Application {

    private final Gson gson = new Gson();
    private final ControllerBebida controller = new ControllerBebida();

    // Agregar una bebida
    @Path("insert")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertBebida(String jsonInput) {
        ControllerBebida controller = new ControllerBebida();
        try {
            Bebida bebida = gson.fromJson(jsonInput, Bebida.class);
            controller.insert(bebida);
            return Response.ok("""
              {"result":"Bebida agregada correctamente"}
              """).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("""
              {"result":"Error al agregar la bebida"}
              """).build();
        }
    }

    // Obtener todas las bebidas
    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllBebidas() {
        ControllerBebida controller = new ControllerBebida();
        try {
            List<Bebida> bebidas = controller.getAllBebidas();
            return Response.ok(gson.toJson(bebidas)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("""
              {"result":"Error al obtener las bebidas"}
              """).build();
        }
    }

    // Actualizar una bebida
    @Path("update")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateBebida(String jsonInput) {
        ControllerBebida controller = new ControllerBebida();
        try {
            Producto producto = gson.fromJson(jsonInput, Producto.class);
            controller.updateBebida(producto);
            return Response.ok("""
              {"result":"Bebida actualizada correctamente"}
              """).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("""
              {"result":"Error al actualizar la bebida"}
              """).build();
        }
    }

    
    // Buscar bebidas
@Path("search/{filtro}")
@GET
@Produces(MediaType.APPLICATION_JSON)
public Response searchBebidas(@PathParam("filtro") String filtro) {
    try {
        // Llamar al controlador que ejecuta el procedimiento almacenado
        List<Bebida> bebidas = controller.searchBebidas(filtro);

        // Convertir la lista de bebidas a un formato JSON
        List<Map<String, Object>> respuesta = new ArrayList<>();
        for (Bebida bebida : bebidas) {
            Map<String, Object> productoData = new HashMap<>();
            Producto producto = bebida.getProducto(); // Obtener el producto de la bebida

            productoData.put("idBebida", bebida.getIdBebida());
            productoData.put("nombreProducto", producto.getNombre());
            productoData.put("descripcionProducto", producto.getDescripcion());
            productoData.put("precio", producto.getPrecio());
            productoData.put("foto", producto.getFoto());
            productoData.put("activo", producto.getActivo());

            // Agregar información de la categoría
            if (producto.getCategoria() != null) {
                Categoria categoria = producto.getCategoria();
                productoData.put("categoria", Map.of(
                    "idCategoria", categoria.getIdCategoria(),
                    "descripcion", categoria.getDescripcion(),
                    "tipo", categoria.getTipo(),
                    "activo", categoria.getActivo()
                ));
            }

            respuesta.add(productoData);
        }

        return Response.ok(new Gson().toJson(respuesta)).build();
    } catch (Exception e) {
        e.printStackTrace();
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"Error al realizar la búsqueda de bebidas: " + e.getMessage() + "\"}")
                .build();
    }
}

// Cambiar estatus de una bebida
@Path("cambiarEstatus/{idProducto}")
@PUT
@Produces(MediaType.APPLICATION_JSON)
public Response cambiarEstatusBebida(@PathParam("idProducto") int idProducto) {
    ControllerBebida controller = new ControllerBebida();
    try {
        controller.cambiarEstatus(idProducto);
        return Response.ok("""
          {"result":"Estatus de la bebida actualizado correctamente"}
          """).build();
    } catch (Exception e) {
        e.printStackTrace();
        return Response.serverError().entity("""
          {"result":"Error al cambiar el estatus de la bebida"}
          """).build();
    }
}


    
}

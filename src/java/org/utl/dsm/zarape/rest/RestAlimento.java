package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.utl.dsm.zarape.controller.ControllerAlimento;
import org.utl.dsm.zarape.model.Alimento;
import org.utl.dsm.zarape.model.Bebida;
import org.utl.dsm.zarape.model.Categoria;
import org.utl.dsm.zarape.model.Producto;

@Path("alimento")
public class RestAlimento extends Application {

    private final Gson gson = new Gson();
    private final ControllerAlimento controller = new ControllerAlimento();

    // Agregar un alimento
    @Path("insert")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertAlimento(String jsonInput) {
        ControllerAlimento controller = new ControllerAlimento();
        Gson gson = new Gson();
        String out;

        try {
            Alimento alimento = gson.fromJson(jsonInput, Alimento.class);
            controller.insert(alimento);
            out = """
                  {"result":"Alimento agregado correctamente"}
                  """;
        } catch (Exception e) {
            out = """
                  {"result":"Error al agregar el alimento"}
                  """;
        }

        return Response.ok(out).build();
    }

    // Obtener todos los alimentos
    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllAlimentos() {
        ControllerAlimento controller = new ControllerAlimento();
        Gson gson = new Gson();

        try {
            String out = gson.toJson(controller.getAllAlimentos());
            return Response.ok(out).build();
        } catch (Exception e) {
            return Response.serverError().entity("""
                  {"result":"Error al obtener los alimentos"}
                  """).build();
        }
    }

    // Actualizar un alimento
    @Path("update")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateAlimento(String jsonInput) {
        ControllerAlimento controller = new ControllerAlimento();
        Gson gson = new Gson();
        String out;

        try {
            Producto producto = gson.fromJson(jsonInput, Producto.class);
            controller.updateAlimento(producto);
            out = """
                  {"result":"Alimento actualizado correctamente"}
                  """;
        } catch (Exception e) {
            out = """
                  {"result":"Error al actualizar el alimento"}
                  """;
        }

        return Response.ok(out).build();
    }

    // Eliminar un alimento (cambiar a inactivo)
    @Path("delete/{idProducto}")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteAlimento(@PathParam("idProducto") int idProducto) {
        ControllerAlimento controller = new ControllerAlimento();
        String out;

        try {
            controller.deleteProducto(idProducto);
            out = """
              {"result":"Alimento eliminado correctamente"}
              """;
        } catch (Exception e) {
            out = """
              {"result":"Error al eliminar el alimento"}
              """;
        }

        return Response.ok(out).build();
    }

    @Path("search/{filtro}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchAlimentos(@PathParam("filtro") String filtro) {
        try {
            // Llamar al controlador que ejecuta el procedimiento almacenado
            List<Alimento> alimentos = controller.searchAlimentos(filtro);

            // Convertir la lista de alimentos a un formato JSON
            List<Map<String, Object>> respuesta = new ArrayList<>();
            for (Alimento alimento : alimentos) {
                Map<String, Object> productoData = new HashMap<>();
                Producto producto = alimento.getProducto(); // Obtener el producto del alimento

                productoData.put("idAlimento", alimento.getIdAlimento());
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

            // Asegurarse de que la respuesta sea un array
            return Response.ok(new Gson().toJson(respuesta)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al realizar la búsqueda de alimentos: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @Path("getallCliente")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllAlimentosCliente() {
        ControllerAlimento controller = new ControllerAlimento();
        Gson gson = new Gson();

        try {
            String out = gson.toJson(controller.getAllAlimentosCliente());
            return Response.ok(out).build();
        } catch (Exception e) {
            return Response.serverError().entity("""
                  {"result":"Error al obtener los alimentos"}
                  """).build();
        }
    }
}

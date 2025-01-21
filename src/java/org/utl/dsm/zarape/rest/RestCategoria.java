package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.zarape.controller.ControllerCategoria;
import org.utl.dsm.zarape.model.Categoria;

import java.util.List;

@Path("categoria")
public class RestCategoria extends Application {

    // Agregar una categoría
    @Path("insert")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertCategoria(String jsonInput) {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();
        String out;

        try {
            Categoria categoria = gson.fromJson(jsonInput, Categoria.class);
            controller.insert(categoria);

            out = """
          {"result":"Categoría agregada correctamente"}
          """;
        } catch (Exception e) {
            e.printStackTrace();
            out = """
          {"result":"Error al agregar la categoría", "error":"%s"}
          """.formatted(e.getMessage());
        }

        return Response.ok(out).build();
    }

    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllCategorias() {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();

        try {
            List<Categoria> categorias = controller.getAllCategorias();
            String out = gson.toJson(categorias);
            return Response.ok(out).build();
        } catch (Exception e) {
            e.printStackTrace(); // Registrar el error en la consola del servidor
            return Response.serverError().entity("""
            {"result":"Error al obtener las categorías", "error":"%s"}
            """.formatted(e.getMessage())).build();
        }
    }

    // Actualizar una categoría
    @Path("update")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateCategoria(String jsonInput) {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();
        String out;

        try {
            Categoria categoria = gson.fromJson(jsonInput, Categoria.class);
            controller.updateCategoria(categoria);
            out = """
              {"result":"Categoría actualizada correctamente"}
              """;
        } catch (Exception e) {
            out = """
              {"result":"Error al actualizar la categoría"}
              """;
        }

        return Response.ok(out).build();
    }

    // Eliminar una categoría (cambiar a inactivo)
    @Path("delete")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteCategoria(String jsonInput) {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();
        String out;

        try {
            // Parsear el JSON para obtener el ID de la categoría
            Categoria categoria = gson.fromJson(jsonInput, Categoria.class);
            controller.deleteCategoria(categoria.getIdCategoria()); // Llamada al método del controlador

            out = """
              {"result":"Estatus de la categoría cambiado correctamente"}
              """;
        } catch (Exception e) {
            e.printStackTrace(); // Imprime el error exacto en los logs
            out = """
              {"result":"Error al cambiar el estatus de la categoría", "error":"%s"}
              """.formatted(e.getMessage());
        }

        return Response.ok(out).build();
    }

    @Path("search")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchCategoria(@QueryParam("descripcion") String descripcion) {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();

        try {
            List<Categoria> categorias = controller.searchCategoria(descripcion);
            String out = gson.toJson(categorias);
            return Response.ok(out).build();
        } catch (Exception e) {
            return Response.serverError().entity("""
            {"result":"Error al buscar categorías"}
            """).build();
        }
    }

    @Path("getall/bebidas")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCategoriasBebidas() {
        ControllerCategoria controller = new ControllerCategoria();
        Gson gson = new Gson();

        try {
            List<Categoria> categorias = controller.getCategoriasByTipo("B"); // Solo tipo "bebida"
            String out = gson.toJson(categorias);
            return Response.ok(out).build();
        } catch (Exception e) {
            return Response.serverError().entity("""
        {"result":"Error al obtener las categorías"}
        """).build();
        }
    }

}

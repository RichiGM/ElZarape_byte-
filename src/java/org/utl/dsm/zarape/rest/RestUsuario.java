package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.apache.commons.codec.digest.DigestUtils;
import org.utl.dsm.zarape.controller.ControllerUsuario;
import org.utl.dsm.zarape.model.Persona;
import org.utl.dsm.zarape.model.Usuario;

@Path("usuario")
public class RestUsuario extends Application {

    // Agregar Usuario
    @Path("insert")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertUsuario(
            @FormParam("nombreUsuario") @DefaultValue("") String nombreUsuario,
            @FormParam("contrasenia") @DefaultValue("") String contrasenia,
            @FormParam("nombrePersona") @DefaultValue("") String nombrePersona,
            @FormParam("apellidosPersona") @DefaultValue("") String apellidosPersona,
            @FormParam("telefono") @DefaultValue("") String telefono,
            @FormParam("idCiudad") @DefaultValue("0") int idCiudad,
            @FormParam("tipoEntidad") @DefaultValue("") String tipoEntidad,
            @FormParam("idSucursal") @DefaultValue("0") int idSucursal
    ) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        try {
            String passwordHash = DigestUtils.sha256Hex(contrasenia);
            Usuario usuario = new Usuario(0, nombreUsuario, passwordHash, 1);
            Persona persona = new Persona(0, nombrePersona, apellidosPersona, telefono, idCiudad, "");

            controller.insert(usuario, persona, tipoEntidad, idSucursal == 0 ? null : idSucursal);

            out = """
                  {"result":"Usuario agregado correctamente"}
                  """;
        } catch (Exception e) {
            e.printStackTrace();
            out = """
                  {"result":"Error al agregar el usuario"}
                  """;
        }
        return Response.status(Response.Status.CREATED).entity(out).build();
    }

    // Modificar Usuario
    // Modificar Usuario (sin modificar contraseña)
    @Path("updateSinContrasenia")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateUsuarioSinContrasenia(String jsonInput) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        Gson gson = new Gson();
        try {
            System.out.println("JSON recibido en el REST (Sin Contraseña): " + jsonInput);

            JsonObject jsonObject = gson.fromJson(jsonInput, JsonObject.class);

            // Procesar el JSON
            int idUsuario = jsonObject.get("idUsuario").getAsInt();
            String nombreUsuario = jsonObject.get("nombreUsuario").getAsString();
            int idPersona = jsonObject.get("idPersona").getAsInt();
            String nombrePersona = jsonObject.get("nombrePersona").getAsString();
            String apellidosPersona = jsonObject.get("apellidosPersona").getAsString();
            String telefono = jsonObject.get("telefono").getAsString();
            int idCiudad = jsonObject.get("idCiudad").getAsInt();
            String tipoEntidad = jsonObject.get("tipoEntidad").getAsString();
            Integer idSucursal = jsonObject.has("idSucursal") && !jsonObject.get("idSucursal").isJsonNull()
                    ? jsonObject.get("idSucursal").getAsInt()
                    : null;

            // Crear objetos sin contraseña
            Usuario usuario = new Usuario(idUsuario, nombreUsuario, null, 1);
            Persona persona = new Persona(idPersona, nombrePersona, apellidosPersona, telefono, idCiudad, "");

            System.out.println("Datos deserializados correctamente (Sin Contraseña).");

            // Llamar al controlador
            controller.updateSinContrasenia(usuario, persona, tipoEntidad, idSucursal);

            out = """
          {"result":"Usuario modificado correctamente (Sin Contraseña)"}
          """;
        } catch (Exception e) {
            e.printStackTrace();
            out = String.format("""
          {"result":"Error al modificar el usuario (Sin Contraseña): %s"}
          """, e.getMessage());
        }
        return Response.ok(out).build();
    }

// Modificar solo la contraseña del usuario
    @Path("updatePassword")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateUsuarioContrasenia(String jsonInput) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        Gson gson = new Gson();
        try {
            System.out.println("JSON recibido en el REST (Solo Contraseña): " + jsonInput);

            JsonObject jsonObject = gson.fromJson(jsonInput, JsonObject.class);

            // Procesar el JSON
            int idUsuario = jsonObject.get("idUsuario").getAsInt();
            String nuevaContrasenia = jsonObject.get("nuevaContrasenia").getAsString();

            // Encriptar la nueva contraseña
            String passwordHash = DigestUtils.sha256Hex(nuevaContrasenia);

            System.out.println("Datos deserializados correctamente (Solo Contraseña).");

            // Llamar al controlador para modificar solo la contraseña
            controller.updateContrasenia(idUsuario, passwordHash);

            out = """
          {"result":"Contraseña modificada correctamente"}
          """;
        } catch (Exception e) {
            e.printStackTrace();
            out = String.format("""
          {"result":"Error al modificar la contraseña: %s"}
          """, e.getMessage());
        }
        return Response.ok(out).build();
    }

    // Cambiar Estatus
    @Path("cambiarEstatus")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarEstatus(
            @FormParam("idUsuario") @DefaultValue("0") int idUsuario) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        try {
            controller.cambiarEstatus(idUsuario);

            out = """
                  {"result":"Estatus cambiado correctamente"}
                  """;
        } catch (Exception e) {
            e.printStackTrace();
            out = """
                  {"result":"Error al cambiar el estatus"}
                  """;
        }
        return Response.ok(out).build();
    }

    // Obtener todos los usuarios
    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllUsuarios() {
        String out;
        try {
            ControllerUsuario controller = new ControllerUsuario();
            Gson gson = new Gson();

            out = gson.toJson(controller.getAllUsuarios());
        } catch (Exception e) {
            e.printStackTrace();
            out = String.format("""
              {"result":"Error al obtener los usuarios: %s"}
              """, e.getMessage());
        }
        return Response.ok(out).build();
    }

    @Path("search")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchUsuarios(@QueryParam("nombreUsuario") String nombreUsuario) {
        String out;
        ControllerUsuario controller = new ControllerUsuario();
        Gson gson = new Gson();

        try {
            out = gson.toJson(controller.searchUsuarios(nombreUsuario));
        } catch (Exception e) {
            e.printStackTrace();
            out = """
              {"result":"Error al buscar los usuarios"}
              """;
        }
        return Response.ok(out).build();
    }

}

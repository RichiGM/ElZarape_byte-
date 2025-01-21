package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.zarape.controller.ControllerEstado;

@Path("estado")
public class RestEstado extends Application {

    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllEstados() {
        String out;
        try {
            System.out.println("Iniciando el endpoint /estado/getall");
            ControllerEstado controller = new ControllerEstado();
            Gson gson = new Gson();
            out = gson.toJson(controller.getAllEstados());
        } catch (Exception e) {
            e.printStackTrace();
            out = """
                  {"result":"Error al obtener los estados"}
                  """;
        }
        return Response.ok(out).build();
    }
}


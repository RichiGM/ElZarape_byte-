/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.zarape.controller.ControllerCiudad;

/**
 *
 * @author Ricardo
 */
@Path("ciudad")
public class RestCiudad extends Application {
    @Path("getbyestado")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCiudadesByEstado(@QueryParam("idEstado") int idEstado) {
        String out;
        try {
            ControllerCiudad controller = new ControllerCiudad();
            Gson gson = new Gson();
            out = gson.toJson(controller.getCiudadesPorEstado(idEstado));
        } catch (Exception e) {
            e.printStackTrace();
            out = """
                  {"result":"Error al obtener las ciudades"}
                  """;
        }
        return Response.ok(out).build();
    }
    
    @Path("getall")
@GET
@Produces(MediaType.APPLICATION_JSON)
public Response getAllCiudadesConEstados() {
    String out;
    try {
        ControllerCiudad controller = new ControllerCiudad();
        Gson gson = new Gson();

        // Llamar al método del controlador
        out = gson.toJson(controller.getAllCiudadesConEstados());
    } catch (Exception e) {
        System.err.println("Error en RestCiudad - getAllCiudadesConEstados:");
        e.printStackTrace(); // Logs para identificar el error exacto
        out = """
              {"result":"Error al obtener las ciudades con estados"}
              """;
    }
    return Response.ok(out).build();
}

    
}
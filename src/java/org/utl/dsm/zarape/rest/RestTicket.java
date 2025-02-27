package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.zarape.controller.ControllerTicket;
import org.utl.dsm.zarape.model.Ticket;
import org.utl.dsm.zarape.model.DetalleTicket;

@Path("ticket")
public class RestTicket extends Application {

    private final Gson gson = new Gson();
    private final ControllerTicket controller = new ControllerTicket();

    // Agregar un ticket
    @Path("insert")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertTicket(String jsonInput) {
        String out;
        try {
            Ticket ticket = gson.fromJson(jsonInput, Ticket.class);
            controller.insertTicket(ticket);
            out = "{\"result\":\"Ticket agregado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al agregar el ticket\"}";
        }
        return Response.ok(out).build();
    }

    // Cambiar estatus de un ticket
    @Path("estatus")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarEstatus(@QueryParam("idTicket") int idTicket, @QueryParam("estatus") int estatus) {
        String out;
        try {
            controller.cambiarEstatusTicket(idTicket, estatus);
            out = "{\"result\":\"Estatus del ticket cambiado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al cambiar el estatus del ticket\"}";
        }
        return Response.ok(out).build();
    }

    // Cambiar pagado de un ticket
    @Path("pagado")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarPagado(@QueryParam("idTicket") int idTicket, @QueryParam("pagado") String pagado) {
        String out;
        try {
            controller.cambiarPagadoTicket(idTicket, pagado);
            out = "{\"result\":\"Estado de pago cambiado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al cambiar el estado de pago\"}";
        }
        return Response.ok(out).build();
    }

    // Agregar detalle a un ticket
    @Path("detalle/insert")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertDetalle(String jsonInput) {
        String out;
        try {
            DetalleTicket detalle = gson.fromJson(jsonInput, DetalleTicket.class);
            controller.agregarDetalleTicket(detalle);
            out = "{\"result\":\"Detalle agregado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al agregar el detalle\"}";
        }
        return Response.ok(out).build();
    }
}
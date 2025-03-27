package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.utl.dsm.zarape.controller.ControllerTicket;
import org.utl.dsm.zarape.model.Ticket;
import org.utl.dsm.zarape.model.DetalleTicket;
import java.util.List;
import org.utl.dsm.zarape.model.Comanda;

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
            int ticketId = controller.insertTicket(ticket); // Obtener el ID del ticket insertado
            out = "{\"result\":\"Ticket agregado correctamente\", \"ticketId\":" + ticketId + "}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al agregar el ticket: " + e.getMessage() + "\"}";
        }
        return Response.ok(out).build();
    }

    // Cambiar estatus de un ticket
    @Path("estatus")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarEstatus(@QueryParam("idTicket") int idTicket) {
        String out;
        try {
            controller.cambiarEstatusTicket(idTicket);
            out = "{\"result\":\"Estatus del ticket cambiado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al cambiar el estatus del ticket: " + e.getMessage() + "\"}";
        }
        return Response.ok(out).build();
    }

    // Cambiar pagado de un ticket
    @Path("pagado")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response cambiarPagado(@QueryParam("idTicket") int idTicket) {
        String out;
        try {
            controller.cambiarPagadoTicket(idTicket);
            out = "{\"result\":\"Estado de pago cambiado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al cambiar el estado de pago: " + e.getMessage() + "\"}";
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
            out = "{\"result\":\"Error al agregar el detalle: " + e.getMessage() + "\"}";
        }
        return Response.ok(out).build();
    }

    // Obtener todas las comandas para la cola de pedidos
    @Path("getallQueue")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllQueue() {
        String out;
        try {
            List<Comanda> comandas = controller.getAllQueue();
            out = gson.toJson(comandas);
        } catch (Exception e) {
            out = "{\"result\":\"Error al obtener la cola de pedidos: " + e.getMessage() + "\"}";
        }
        return Response.ok(out).build();
    }

    // Actualizar el estatus de una comanda
    @Path("updateEstatus")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateEstatus(@QueryParam("idComanda") int idComanda, @QueryParam("estatus") int estatus) {
        String out;
        try {
            controller.updateEstatus(idComanda, estatus);
            out = "{\"result\":\"Estatus actualizado correctamente\"}";
        } catch (Exception e) {
            out = "{\"result\":\"Error al actualizar el estatus: " + e.getMessage() + "\"}";
        }
        return Response.ok(out).build();
    }
}
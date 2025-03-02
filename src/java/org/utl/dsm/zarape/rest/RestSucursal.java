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
import org.utl.dsm.zarape.controller.ControllerCiudad;
import org.utl.dsm.zarape.controller.ControllerEstado;
import org.utl.dsm.zarape.controller.ControllerSucursal;
import org.utl.dsm.zarape.model.Ciudad;
import org.utl.dsm.zarape.model.Estado;
import org.utl.dsm.zarape.model.Sucursal;

@Path("sucursal")
public class RestSucursal extends Application {

    private final Gson gson = new Gson();
    private final ControllerSucursal controller = new ControllerSucursal();

    // Obtener todas las sucursales
    @Path("getall")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSucursales() {
        try {
            List<Sucursal> sucursales = controller.getAllSucursales();

            // Convertir la lista de sucursales a un formato JSON
            List<Map<String, Object>> respuesta = new ArrayList<>();
            for (Sucursal sucursal : sucursales) {
                Map<String, Object> sucursalData = new HashMap<>();
                sucursalData.put("idSucursal", sucursal.getIdSucursal());
                sucursalData.put("nombre", sucursal.getNombre());
                sucursalData.put("latitud", sucursal.getLatitud());
                sucursalData.put("longitud", sucursal.getLongitud());
                sucursalData.put("foto", sucursal.getFoto());
                sucursalData.put("urlWeb", sucursal.getUrlWeb());
                sucursalData.put("horarios", sucursal.getHorarios());
                sucursalData.put("calle", sucursal.getCalle());
                sucursalData.put("numCalle", sucursal.getNumCalle());
                sucursalData.put("colonia", sucursal.getColonia());

                // Construir el objeto ciudad
                if (sucursal.getCiudad() != null) {
                    Map<String, Object> ciudadData = new HashMap<>();
                    ciudadData.put("idCiudad", sucursal.getCiudad().getIdCiudad());
                    ciudadData.put("nombre", sucursal.getCiudad().getNombre());
                    ciudadData.put("idEstado", sucursal.getCiudad().getIdEstado());
                    sucursalData.put("ciudad", ciudadData);
                } else {
                    sucursalData.put("ciudad", null);
                }

                // Construir el objeto estado
                if (sucursal.getEstado() != null) {
                    Map<String, Object> estadoData = new HashMap<>();
                    estadoData.put("idEstado", sucursal.getEstado().getIdEstado());
                    estadoData.put("nombre", sucursal.getEstado().getNombre());
                    sucursalData.put("estado", estadoData);
                } else {
                    sucursalData.put("estado", null);
                }

                sucursalData.put("sucursalActivo", sucursal.getActivo());
                respuesta.add(sucursalData);
            }

            return Response.ok(new Gson().toJson(respuesta)).build();
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Error desconocido";
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + errorMessage + "\"}")
                    .build();
        }
    }

    @Path("add")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertSucursal(String json) {
        try {
            System.out.println("JSON recibido: " + json); // Log para verificar JSON
            Sucursal sucursal = gson.fromJson(json, Sucursal.class);

            // Validar que el campo ciudad no sea null
            if (sucursal.getCiudad() == null || sucursal.getCiudad().getIdCiudad() <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"El campo 'ciudad' es obligatorio y debe tener un 'idCiudad' válido.\"}")
                        .build();
            }

            controller.insertSucursal(sucursal);
            return Response.ok("{\"message\":\"Sucursal agregada correctamente\"}").build();
        } catch (Exception e) {
            e.printStackTrace(); // Imprime el error en los logs
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al agregar la sucursal: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    // Modificar una sucursal
    @Path("update")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateSucursal(String json) {
        try {
            Sucursal sucursal = gson.fromJson(json, Sucursal.class);

            // Validar que el campo ciudad no sea null
            if (sucursal.getCiudad() == null || sucursal.getCiudad().getIdCiudad() <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"El campo 'ciudad' es obligatorio y debe tener un 'idCiudad' válido.\"}")
                        .build();
            }

            controller.updateSucursal(sucursal);
            return Response.ok("{\"message\":\"Sucursal modificada correctamente\"}").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al modificar la sucursal: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    // Cambiar estatus de una sucursal
    @Path("delete/{id}")
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteSucursal(@PathParam("id") int idSucursal) {
        try {
            controller.deleteSucursal(idSucursal);
            return Response.ok("{\"message\":\"Estatus de la sucursal cambiado correctamente\"}").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al cambiar el estatus de la sucursal: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @Path("getestados")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getEstados() {
        try {
            ControllerEstado controller = new ControllerEstado();
            List<Estado> estados = controller.getAllEstados();
            return Response.ok(new Gson().toJson(estados)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al obtener los estados: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @Path("getciudades/{idEstado}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCiudadesPorEstado(@PathParam("idEstado") int idEstado) {
        try {
            ControllerCiudad controller = new ControllerCiudad();
            List<Ciudad> ciudades = controller.getCiudadesPorEstado(idEstado);
            return Response.ok(new Gson().toJson(ciudades)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al obtener las ciudades: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @Path("search/{filtro}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchSucursales(@PathParam("filtro") String filtro) {
        try {
            List<Sucursal> sucursales = controller.searchSucursales(filtro);

            // Convertir la lista de sucursales a un formato JSON
            List<Map<String, Object>> respuesta = new ArrayList<>();
            for (Sucursal sucursal : sucursales) {
                Map<String, Object> sucursalData = new HashMap<>();
                sucursalData.put("idSucursal", sucursal.getIdSucursal());
                sucursalData.put("nombre", sucursal.getNombre());
                sucursalData.put("latitud", sucursal.getLatitud());
                sucursalData.put("longitud", sucursal.getLongitud());
                sucursalData.put("foto", sucursal.getFoto());
                sucursalData.put("urlWeb", sucursal.getUrlWeb());
                sucursalData.put("horarios", sucursal.getHorarios());
                sucursalData.put("calle", sucursal.getCalle());
                sucursalData.put("numCalle", sucursal.getNumCalle());
                sucursalData.put("colonia", sucursal.getColonia());

                if (sucursal.getCiudad() != null) {
                    sucursalData.put("ciudad", Map.of(
                            "idCiudad", sucursal.getCiudad().getIdCiudad(),
                            "nombre", sucursal.getCiudad().getNombre(),
                            "idEstado", sucursal.getCiudad().getIdEstado()
                    ));
                }

                if (sucursal.getEstado() != null) {
                    sucursalData.put("estado", Map.of(
                            "idEstado", sucursal.getEstado().getIdEstado(),
                            "nombre", sucursal.getEstado().getNombre()
                    ));
                }

                // Retornar el atributo sucursalActivo correctamente
                sucursalData.put("sucursalActivo", sucursal.getActivo());

                respuesta.add(sucursalData);
            }

            return Response.ok(new Gson().toJson(respuesta)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Error al realizar la búsqueda de sucursales: " + e.getMessage() + "\"}")
                    .build();
        }
    }
    
    @Path("getallCliente")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSucursalesCliente() {
        try {
            List<Sucursal> sucursales = controller.getAllSucursalesCliente();

            // Convertir la lista de sucursales a un formato JSON
            List<Map<String, Object>> respuesta = new ArrayList<>();
            for (Sucursal sucursal : sucursales) {
                Map<String, Object> sucursalData = new HashMap<>();
                sucursalData.put("idSucursal", sucursal.getIdSucursal());
                sucursalData.put("nombre", sucursal.getNombre());
                sucursalData.put("latitud", sucursal.getLatitud());
                sucursalData.put("longitud", sucursal.getLongitud());
                sucursalData.put("foto", sucursal.getFoto());
                sucursalData.put("urlWeb", sucursal.getUrlWeb());
                sucursalData.put("horarios", sucursal.getHorarios());
                sucursalData.put("calle", sucursal.getCalle());
                sucursalData.put("numCalle", sucursal.getNumCalle());
                sucursalData.put("colonia", sucursal.getColonia());

                // Construir el objeto ciudad
                if (sucursal.getCiudad() != null) {
                    Map<String, Object> ciudadData = new HashMap<>();
                    ciudadData.put("idCiudad", sucursal.getCiudad().getIdCiudad());
                    ciudadData.put("nombre", sucursal.getCiudad().getNombre());
                    ciudadData.put("idEstado", sucursal.getCiudad().getIdEstado());
                    sucursalData.put("ciudad", ciudadData);
                } else {
                    sucursalData.put("ciudad", null);
                }

                // Construir el objeto estado
                if (sucursal.getEstado() != null) {
                    Map<String, Object> estadoData = new HashMap<>();
                    estadoData.put("idEstado", sucursal.getEstado().getIdEstado());
                    estadoData.put("nombre", sucursal.getEstado().getNombre());
                    sucursalData.put("estado", estadoData);
                } else {
                    sucursalData.put("estado", null);
                }

                sucursalData.put("sucursalActivo", sucursal.getActivo());
                respuesta.add(sucursalData);
            }

            return Response.ok(new Gson().toJson(respuesta)).build();
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Error desconocido";
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + errorMessage + "\"}")
                    .build();
        }
    }
}

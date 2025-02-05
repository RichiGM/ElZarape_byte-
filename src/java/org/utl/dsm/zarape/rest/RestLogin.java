package org.utl.dsm.zarape.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.JsonObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.utl.dsm.zarape.controller.ControllerUsuario;
import org.utl.dsm.zarape.model.LoginRequest;

@Path("login")
public class RestLogin {

    @Path("validate")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response validateUser(String jsonString) {
        JsonObject json = new Gson().fromJson(jsonString, JsonObject.class);
        String username = json.get("username").getAsString();
        String password = json.get("password").getAsString();
        String passwordHash = DigestUtils.sha256Hex(password);
        ControllerUsuario controller = new ControllerUsuario();
        boolean isValid = controller.validateUser(username, passwordHash);

        JsonObject response = new JsonObject();
        response.addProperty("success", isValid);

        return Response.ok(response.toString()).build();
    }

}

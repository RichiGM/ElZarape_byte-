package org.utl.dsm.zarape.rest;

import jakarta.annotation.Priority;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Response;
import java.io.IOException;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class RestFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();

        // 🔹 Permitir acceso libre a login, logout y cheecky
        if (path.contains("usuario/logout") || path.contains("usuario/cheecky") || path.contains("login/validate")) {
            return; // No se requiere autenticación para estas rutas
        }

        // 🔹 Obtener el lastToken desde los headers
        String lastToken = requestContext.getHeaderString("Authorization");

        // 🔹 Si no hay token, bloquear la solicitud con un 401 Unauthorized
        if (lastToken == null || lastToken.isEmpty()) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"error\":\"Acceso denegado: Token inválido o ausente.\"}")
                .build());
        }
    }
}

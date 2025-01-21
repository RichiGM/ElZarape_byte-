package org.utl.dsm.zarape.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No se requiere inicialización en este caso
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Configuración de encabezados CORS
        httpResponse.setHeader("Access-Control-Allow-Origin", "*"); // Permitir todos los orígenes
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Métodos permitidos
        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Encabezados permitidos
        httpResponse.setHeader("Access-Control-Expose-Headers", "Content-Type, Authorization"); // Encabezados visibles para el cliente

        // Si la solicitud es de tipo OPTIONS, finaliza la respuesta
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Continuar con el resto de la cadena de filtros
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // No se requiere limpieza en este caso
    }
}

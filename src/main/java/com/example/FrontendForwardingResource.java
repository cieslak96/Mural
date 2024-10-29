package com.example;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.InputStream;

@Path("/{path:.*}") // Catch-all path for React routes
public class FrontendForwardingResource {

    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response serveFrontend() {
        try {
            // Load index.html from classpath
            InputStream inputStream = getClass().getResourceAsStream("/META-INF/resources/index.html");

            if (inputStream == null) {
                // Return 404 if index.html is not found
                return Response.status(Response.Status.NOT_FOUND)
                               .entity("File not found: index.html")
                               .build();
            }

            // Read the content of index.html
            String content = new String(inputStream.readAllBytes());

            // Return the content of index.html as response
            return Response.ok(content).build();
        } catch (Exception e) {
            // Handle errors such as file not being found
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity("Error: " + e.getMessage())
                           .build();
        }
    }
}


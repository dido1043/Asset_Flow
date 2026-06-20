package org.af.assetflowapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME_NAME = "bearerAuth";
    private static final String COOKIE_SCHEME_NAME = "jwtCookie";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Asset Flow API Documentation")
                        .version("1.0.0")
                        .description("Documentation for the API endpoints. Authenticate by calling "
                                + "POST /auth/login (sets the httpOnly `jwt` cookie that is sent automatically "
                                + "on subsequent requests), or paste a JWT into the bearerAuth dialog."))
                .addSecurityItem(new SecurityRequirement()
                        .addList(BEARER_SCHEME_NAME)
                        .addList(COOKIE_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME_NAME, new SecurityScheme()
                                .name(BEARER_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT"))
                        .addSecuritySchemes(COOKIE_SCHEME_NAME, new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("jwt")));
    }

    /**
     * Documents the 401 response on every operation so Swagger UI shows
     * "401 Unauthorized" instead of "Undocumented" when a request is not authenticated.
     */
    @Bean
    public OpenApiCustomizer documentUnauthorizedResponse() {
        return openApi -> openApi.getPaths().values().forEach(pathItem ->
                pathItem.readOperations().forEach(operation ->
                        operation.getResponses().addApiResponse("401",
                                new ApiResponse().description("Unauthorized - missing or invalid authentication"))));
    }
}

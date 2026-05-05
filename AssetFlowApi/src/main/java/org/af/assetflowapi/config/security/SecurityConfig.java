package org.af.assetflowapi.config.security;

import lombok.RequiredArgsConstructor;
import org.af.assetflowapi.config.JwtAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        @Value("${frontend.url:*}")
        private String frontendUrl;

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider;

   
    @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

            CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
            csrfRequestHandler.setCsrfRequestAttributeName(null);

            http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .csrf(csrf -> csrf
                            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .csrfTokenRequestHandler(csrfRequestHandler)
                            .ignoringRequestMatchers("/auth/login", "/auth/register", "/auth/oauth2/**", "/auth/oauth/exchange", "/auth/logout")
                    )
                    .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(
                                    "/auth/login",
                                    "/auth/register",
                                    "/auth/oauth2/**",
                                    "/auth/oauth/exchange",
                                    "/auth/loginSuccess",
                                    "/auth/logout",
                                    "/swagger-ui/**",
                                    "/v3/api-docs/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .sessionManagement(
                            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authenticationProvider(authenticationProvider)
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            if (clientRegistrationRepositoryProvider.getIfAvailable() != null) {
                http.oauth2Login(oAuth2 -> oAuth2
                        .loginPage("/auth/oauth2/login")
                        .defaultSuccessUrl("/auth/loginSuccess", true)
                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestRepository(new HttpCookieOAuth2AuthorizationRequestRepository()))
                        .permitAll());
            }
            return http.build();
    }

    @Bean
        CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-XSRF-TOKEN"));
                configuration.setExposedHeaders(List.of("Content-Disposition", "X-Total-Count"));
                configuration.setAllowCredentials(true);
                configuration.setAllowedOriginPatterns(List.of(frontendUrl));
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}

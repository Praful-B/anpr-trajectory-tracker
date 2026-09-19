package com.sih.backend.auth.config;

import com.sih.backend.auth.token.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/register").permitAll()
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/refresh").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/v1/health").permitAll()
                // CITIZEN
                .requestMatchers(HttpMethod.POST, "/api/v1/complaints").hasAuthority("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/v1/complaints/my").hasAuthority("CITIZEN")
                .requestMatchers(HttpMethod.POST, "/api/v1/complaints/*/fir").hasAuthority("CITIZEN")
                // VOLUNTEER / DEVICE
                .requestMatchers(HttpMethod.POST, "/api/v1/devices/register").hasAnyAuthority("VOLUNTEER", "DEVICE")
                .requestMatchers(HttpMethod.GET, "/api/v1/hotlist/sync").hasAnyAuthority("VOLUNTEER", "DEVICE")
                .requestMatchers(HttpMethod.POST, "/api/v1/sightings/ingest").hasAnyAuthority("VOLUNTEER", "DEVICE")
                // COP
                .requestMatchers(HttpMethod.GET, "/api/v1/hotlist").hasAuthority("COP")
                .requestMatchers(HttpMethod.GET, "/api/v1/hotlist/*").hasAuthority("COP")
                .requestMatchers(HttpMethod.PUT, "/api/v1/hotlist/*/verify-fir").hasAuthority("COP")
                .requestMatchers(HttpMethod.PUT, "/api/v1/hotlist/*/mark-recovered").hasAuthority("COP")
                .requestMatchers(HttpMethod.GET, "/api/v1/sightings").hasAuthority("COP")
                .requestMatchers(HttpMethod.GET, "/api/v1/sightings/plate/*").hasAuthority("COP")
                .requestMatchers(HttpMethod.GET, "/api/v1/audit/**").hasAnyAuthority("COP", "ADMIN")
                // ADMIN
                .requestMatchers(HttpMethod.POST, "/api/v1/admin/users").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/admin/users/*/role").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/admin/users").hasAuthority("ADMIN")
                
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

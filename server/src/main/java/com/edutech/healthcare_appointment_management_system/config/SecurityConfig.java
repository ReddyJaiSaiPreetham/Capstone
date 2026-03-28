package com.edutech.healthcare_appointment_management_system.config;

import com.edutech.healthcare_appointment_management_system.jwt.JwtRequestFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;
    private final JwtRequestFilter jwtRequestFilter;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(UserDetailsService userDetailsService,
                          JwtRequestFilter jwtRequestFilter,
                          PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.csrf().disable()
            .authorizeRequests()

            // PUBLIC APIs
            .antMatchers(
                "/api/patient/register",
                "/api/doctors/register",
                "/api/receptionist/register",
                "/api/user/login"
            ).permitAll()

            // DOCTOR
            .antMatchers("/api/doctor/availability").hasAuthority("DOCTOR")
            .antMatchers("/api/doctor/appointments").hasAuthority("DOCTOR")

            // PATIENT
            .antMatchers(
                "/api/patient/doctors",
                "/api/patient/appointments",
                "/api/patient/medicalrecords",
                "/api/patient/appointment"
            ).hasAuthority("PATIENT")

            // RECEPTIONIST
            .antMatchers(
                "/api/receptionist/appointments",
                "/api/receptionist/appointment",
                "/api/receptionist/appointment-reschedule/**"
            ).hasAuthority("RECEPTIONIST")

            .anyRequest().authenticated()
            .and()

            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter,
                UsernamePasswordAuthenticationFilter.class);
    }

    
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
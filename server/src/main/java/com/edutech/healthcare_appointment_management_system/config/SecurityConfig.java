package com.edutech.healthcare_appointment_management_system.config;

import com.edutech.healthcare_appointment_management_system.jwt.JwtRequestFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    public SecurityConfig(
            UserDetailsService userDetailsService,
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

    
        http.cors().and().csrf().disable()
                .authorizeRequests()


        .antMatchers(
                "/api/user/login",
                "/api/patient/register",
                "/api/doctors/register",
                "/api/receptionist/register",
                "/api/captcha",
                "/api/otp/**"
        ).permitAll()

        .antMatchers(
                "/api/patient/doctors",
                "/api/patient/appointments",
                "/api/patient/appointment",
                "/api/patient/doctor/**",
                "/api/patient/medicalrecords"
        ).hasAuthority("PATIENT")

.antMatchers(HttpMethod.GET, "/api/doctor/**").hasAuthority("DOCTOR")

.antMatchers(HttpMethod.POST,
        "/api/doctor/availability",
        "/api/doctor/*/generate-slots"
).hasAuthority("DOCTOR")

.antMatchers(HttpMethod.PUT,
        "/api/doctor/appointment/**",
        "/api/doctor/*/slot"
).hasAuthority("DOCTOR")

        .antMatchers(
                "/api/receptionist/appointments",
                "/api/receptionist/patients",
                "/api/receptionist/doctors"
        ).hasAuthority("RECEPTIONIST")

        .antMatchers(HttpMethod.POST,
                "/api/receptionist/appointment"
        ).hasAuthority("RECEPTIONIST")

        .antMatchers(HttpMethod.PUT,
                "/api/receptionist/appointment-reschedule/**"
        ).hasAuthority("RECEPTIONIST")

        .antMatchers(HttpMethod.DELETE,
                "/api/receptionist/appointment/**"
        ).hasAuthority("RECEPTIONIST")

        .antMatchers("/api/doctor/medicalrecords/**").hasAuthority("DOCTOR")
        .antMatchers("/api/patient/medicalrecords/**").hasAuthority("PATIENT")

        .antMatchers(HttpMethod.GET, "/api/receptionist/doctor/**").hasAuthority("RECEPTIONIST")
        .antMatchers("/api/admin/**").hasAuthority("ADMIN")
        .antMatchers("/api/profile/**").authenticated()
        

        .anyRequest().authenticated()
        .and()
        .sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

    http.addFilterBefore(
            jwtRequestFilter,
            UsernamePasswordAuthenticationFilter.class
    );
}


    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}

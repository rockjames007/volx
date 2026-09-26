package com.quad.config;

import com.quad.security.RequireLoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RequireLoginInterceptor requireLoginInterceptor;

    public WebConfig(RequireLoginInterceptor requireLoginInterceptor) {
        this.requireLoginInterceptor = requireLoginInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requireLoginInterceptor).addPathPatterns("/profile/**");
    }
}

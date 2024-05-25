package com.quad.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @GetMapping("/volunteer/{volunteerId}")
    public Mono<String> getVolunteer(@PathVariable("volunteerId") String volunteerId){
        return Mono.just("Test");
    }
}

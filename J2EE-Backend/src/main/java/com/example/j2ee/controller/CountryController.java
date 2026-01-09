package com.example.j2ee.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/countries")
public class CountryController {

    private final RestTemplate restTemplate;

    public CountryController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCountries() {
        try {
            String url = "https://www.apicountries.com/countries";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> countries = restTemplate.getForObject(url, List.class);
            return ResponseEntity.ok(countries);
        } catch (RestClientException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
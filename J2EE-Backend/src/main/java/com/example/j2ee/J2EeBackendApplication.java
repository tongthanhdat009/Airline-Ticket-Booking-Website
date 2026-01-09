package com.example.j2ee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class J2EeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(J2EeBackendApplication.class, args);
	}

}

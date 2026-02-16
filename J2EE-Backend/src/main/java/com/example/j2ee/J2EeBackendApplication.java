package com.example.j2ee;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class J2EeBackendApplication {

	public static void main(String[] args) {
		// Load .env file from parent directory of src/main/resources
		Dotenv dotenv = Dotenv.configure()
				.directory(".")
				.filename(".env")
				.ignoreIfMalformed()
				.ignoreIfMissing()
				.load();

		// Set environment variables from .env
		dotenv.entries().forEach(entry ->
			System.setProperty(entry.getKey(), entry.getValue())
		);

		SpringApplication.run(J2EeBackendApplication.class, args);
	}

}

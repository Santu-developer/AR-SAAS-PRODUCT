package com.armenu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
public class ArBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(ArBackendApplication.class, args);
		System.out.println("Jay Shree Ram");
	}

}

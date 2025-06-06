package it.uniba.crud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


/**
 * Classe principale dell'applicazione Spring Boot.
 * 
 * - Contiene il metodo main() che avvia l'applicazione.
 * - Grazie all'annotazione @SpringBootApplication, abilita:
 *    → la configurazione automatica di Spring,
 *    → la scansione dei componenti nei package sottostanti,
 *    → l'inizializzazione del contesto dell'applicazione.
 * - Fa partire l'intero sistema: controller, service, repository e database.
 * 
 * Questa classe è il punto di ingresso dell'applicazione.
 */

@SpringBootApplication
public class CrudApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrudApplication.class, args);
	}

}

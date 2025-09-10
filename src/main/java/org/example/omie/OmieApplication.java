package org.example.omie;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class OmieApplication implements CommandLineRunner {

    private static final String APP_KEY = "5614700718627";
    private static final String APP_SECRET = "2ae8328ce879960d99ba83e7986805a3";
    private static final String API_URL = "https://app.omie.com.br/api/v1/geral/categorias/";
    private static final String CALL = "ConsultarCategoria";

    public static void main(String[] args) {
        SpringApplication.run(OmieApplication.class, args);
    }

    @Override
    public void run(String... args) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Monta o payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("call", CALL);
            payload.put("app_key", APP_KEY);
            payload.put("app_secret", APP_SECRET);

            Map<String, String> paramItem = new HashMap<>();
            paramItem.put("codigo", "2.04.01");
            payload.put("param", new Object[]{paramItem});

            // Converte para JSON
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(payload);

            // Cabeçalhos
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

            System.out.println("Testando a chamada '" + CALL + "'...");

            // Faz a requisição POST
            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, entity, String.class);

            System.out.println("Status HTTP: " + response.getStatusCodeValue());
            System.out.println("--- Resposta da API ---");
            System.out.println(response.getBody());

        } catch (Exception e) {
            System.out.println("Ocorreu um erro ao tentar conectar: " + e.getMessage());
        }
    }
}

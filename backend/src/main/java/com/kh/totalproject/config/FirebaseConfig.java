package com.kh.totalproject.config;

import com.google.api.client.http.apache.v2.ApacheHttpTransport;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.http.client.HttpClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;


import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initFirebase() throws IOException {

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String firebaseBase64 = dotenv.get("FIREBASE_CREDENTIALS", System.getenv("FIREBASE_CREDENTIALS"));


        if (firebaseBase64 == null || firebaseBase64.isEmpty()){
            throw new RuntimeException("FIREBASE_CREDENTIALS 환경변수가 설정되지 않았습니다.");
        }

        byte[] decodedBytes = Base64.getDecoder().decode(firebaseBase64);
        ByteArrayInputStream serviceAccount = new ByteArrayInputStream(decodedBytes);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket("coditor-a24fa.firebasestorage.app")
                .build();

        if (FirebaseApp.getApps().isEmpty()){
            FirebaseApp.initializeApp(options);
            System.out.println("Firebase has been initialized successfully!");
        }
    }

}

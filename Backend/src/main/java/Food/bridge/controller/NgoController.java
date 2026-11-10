
package Food.bridge.controller;

import Food.bridge.entity.Ngo;
import Food.bridge.repository.NgoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ngos")
@CrossOrigin(origins = "http://localhost:63342")
public class NgoController {

    private final NgoRepository ngoRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public NgoController(NgoRepository ngoRepository) {
        this.ngoRepository = ngoRepository;
    }

    // NGO Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerNgo(@RequestBody Ngo request) {

        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPasswordHash() == null
                || request.getPasswordHash().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Name, email and password are required."));
        }

        if (ngoRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "An NGO with this email already exists."));
        }

        Ngo ngo = new Ngo();
        ngo.setName(request.getName());
        ngo.setEmail(request.getEmail());
        ngo.setPasswordHash(
                passwordEncoder.encode(request.getPasswordHash()));
        ngo.setPhone(request.getPhone());
        ngo.setAddress(request.getAddress());
        ngo.setCity(request.getCity());

        Ngo savedNgo = ngoRepository.save(ngo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "NGO registered successfully!",
                        "ngoId", savedNgo.getNgoId(),
                        "name", savedNgo.getName(),
                        "email", savedNgo.getEmail()
                ));
    }

    // NGO Login
    @PostMapping("/login")
    public ResponseEntity<?> loginNgo(@RequestBody Ngo request) {

        if (request.getEmail() == null
                || request.getPasswordHash() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Email and password are required."));
        }

        Ngo ngo = ngoRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (ngo == null || !passwordEncoder.matches(
                request.getPasswordHash(), ngo.getPasswordHash())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message",
                            "Invalid email or password."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "NGO login successful!",
                "ngoId", ngo.getNgoId(),
                "name", ngo.getName(),
                "email", ngo.getEmail()
        ));
    }
}

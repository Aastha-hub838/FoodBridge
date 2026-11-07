
        package Food.bridge.controller;

import Food.bridge.dto.DonorRequest;
import Food.bridge.dto.DonorResponse;
import Food.bridge.entity.Donor;
import Food.bridge.repository.DonorRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorRepository donorRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public DonorController(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    // Get all donors
    @GetMapping
    public List<DonorResponse> getAllDonors() {
        return donorRepository.findAll()
                .stream()
                .map(donor -> new DonorResponse(
                        donor.getDonorId(),
                        donor.getName(),
                        donor.getEmail(),
                        donor.getPhone(),
                        donor.getAddress()
                ))
                .toList();
    }

    // Register a new donor
    @PostMapping
    public ResponseEntity<?> registerDonor(
            @Valid @RequestBody DonorRequest request) {

        if (donorRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Email is already registered"
                    ));
        }

        Donor donor = new Donor();
        donor.setName(request.getName().trim());
        donor.setEmail(request.getEmail().trim());

        donor.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        donor.setPhone(request.getPhone());
        donor.setAddress(request.getAddress());

        Donor savedDonor = donorRepository.save(donor);

        DonorResponse response = new DonorResponse(
                savedDonor.getDonorId(),
                savedDonor.getName(),
                savedDonor.getEmail(),
                savedDonor.getPhone(),
                savedDonor.getAddress()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }
}



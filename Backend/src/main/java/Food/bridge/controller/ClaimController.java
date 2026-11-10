
package Food.bridge.controller;

import Food.bridge.entity.Claim;
import Food.bridge.entity.FoodDonation;
import Food.bridge.entity.Ngo;
import Food.bridge.repository.ClaimRepository;
import Food.bridge.repository.FoodDonationRepository;
import Food.bridge.repository.NgoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:63342")
public class ClaimController {

    private final ClaimRepository claimRepository;
    private final FoodDonationRepository foodDonationRepository;
    private final NgoRepository ngoRepository;

    public ClaimController(
            ClaimRepository claimRepository,
            FoodDonationRepository foodDonationRepository,
            NgoRepository ngoRepository) {

        this.claimRepository = claimRepository;
        this.foodDonationRepository = foodDonationRepository;
        this.ngoRepository = ngoRepository;
    }

    // NGO claims a food donation
    @PostMapping("/{donationId}/ngo/{ngoId}")
    @Transactional
    public ResponseEntity<?> claimFood(
            @PathVariable Integer donationId,
            @PathVariable Integer ngoId) {

        FoodDonation food = foodDonationRepository.findById(donationId)
                .orElse(null);

        if (food == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Food donation not found."));
        }

        Ngo ngo = ngoRepository.findById(ngoId)
                .orElse(null);

        if (ngo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "NGO not found."));
        }

        if (!"AVAILABLE".equals(food.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "This food donation is no longer available."));
        }

        if (claimRepository.findByDonation_DonationId(donationId).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "This food donation has already been claimed."));
        }

        Claim claim = new Claim();
        claim.setDonation(food);
        claim.setNgo(ngo);

        Claim savedClaim = claimRepository.save(claim);

        food.setStatus("CLAIMED");
        foodDonationRepository.save(food);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Food claimed successfully!",
                        "claimId", savedClaim.getClaimId(),
                        "donationId", donationId,
                        "ngoId", ngoId,
                        "status", "CLAIMED"
                ));
    }

    // View all claims made by a particular NGO
    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<?> getNgoClaims(
            @PathVariable Integer ngoId) {

        Ngo ngo = ngoRepository.findById(ngoId)
                .orElse(null);

        if (ngo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "NGO not found."));
        }

        List<Map<String, Object>> claims =
                claimRepository.findByNgo_NgoId(ngoId)
                        .stream()
                        .map(claim -> {
                            FoodDonation food = claim.getDonation();

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put("claimId", claim.getClaimId());
                            item.put("donationId", food.getDonationId());
                            item.put("foodName", food.getFoodName());
                            item.put("description", food.getDescription());
                            item.put("quantity", food.getQuantity());
                            item.put("unit", food.getUnit());
                            item.put("pickupAddress", food.getPickupAddress());
                            item.put("contactNumber", food.getContactNumber());
                            item.put("expiryTime", food.getExpiryTime());
                            item.put("claimedAt", claim.getClaimedAt());
                            item.put("status", claim.getStatus());

                            return item;
                        })
                        .toList();

        return ResponseEntity.ok(claims);
    }
}


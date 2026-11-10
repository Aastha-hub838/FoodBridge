
package Food.bridge.controller;

import Food.bridge.dto.FoodDonationRequest;
import Food.bridge.entity.Donor;
import Food.bridge.entity.FoodDonation;
import Food.bridge.repository.DonorRepository;
import Food.bridge.repository.FoodDonationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/food")
public class FoodController {

    private final FoodDonationRepository foodDonationRepository;
    private final DonorRepository donorRepository;

    public FoodController(
            FoodDonationRepository foodDonationRepository,
            DonorRepository donorRepository) {

        this.foodDonationRepository = foodDonationRepository;
        this.donorRepository = donorRepository;
    }

    // GET: Display available food
    @GetMapping
    public List<Map<String, Object>> getAvailableFood() {

        return foodDonationRepository.findByStatus("AVAILABLE")
                .stream()
                .map(food -> {
                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("donationId", food.getDonationId());
                    item.put("foodName", food.getFoodName());
                    item.put("description", food.getDescription());
                    item.put("quantity", food.getQuantity());
                    item.put("unit", food.getUnit());
                    item.put("pickupAddress", food.getPickupAddress());
                    item.put("status", food.getStatus());
                    item.put("expiryTime", food.getExpiryTime());

                    return item;
                })
                .toList();
    }

    // GET: Display donations submitted by a particular donor
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getDonorDonations(
            @PathVariable Integer donorId) {

        Donor donor = donorRepository.findById(donorId)
                .orElse(null);

        if (donor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Donor not found."));
        }

        List<Map<String, Object>> donations =
                foodDonationRepository.findByDonor_DonorId(donorId)
                        .stream()
                        .map(food -> {
                            Map<String, Object> item = new LinkedHashMap<>();

                            item.put("donationId", food.getDonationId());
                            item.put("foodName", food.getFoodName());
                            item.put("description", food.getDescription());
                            item.put("quantity", food.getQuantity());
                            item.put("unit", food.getUnit());
                            item.put("foodType", food.getFoodType());
                            item.put("pickupAddress", food.getPickupAddress());
                            item.put("contactNumber", food.getContactNumber());
                            item.put("instructions", food.getInstructions());
                            item.put("status", food.getStatus());
                            item.put("preparedAt", food.getPreparedAt());
                            item.put("expiryTime", food.getExpiryTime());
                            item.put("createdAt", food.getCreatedAt());

                            return item;
                        })
                        .toList();

        return ResponseEntity.ok(donations);
    }

    // POST: Submit a new food donation
    @PostMapping
    public ResponseEntity<?> createFoodDonation(
            @RequestBody FoodDonationRequest request) {

        if (request.getDonorId() == null ||
                request.getFoodName() == null ||
                request.getFoodName().isBlank() ||
                request.getQuantity() == null ||
                request.getQuantity().signum() <= 0 ||
                request.getUnit() == null ||
                request.getExpiryTime() == null ||
                request.getPickupAddress() == null ||
                request.getPickupAddress().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Please enter valid values in all required fields."));
        }

        if (!request.getExpiryTime().isAfter(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Expiry time must be in the future."));
        }

        Donor donor = donorRepository.findById(request.getDonorId())
                .orElse(null);

        if (donor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Donor not found."));
        }

        FoodDonation food = new FoodDonation();

        food.setDonor(donor);
        food.setFoodName(request.getFoodName());
        food.setDescription(request.getDescription());
        food.setQuantity(request.getQuantity());
        food.setUnit(request.getUnit());
        food.setFoodType(request.getFoodType());
        food.setPreparedAt(request.getPreparedAt());
        food.setExpiryTime(request.getExpiryTime());
        food.setPickupAddress(request.getPickupAddress());
        food.setContactNumber(request.getContactNumber());
        food.setInstructions(request.getInstructions());

        food.setStatus("AVAILABLE");
        food.setCreatedAt(LocalDateTime.now());

        FoodDonation savedFood = foodDonationRepository.save(food);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Food donation submitted successfully!");
        response.put("donationId", savedFood.getDonationId());
        response.put("foodName", savedFood.getFoodName());
        response.put("status", savedFood.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT: Edit an existing donation
    @PutMapping("/{donationId}")
    public ResponseEntity<?> updateDonation(
            @PathVariable Integer donationId,
            @RequestParam Integer donorId,
            @RequestBody FoodDonationRequest request) {

        FoodDonation food = foodDonationRepository.findById(donationId)
                .orElse(null);

        if (food == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Donation not found."));
        }

        if (food.getDonor() == null ||
                !food.getDonor().getDonorId().equals(donorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "You cannot edit another donor's donation."));
        }

        if (!"AVAILABLE".equals(food.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Only available donations can be edited."));
        }

        if (request.getFoodName() == null ||
                request.getFoodName().isBlank() ||
                request.getQuantity() == null ||
                request.getQuantity().signum() <= 0 ||
                request.getUnit() == null ||
                request.getExpiryTime() == null ||
                request.getPickupAddress() == null ||
                request.getPickupAddress().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Please enter valid values in all required fields."));
        }

        if (!request.getExpiryTime().isAfter(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Expiry time must be in the future."));
        }

        food.setFoodName(request.getFoodName());
        food.setDescription(request.getDescription());
        food.setQuantity(request.getQuantity());
        food.setUnit(request.getUnit());
        food.setFoodType(request.getFoodType());
        food.setPreparedAt(request.getPreparedAt());
        food.setExpiryTime(request.getExpiryTime());
        food.setPickupAddress(request.getPickupAddress());
        food.setContactNumber(request.getContactNumber());
        food.setInstructions(request.getInstructions());

        FoodDonation updatedFood = foodDonationRepository.save(food);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Donation updated successfully!");
        response.put("donationId", updatedFood.getDonationId());
        response.put("status", updatedFood.getStatus());

        return ResponseEntity.ok(response);
    }

    // PATCH: Cancel a donation without deleting its database record
    @PatchMapping("/{donationId}/cancel")
    public ResponseEntity<?> cancelDonation(
            @PathVariable Integer donationId,
            @RequestParam Integer donorId) {

        FoodDonation food = foodDonationRepository.findById(donationId)
                .orElse(null);

        if (food == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Donation not found."));
        }

        if (food.getDonor() == null ||
                !food.getDonor().getDonorId().equals(donorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "You cannot cancel another donor's donation."));
        }

        if (!"AVAILABLE".equals(food.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Only available donations can be cancelled."));
        }

        food.setStatus("CANCELLED");
        foodDonationRepository.save(food);

        return ResponseEntity.ok(
                Map.of("message", "Donation cancelled successfully!",
                        "donationId", donationId,
                        "status", "CANCELLED"));
    }
}

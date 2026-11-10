

package Food.bridge.repository;

import Food.bridge.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodDonationRepository
        extends JpaRepository<FoodDonation, Integer> {

    // Fetch all donations with a particular status
    List<FoodDonation> findByStatus(String status);

    // Fetch all donations submitted by a particular donor
    List<FoodDonation> findByDonor_DonorId(Integer donorId);
}

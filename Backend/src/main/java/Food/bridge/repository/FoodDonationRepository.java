
package Food.bridge.repository;

import Food.bridge.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodDonationRepository
        extends JpaRepository<FoodDonation, Integer> {

    List<FoodDonation> findByStatus(String status);
}


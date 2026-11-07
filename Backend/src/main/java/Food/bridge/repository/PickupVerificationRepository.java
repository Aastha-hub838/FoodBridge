
package Food.bridge.repository;

import Food.bridge.entity.PickupVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PickupVerificationRepository
        extends JpaRepository<PickupVerification, Integer> {
}

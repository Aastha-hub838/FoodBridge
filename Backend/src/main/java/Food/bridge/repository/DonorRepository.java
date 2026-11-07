
package Food.bridge.repository;

import Food.bridge.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Integer> {

    Optional<Donor> findByEmail(String email);
}

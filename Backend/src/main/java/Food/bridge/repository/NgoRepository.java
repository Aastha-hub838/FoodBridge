
package Food.bridge.repository;

import Food.bridge.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NgoRepository extends JpaRepository<Ngo, Integer> {

    Optional<Ngo> findByEmail(String email);
}


package Food.bridge.repository;

import Food.bridge.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository
        extends JpaRepository<Claim, Integer> {
}

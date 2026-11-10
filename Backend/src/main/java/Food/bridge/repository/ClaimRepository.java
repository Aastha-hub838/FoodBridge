

package Food.bridge.repository;

import Food.bridge.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Integer> {

    // Check whether a donation has already been claimed
    Optional<Claim> findByDonation_DonationId(Integer donationId);

    // Fetch all claims made by a particular NGO
    List<Claim> findByNgo_NgoId(Integer ngoId);
}

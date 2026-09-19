package com.sih.backend.complaint.service;

import com.sih.backend.complaint.entity.Complaint;
import com.sih.backend.complaint.repository.ComplaintRepository;
import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.repository.HotlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service responsible for handling the submission and processing of complaints.
 * 
 * <p>It manages the business logic surrounding new complaint entries, including
 * verifying whether a vehicle associated with the complaint is currently in a cooldown period.</p>
 */
@Service
@RequiredArgsConstructor
public class ComplaintSubmissionService {

    private final ComplaintRepository complaintRepository;
    private final HotlistRepository hotlistRepository;

    /**
     * Submits a new complaint into the system.
     * 
     * <p>Before saving the complaint, this method checks if the associated vehicle's license plate
     * is present in the hotlist and if it is currently under a cooldown period. If the vehicle is
     * in a cooldown period, an exception is thrown and the complaint is not submitted.</p>
     * 
     * @param complaint The complaint entity containing the details to be saved, including the plate number.
     * @return The saved complaint entity, including its generated ID and any other database-assigned fields.
     * @throws RuntimeException if the vehicle's plate number is found in the hotlist and is currently 
     *         in an active cooldown period.
     */
    @Transactional
    public Complaint submitComplaint(Complaint complaint) {
        Optional<Hotlist> existingHotlist = hotlistRepository.findByPlateNumber(complaint.getPlateNumber());
        
        if (existingHotlist.isPresent()) {
            Hotlist hotlist = existingHotlist.get();
            if (hotlist.getCooldownUntil() != null && hotlist.getCooldownUntil().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Cannot submit complaint. Vehicle is in cooldown period until: " + hotlist.getCooldownUntil());
            }
        }
        
        return complaintRepository.save(complaint);
    }
}

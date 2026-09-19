package com.sih.backend.complaint.service;

import com.sih.backend.auth.entity.User;
import com.sih.backend.auth.repository.UserRepository;
import com.sih.backend.common.dto.ComplaintResponse;
import com.sih.backend.complaint.dto.ComplaintRequest;
import com.sih.backend.complaint.dto.FirRequest;
import com.sih.backend.complaint.entity.Complaint;
import com.sih.backend.complaint.entity.ComplaintStatus;
import com.sih.backend.complaint.repository.ComplaintRepository;
import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.repository.HotlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final HotlistRepository hotlistRepository;
    private final ComplaintSubmissionService submissionService;

    @Transactional
    public ComplaintResponse submitComplaint(ComplaintRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getPrincipal().toString())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setPlateNumber(request.plateNumber().toUpperCase().replaceAll("[^A-Z0-9]", ""));
        complaint.setOwnerName(request.ownerName());
        complaint.setProofDocumentRef(request.proofDocumentRef());
        complaint.setStatus(ComplaintStatus.PENDING);

        // Save vehicle details in a flexible way (could be a separate entity but keeping simple)
        // Use the submission service which checks cooldown
        Complaint saved = submissionService.submitComplaint(complaint);

        // Auto-verify for demo purposes (hackathon mode)
        // In production, this would go through manual verification
        verifyComplaint(saved.getId());

        return toResponse(saved);
    }

    @Transactional
    public ComplaintResponse verifyComplaint(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new RuntimeException("Complaint already processed");
        }

        complaint.setStatus(ComplaintStatus.VERIFIED);

        // Add to hotlist
        Hotlist hotlist = new Hotlist();
        hotlist.setPlateNumber(complaint.getPlateNumber());
        hotlist.setComplaint(complaint);
        hotlist.setStatus(HotlistStatus.ACTIVE_UNCONFIRMED);
        hotlist.setAddedAt(LocalDateTime.now());
        hotlist.setFirDeadline(LocalDateTime.now().plusHours(48));

        hotlistRepository.save(hotlist);
        complaintRepository.save(complaint);

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse submitFir(UUID complaintId, FirRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.VERIFIED) {
            throw new RuntimeException("Complaint not verified yet");
        }

        // Update hotlist
        Hotlist hotlist = hotlistRepository.findByPlateNumber(complaint.getPlateNumber())
                .orElseThrow(() -> new RuntimeException("Hotlist entry not found"));

        hotlist.setFirReferenceNo(request.firReferenceNo());
        hotlist.setStatus(HotlistStatus.ACTIVE_CONFIRMED);

        hotlistRepository.save(hotlist);

        return toResponse(complaint);
    }

    public List<ComplaintResponse> getMyComplaints() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getPrincipal().toString())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return complaintRepository.findAllByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public ComplaintResponse getComplaint(UUID id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getPrincipal().toString())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (complaint.getUser().getId() != user.getId()) {
            throw new RuntimeException("Not authorized to view this complaint");
        }

        return toResponse(complaint);
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        Hotlist hotlist = hotlistRepository.findByPlateNumber(complaint.getPlateNumber()).orElse(null);
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getPlateNumber(),
                complaint.getOwnerName(),
                null, // vehicleMake - not stored in current schema
                null, // vehicleModel
                null, // color
                null, // lastKnownLocation
                complaint.getStatus().name(),
                complaint.getCreatedAt(),
                hotlist != null && hotlist.getStatus() == HotlistStatus.ACTIVE_UNCONFIRMED ? hotlist.getFirDeadline() : null
        );
    }
}

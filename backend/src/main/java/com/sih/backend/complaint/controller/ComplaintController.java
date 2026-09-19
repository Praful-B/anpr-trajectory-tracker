package com.sih.backend.complaint.controller;

import com.sih.backend.common.dto.ComplaintResponse;
import com.sih.backend.complaint.dto.ComplaintRequest;
import com.sih.backend.complaint.dto.FirRequest;
import com.sih.backend.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ComplaintResponse> submitComplaint(@Valid @RequestBody ComplaintRequest request) {
        return ResponseEntity.ok(complaintService.submitComplaint(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {
        return ResponseEntity.ok(complaintService.getMyComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable UUID id) {
        return ResponseEntity.ok(complaintService.getComplaint(id));
    }

    @PostMapping("/{id}/fir")
    public ResponseEntity<ComplaintResponse> submitFir(@PathVariable UUID id, @Valid @RequestBody FirRequest request) {
        return ResponseEntity.ok(complaintService.submitFir(id, request));
    }
}

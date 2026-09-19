package com.sih.backend.cop.controller;

import com.sih.backend.cop.dto.AuditLogResponse;
import com.sih.backend.cop.service.AuditService;
import com.sih.backend.sighting.entity.Sighting;
import com.sih.backend.sighting.repository.SightingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cop")
@RequiredArgsConstructor
public class CopController {

    private final AuditService auditService;
    private final SightingRepository sightingRepository;

    @GetMapping("/audit")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(auditService.getRecentLogs(limit));
    }

    @GetMapping("/sightings")
    public ResponseEntity<List<Sighting>> getAllSightings() {
        return ResponseEntity.ok(sightingRepository.findAll());
    }

    @GetMapping("/sightings/plate/{plateNumber}")
    public ResponseEntity<List<Sighting>> getSightingsByPlate(@PathVariable String plateNumber) {
        return ResponseEntity.ok(sightingRepository.findByHotlistId(
                UUID.fromString(plateNumber) // Simplified - in production lookup by plate
        ));
    }
}

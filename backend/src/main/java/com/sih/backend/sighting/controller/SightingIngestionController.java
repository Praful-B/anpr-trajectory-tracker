package com.sih.backend.sighting.controller;

import com.sih.backend.sighting.dto.SightingBatchRequest;
import com.sih.backend.sighting.service.SightingIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for ingesting ANPR (Automatic Number Plate Recognition) sightings.
 * 
 * <p>Provides endpoints for external camera systems or edge devices to submit
 * batches of vehicle sightings for real-time analysis against the hotlist.</p>
 */
@RestController
@RequestMapping("/api/v1/sightings")
@RequiredArgsConstructor
public class SightingIngestionController {

    private final SightingIngestionService ingestionService;

    /**
     * Accepts a batch of vehicle sightings and processes them.
     * 
     * <p>This endpoint delegates to {@link SightingIngestionService} to check each
     * sighted vehicle against active hotlists and trigger necessary alerts.</p>
     * 
     * @param request The batch of sightings to ingest.
     * @return A standard 200 OK response indicating successful receipt and processing.
     */
    @PostMapping("/ingest")
    public ResponseEntity<Void> ingestSightings(@RequestBody SightingBatchRequest request) {
        ingestionService.ingestBatch(request);
        return ResponseEntity.ok().build();
    }
}

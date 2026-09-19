package com.sih.backend.sighting.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SightingBatchRequest(
        @NotEmpty List<@Valid SightingEntry> sightings
) {
    public record SightingEntry(
            String plateNumber,
            Double latitude,
            Double longitude,
            Long timestamp,
            Double confidence,
            String photoBase64
    ) {}
}

package com.sih.backend.complaint.dto;

import jakarta.validation.constraints.NotBlank;

public record ComplaintRequest(
        @NotBlank String plateNumber,
        @NotBlank String ownerName,
        @NotBlank String proofDocumentRef,
        String vehicleMake,
        String vehicleModel,
        String color,
        String stolenDateTime,
        String lastKnownLocation
) {}

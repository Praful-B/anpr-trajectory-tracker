package com.sih.backend.common.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ComplaintResponse(
        UUID id,
        String plateNumber,
        String ownerName,
        String vehicleMake,
        String vehicleModel,
        String color,
        String lastKnownLocation,
        String status,
        LocalDateTime createdAt,
        LocalDateTime firDeadline
) {}

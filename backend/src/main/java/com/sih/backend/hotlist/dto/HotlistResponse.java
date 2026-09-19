package com.sih.backend.common.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record HotlistResponse(
        UUID id,
        String plateNumber,
        String complaintId,
        String status,
        LocalDateTime addedAt,
        LocalDateTime firDeadline,
        String firReferenceNo,
        LocalDateTime cooldownUntil,
        String lastSeenLat,
        String lastSeenLng,
        LocalDateTime lastSeenAt
) {}

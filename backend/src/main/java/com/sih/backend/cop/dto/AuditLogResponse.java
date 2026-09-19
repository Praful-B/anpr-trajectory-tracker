package com.sih.backend.cop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String actorId,
        String role,
        String action,
        String targetEntity,
        LocalDateTime timestamp,
        String ipAddress
) {}

package com.sih.backend.cop.service;

import com.sih.backend.cop.entity.AuditLog;
import com.sih.backend.cop.repository.AuditLogRepository;
import com.sih.backend.cop.dto.AuditLogResponse;
import com.sih.backend.auth.entity.Role;
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
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(String action, String targetEntity, String ipAddress) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return;

        AuditLog log = new AuditLog();
        log.setActorId(UUID.fromString(auth.getPrincipal().toString()));
        log.setRole(Role.valueOf(auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("CITIZEN")));
        log.setAction(action);
        log.setTargetEntity(targetEntity);
        log.setTimestamp(LocalDateTime.now());
        log.setIpAddress(ipAddress);

        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getRecentLogs(int limit) {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    public List<AuditLogResponse> getLogsByActor(UUID actorId) {
        return auditLogRepository.findByActorId(actorId).stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorId().toString(),
                log.getRole().name(),
                log.getAction(),
                log.getTargetEntity(),
                log.getTimestamp(),
                log.getIpAddress()
        );
    }
}

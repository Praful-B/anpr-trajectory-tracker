package com.sih.backend.hotlist.service;

import com.sih.backend.common.dto.HotlistResponse;
import com.sih.backend.hotlist.dto.HotlistSyncResponse;
import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.repository.HotlistRepository;
import com.sih.backend.sighting.entity.Sighting;
import com.sih.backend.sighting.repository.SightingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HotlistService {

    private final HotlistRepository hotlistRepository;
    private final SightingRepository sightingRepository;

    public List<HotlistResponse> getAllHotlist() {
        return hotlistRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public HotlistResponse getHotlistById(UUID id) {
        Hotlist hotlist = hotlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotlist entry not found"));
        return toResponse(hotlist);
    }

    public HotlistResponse getHotlistByPlate(String plateNumber) {
        Hotlist hotlist = hotlistRepository.findByPlateNumber(plateNumber)
                .orElseThrow(() -> new RuntimeException("Hotlist entry not found"));
        return toResponse(hotlist);
    }

    @Transactional
    public HotlistResponse verifyFir(UUID id, String firReferenceNo) {
        Hotlist hotlist = hotlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotlist entry not found"));

        if (hotlist.getStatus() != HotlistStatus.ACTIVE_UNCONFIRMED) {
            throw new RuntimeException("Can only verify FIR for ACTIVE_UNCONFIRMED entries");
        }

        hotlist.setStatus(HotlistStatus.ACTIVE_CONFIRMED);
        hotlist.setFirReferenceNo(firReferenceNo);
        Hotlist saved = hotlistRepository.save(hotlist);
        return toResponse(saved);
    }

    @Transactional
    public HotlistResponse markRecovered(UUID id) {
        Hotlist hotlist = hotlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotlist entry not found"));

        if (hotlist.getStatus() != HotlistStatus.ACTIVE_CONFIRMED && hotlist.getStatus() != HotlistStatus.ACTIVE_UNCONFIRMED) {
            throw new RuntimeException("Can only mark recovered for active entries");
        }

        hotlist.setStatus(HotlistStatus.RECOVERED);
        Hotlist saved = hotlistRepository.save(hotlist);
        return toResponse(saved);
    }

    public HotlistSyncResponse getSyncData() {
        LocalDateTime now = LocalDateTime.now();
        List<Hotlist> activeHotlist = hotlistRepository.findByStatusIn(
                List.of(HotlistStatus.ACTIVE_UNCONFIRMED, HotlistStatus.ACTIVE_CONFIRMED)
        );

        return new HotlistSyncResponse(
                now.toEpochSecond(java.time.ZoneOffset.UTC),
                activeHotlist.stream()
                        .map(h -> new HotlistSyncResponse.HotlistEntry(
                                h.getId(),
                                h.getPlateNumber(),
                                h.getPlateNumber() // In production, encrypt this
                        ))
                        .toList()
        );
    }

    private HotlistResponse toResponse(Hotlist hotlist) {
        Sighting lastSighting = sightingRepository.findTopByHotlistIdOrderByCapturedAtDesc(hotlist.getId());
        return new HotlistResponse(
                hotlist.getId(),
                hotlist.getPlateNumber(),
                hotlist.getComplaint().getId().toString(),
                hotlist.getStatus().name(),
                hotlist.getAddedAt(),
                hotlist.getFirDeadline(),
                hotlist.getFirReferenceNo(),
                hotlist.getCooldownUntil(),
                lastSighting != null ? lastSighting.getLatitude().toString() : null,
                lastSighting != null ? lastSighting.getLongitude().toString() : null,
                lastSighting != null ? lastSighting.getCapturedAt() : null
        );
    }
}

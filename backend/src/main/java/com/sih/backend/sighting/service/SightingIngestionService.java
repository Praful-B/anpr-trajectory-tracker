package com.sih.backend.sighting.service;

import com.sih.backend.common.exception.SightingException;
import com.sih.backend.device.entity.Device;
import com.sih.backend.device.repository.DeviceRepository;
import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.repository.HotlistRepository;
import com.sih.backend.sighting.dto.SightingBatchRequest;
import com.sih.backend.sighting.entity.Sighting;
import com.sih.backend.sighting.repository.SightingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SightingIngestionService {

    private final HotlistRepository hotlistRepository;
    private final DeviceRepository deviceRepository;
    private final SightingRepository sightingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void ingestBatch(SightingBatchRequest request) {
        Map<String, Hotlist> activeHotlistMap = hotlistRepository.findByStatusIn(
                List.of(HotlistStatus.ACTIVE_UNCONFIRMED, HotlistStatus.ACTIVE_CONFIRMED)
        ).stream().collect(Collectors.toMap(Hotlist::getPlateNumber, h -> h));

        List<Sighting> matchedSightings = new ArrayList<>();
        Set<String> processedPlates = new HashSet<>();

        for (SightingBatchRequest.SightingEntry entry : request.sightings()) {
            // Zero-retention: only process if plate is on active hotlist
            Hotlist hotlist = activeHotlistMap.get(entry.plateNumber().toUpperCase());

            if (hotlist == null) {
                // Non-matching plate - discard immediately, never store
                log.debug("Discarding non-hotlisted plate: {}", entry.plateNumber());
                continue;
            }

            // De-duplicate: skip if same device already reported this plate in last 5 seconds
            if (processedPlates.contains(entry.plateNumber())) {
                continue;
            }
            processedPlates.add(entry.plateNumber());

            Sighting sighting = new Sighting();
            sighting.setHotlist(hotlist);
            sighting.setLatitude(entry.latitude());
            sighting.setLongitude(entry.longitude());
            sighting.setCapturedAt(LocalDateTime.now());
            sighting.setConfidence(entry.confidence());
            sighting.setPhotoStorageRef(entry.photoBase64() != null && !entry.photoBase64().isEmpty()
                    ? "photos/" + hotlist.getPlateNumber() + "_" + System.currentTimeMillis() + ".jpg"
                    : null);

            matchedSightings.add(sighting);
        }

        if (!matchedSightings.isEmpty()) {
            sightingRepository.saveAll(matchedSightings);
            log.info("Persisted {} matched sightings", matchedSightings.size());

            // Push to dashboard via WebSocket
            for (Sighting sighting : matchedSightings) {
                Map<String, Object> message = new HashMap<>();
                message.put("hotlistId", sighting.getHotlist().getId());
                message.put("plateNumber", sighting.getHotlist().getPlateNumber());
                message.put("latitude", sighting.getLatitude());
                message.put("longitude", sighting.getLongitude());
                message.put("capturedAt", sighting.getCapturedAt());
                message.put("confidence", sighting.getConfidence());
                messagingTemplate.convertAndSend("/topic/sightings", (Object) message);
            }
        }
    }
}

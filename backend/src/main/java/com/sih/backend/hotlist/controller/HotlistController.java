package com.sih.backend.hotlist.controller;

import com.sih.backend.common.dto.HotlistResponse;
import com.sih.backend.hotlist.dto.HotlistSyncResponse;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.service.HotlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hotlist")
@RequiredArgsConstructor
public class HotlistController {

    private final HotlistService hotlistService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<HotlistResponse>> getAllHotlist() {
        return ResponseEntity.ok(hotlistService.getAllHotlist());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotlistResponse> getHotlistById(@PathVariable UUID id) {
        return ResponseEntity.ok(hotlistService.getHotlistById(id));
    }

    @GetMapping("/plate/{plateNumber}")
    public ResponseEntity<HotlistResponse> getHotlistByPlate(@PathVariable String plateNumber) {
        return ResponseEntity.ok(hotlistService.getHotlistByPlate(plateNumber));
    }

    @PutMapping("/{id}/verify-fir")
    public ResponseEntity<HotlistResponse> verifyFir(
            @PathVariable UUID id,
            @RequestBody String firReferenceNo) {
        HotlistResponse response = hotlistService.verifyFir(id, firReferenceNo);
        messagingTemplate.convertAndSend("/topic/hotlist-updates", response);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/mark-recovered")
    public ResponseEntity<HotlistResponse> markRecovered(@PathVariable UUID id) {
        HotlistResponse response = hotlistService.markRecovered(id);
        messagingTemplate.convertAndSend("/topic/hotlist-updates", response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sync")
    public ResponseEntity<HotlistSyncResponse> getSyncData() {
        return ResponseEntity.ok(hotlistService.getSyncData());
    }
}

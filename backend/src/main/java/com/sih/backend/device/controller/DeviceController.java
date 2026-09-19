package com.sih.backend.device.controller;

import com.sih.backend.device.entity.Device;
import com.sih.backend.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/register")
    public ResponseEntity<Device> registerDevice(@RequestBody DeviceRegistrationRequest request) {
        Device device = deviceService.registerDevice(request.deviceId(), request.type(), request.token());
        return ResponseEntity.ok(device);
    }

    @GetMapping("/sync")
    public ResponseEntity<Void> syncHotlist(@RequestHeader("X-Device-Id") String deviceId) {
        // In production, return encrypted hotlist
        return ResponseEntity.ok().build();
    }
}

record DeviceRegistrationRequest(
        String deviceId,
        String type,
        String token
) {}

package com.sih.backend.device.service;

import com.sih.backend.auth.entity.User;
import com.sih.backend.auth.repository.UserRepository;
import com.sih.backend.device.entity.Device;
import com.sih.backend.device.entity.Device.DeviceType;
import com.sih.backend.device.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    @Transactional
    public Device registerDevice(String deviceId, String type, String token) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getPrincipal().toString())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Device device = new Device();
        device.setUser(user);
        device.setDeviceId(deviceId);
        device.setType(DeviceType.valueOf(type.toUpperCase()));
        device.setToken(token);

        return deviceRepository.save(device);
    }

    public void updateLastSync(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setLastSyncAt(java.time.LocalDateTime.now());
        deviceRepository.save(device);
    }
}

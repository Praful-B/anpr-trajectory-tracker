package com.sih.backend.device.repository;

import com.sih.backend.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByToken(String token);
    Optional<Device> findByDeviceId(String deviceId);
    List<Device> findByUserId(UUID userId);
}

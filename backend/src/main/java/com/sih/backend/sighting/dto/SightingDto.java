package com.sih.backend.sighting.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SightingDto {
    private String plateNumber;
    private String deviceId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime capturedAt;
    private Double confidence;
    private String photoStorageRef;
}

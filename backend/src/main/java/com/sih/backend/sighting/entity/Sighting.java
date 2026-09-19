package com.sih.backend.sighting.entity;

import com.sih.backend.common.entity.BaseEntity;
import com.sih.backend.device.entity.Device;
import com.sih.backend.hotlist.entity.Hotlist;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sightings")
@Getter
@Setter
public class Sighting extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotlist_id", nullable = false)
    private Hotlist hotlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime capturedAt;

    @Column(nullable = false)
    private Double confidence;

    private String photoStorageRef;
}

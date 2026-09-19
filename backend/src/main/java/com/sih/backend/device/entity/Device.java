package com.sih.backend.device.entity;

import com.sih.backend.auth.entity.User;
import com.sih.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
@Getter
@Setter
public class Device extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String deviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType type;

    @Column(nullable = false, unique = true)
    private String token;

    private LocalDateTime lastSyncAt;

    private Boolean revoked = false;

    public enum DeviceType {
        FLEET, VOLUNTEER
    }
}

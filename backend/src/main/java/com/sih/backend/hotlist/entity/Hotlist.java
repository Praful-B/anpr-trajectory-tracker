package com.sih.backend.hotlist.entity;

import com.sih.backend.common.entity.BaseEntity;
import com.sih.backend.complaint.entity.Complaint;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "hotlist")
@Getter
@Setter
public class Hotlist extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HotlistStatus status;

    @Column(nullable = false)
    private LocalDateTime addedAt;

    @Column(nullable = false)
    private LocalDateTime firDeadline;

    private String firReferenceNo;

    private LocalDateTime cooldownUntil;
}

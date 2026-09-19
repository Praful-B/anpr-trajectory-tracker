package com.sih.backend.complaint.entity;

import com.sih.backend.auth.entity.User;
import com.sih.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "complaints")
@Getter
@Setter
public class Complaint extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String proofDocumentRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;
}

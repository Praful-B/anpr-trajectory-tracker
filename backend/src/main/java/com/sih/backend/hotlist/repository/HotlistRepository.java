package com.sih.backend.hotlist.repository;

import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HotlistRepository extends JpaRepository<Hotlist, UUID> {
    Optional<Hotlist> findByPlateNumber(String plateNumber);
    Optional<Hotlist> findByPlateNumberAndStatusIn(String plateNumber, List<HotlistStatus> statuses);
    List<Hotlist> findByStatusIn(List<HotlistStatus> statuses);
    List<Hotlist> findByStatusAndFirDeadlineBefore(HotlistStatus status, LocalDateTime dateTime);
}

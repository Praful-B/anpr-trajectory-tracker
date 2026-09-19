package com.sih.backend.sighting.repository;

import com.sih.backend.sighting.entity.Sighting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SightingRepository extends JpaRepository<Sighting, UUID> {
    List<Sighting> findByHotlistId(UUID hotlistId);
    Sighting findTopByHotlistIdOrderByCapturedAtDesc(UUID hotlistId);
    List<Sighting> findByHotlistIdOrderByCapturedAtDesc(UUID hotlistId);
}

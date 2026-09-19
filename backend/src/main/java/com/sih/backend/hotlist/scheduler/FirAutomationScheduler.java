package com.sih.backend.hotlist.scheduler;

import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.repository.HotlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FirAutomationScheduler {

    private final HotlistRepository hotlistRepository;

    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void processExpiredUnconfirmedHotlists() {
        log.info("Running FIR Automation & Cooldown Scheduler");
        LocalDateTime now = LocalDateTime.now();
        
        List<Hotlist> expiredList = hotlistRepository.findByStatusAndFirDeadlineBefore(HotlistStatus.ACTIVE_UNCONFIRMED, now);
        
        for (Hotlist hotlist : expiredList) {
            hotlist.setStatus(HotlistStatus.EXPIRED);
            hotlist.setCooldownUntil(now.plusHours(72));
            log.info("Auto-transitioned plate {} to EXPIRED. Cooldown until {}", hotlist.getPlateNumber(), hotlist.getCooldownUntil());
        }
        
        hotlistRepository.saveAll(expiredList);
    }
}

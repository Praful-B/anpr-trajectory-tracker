package com.sih.backend.complaint.service;

import com.sih.backend.complaint.entity.Complaint;
import com.sih.backend.complaint.repository.ComplaintRepository;
import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.repository.HotlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintSubmissionServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private HotlistRepository hotlistRepository;

    @InjectMocks
    private ComplaintSubmissionService complaintSubmissionService;

    private Complaint testComplaint;
    private Hotlist testHotlist;

    @BeforeEach
    void setUp() {
        testComplaint = new Complaint();
        testComplaint.setPlateNumber("UP14AB1234");
        // Assume other fields are set as required by the application

        testHotlist = new Hotlist();
        testHotlist.setPlateNumber("UP14AB1234");
    }

    @Test
    void submitComplaint_Success_NoHotlist() {
        when(hotlistRepository.findByPlateNumber(testComplaint.getPlateNumber()))
                .thenReturn(Optional.empty());
        
        when(complaintRepository.save(any(Complaint.class)))
                .thenReturn(testComplaint);

        Complaint savedComplaint = complaintSubmissionService.submitComplaint(testComplaint);

        assertNotNull(savedComplaint);
        assertEquals("UP14AB1234", savedComplaint.getPlateNumber());
        
        verify(hotlistRepository, times(1)).findByPlateNumber(testComplaint.getPlateNumber());
        verify(complaintRepository, times(1)).save(testComplaint);
    }

    @Test
    void submitComplaint_Success_HotlistWithoutCooldown() {
        testHotlist.setCooldownUntil(null);
        when(hotlistRepository.findByPlateNumber(testComplaint.getPlateNumber()))
                .thenReturn(Optional.of(testHotlist));
        
        when(complaintRepository.save(any(Complaint.class)))
                .thenReturn(testComplaint);

        Complaint savedComplaint = complaintSubmissionService.submitComplaint(testComplaint);

        assertNotNull(savedComplaint);
        
        verify(hotlistRepository, times(1)).findByPlateNumber(testComplaint.getPlateNumber());
        verify(complaintRepository, times(1)).save(testComplaint);
    }

    @Test
    void submitComplaint_Success_HotlistWithExpiredCooldown() {
        testHotlist.setCooldownUntil(LocalDateTime.now().minusDays(1));
        when(hotlistRepository.findByPlateNumber(testComplaint.getPlateNumber()))
                .thenReturn(Optional.of(testHotlist));
        
        when(complaintRepository.save(any(Complaint.class)))
                .thenReturn(testComplaint);

        Complaint savedComplaint = complaintSubmissionService.submitComplaint(testComplaint);

        assertNotNull(savedComplaint);
        
        verify(hotlistRepository, times(1)).findByPlateNumber(testComplaint.getPlateNumber());
        verify(complaintRepository, times(1)).save(testComplaint);
    }

    @Test
    void submitComplaint_ThrowsException_HotlistWithActiveCooldown() {
        testHotlist.setCooldownUntil(LocalDateTime.now().plusDays(1));
        when(hotlistRepository.findByPlateNumber(testComplaint.getPlateNumber()))
                .thenReturn(Optional.of(testHotlist));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            complaintSubmissionService.submitComplaint(testComplaint);
        });

        assertTrue(exception.getMessage().contains("Cannot submit complaint"));
        
        verify(hotlistRepository, times(1)).findByPlateNumber(testComplaint.getPlateNumber());
        verify(complaintRepository, never()).save(any(Complaint.class));
    }
}

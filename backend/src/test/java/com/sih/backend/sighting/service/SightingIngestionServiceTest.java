package com.sih.backend.sighting.service;

import com.sih.backend.hotlist.entity.Hotlist;
import com.sih.backend.hotlist.entity.HotlistStatus;
import com.sih.backend.hotlist.repository.HotlistRepository;
import com.sih.backend.sighting.dto.SightingBatchRequest;
import com.sih.backend.sighting.dto.SightingDto;
import com.sih.backend.sighting.entity.Sighting;
import com.sih.backend.sighting.repository.SightingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SightingIngestionServiceTest {

    @Mock
    private HotlistRepository hotlistRepository;

    @Mock
    private SightingRepository sightingRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private SightingIngestionService sightingIngestionService;

    private SightingBatchRequest request;
    private SightingDto sightingDto;

    @BeforeEach
    void setUp() {
        sightingDto = new SightingDto();
        sightingDto.setPlateNumber("UP14AB1234");
        sightingDto.setDeviceId("cam-01");
        sightingDto.setLatitude(28.7041);
        sightingDto.setLongitude(77.1025);
        sightingDto.setCapturedAt(LocalDateTime.now());
        sightingDto.setConfidence(95.5);
        sightingDto.setPhotoStorageRef("s3://bucket/photo.jpg");

        request = new SightingBatchRequest();
        request.setSightings(Collections.singletonList(sightingDto));
    }

    @Test
    void ingestBatch_NullOrEmptyRequest_DoesNothing() {
        sightingIngestionService.ingestBatch(null);
        verify(hotlistRepository, never()).findAll();

        SightingBatchRequest emptyRequest = new SightingBatchRequest();
        emptyRequest.setSightings(Collections.emptyList());
        sightingIngestionService.ingestBatch(emptyRequest);
        verify(hotlistRepository, never()).findAll();
    }

    @Test
    void ingestBatch_NoActiveHotlists_DoesNothing() {
        when(hotlistRepository.findAll()).thenReturn(Collections.emptyList());

        sightingIngestionService.ingestBatch(request);

        verify(hotlistRepository, times(1)).findAll();
        verify(sightingRepository, never()).save(any(Sighting.class));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void ingestBatch_ActiveHotlistFound_SavesAndNotifies() {
        Hotlist activeHotlist = new Hotlist();
        activeHotlist.setPlateNumber("UP14AB1234");
        activeHotlist.setStatus(HotlistStatus.ACTIVE_CONFIRMED);

        when(hotlistRepository.findAll()).thenReturn(Collections.singletonList(activeHotlist));

        sightingIngestionService.ingestBatch(request);

        verify(hotlistRepository, times(1)).findAll();
        
        ArgumentCaptor<Sighting> sightingCaptor = ArgumentCaptor.forClass(Sighting.class);
        verify(sightingRepository, times(1)).save(sightingCaptor.capture());
        
        Sighting savedSighting = sightingCaptor.getValue();
        assertEquals("UP14AB1234", savedSighting.getHotlist().getPlateNumber());
        assertEquals("cam-01", savedSighting.getDeviceId());
        
        verify(messagingTemplate, times(1)).convertAndSend("/topic/sightings", sightingDto);
    }

    @Test
    void ingestBatch_InactiveHotlistFound_DoesNothing() {
        Hotlist inactiveHotlist = new Hotlist();
        inactiveHotlist.setPlateNumber("UP14AB1234");
        inactiveHotlist.setStatus(HotlistStatus.RECOVERED);

        when(hotlistRepository.findAll()).thenReturn(Collections.singletonList(inactiveHotlist));

        sightingIngestionService.ingestBatch(request);

        verify(hotlistRepository, times(1)).findAll();
        verify(sightingRepository, never()).save(any(Sighting.class));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void ingestBatch_MultipleSightings_OnlyMatchesAreProcessed() {
        SightingDto nonHotlistedDto = new SightingDto();
        nonHotlistedDto.setPlateNumber("HR26XX9999");
        
        request.setSightings(Arrays.asList(sightingDto, nonHotlistedDto));

        Hotlist activeHotlist = new Hotlist();
        activeHotlist.setPlateNumber("UP14AB1234");
        activeHotlist.setStatus(HotlistStatus.ACTIVE_UNCONFIRMED);

        when(hotlistRepository.findAll()).thenReturn(Collections.singletonList(activeHotlist));

        sightingIngestionService.ingestBatch(request);

        verify(hotlistRepository, times(1)).findAll();
        verify(sightingRepository, times(1)).save(any(Sighting.class));
        verify(messagingTemplate, times(1)).convertAndSend("/topic/sightings", sightingDto);
        verify(messagingTemplate, never()).convertAndSend("/topic/sightings", nonHotlistedDto);
    }
}

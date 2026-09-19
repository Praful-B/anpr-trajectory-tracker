package com.sih.backend.hotlist.dto;

import java.util.List;
import java.util.UUID;

public record HotlistSyncResponse(
        long timestamp,
        List<HotlistEntry> entries
) {
    public record HotlistEntry(
            UUID id,
            String plateNumber,
            String encryptedData
    ) {}
}

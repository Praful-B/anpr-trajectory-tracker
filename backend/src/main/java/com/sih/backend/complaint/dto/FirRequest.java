package com.sih.backend.complaint.dto;

import jakarta.validation.constraints.NotBlank;

public record FirRequest(
        @NotBlank String firReferenceNo,
        String firDocumentRef
) {}

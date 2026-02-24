package com.example.j2ee.dto.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotBlank(message = "Session ID không được để trống")
    private String sessionId;

    @NotBlank(message = "Nội dung không được để trống")
    private String noiDung;
}

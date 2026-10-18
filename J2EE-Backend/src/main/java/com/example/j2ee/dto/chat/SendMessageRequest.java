package com.example.j2ee.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(max = 36, message = "Session ID tối đa 36 ký tự")
    private String sessionId;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 2000, message = "Nội dung tối đa 2000 ký tự")
    private String noiDung;
}

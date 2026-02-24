package com.example.j2ee.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatStatsDTO {

    private long waitingCount;  // Số phiên đang chờ admin
    private long activeCount;   // Số phiên đang xử lý (IN_PROGRESS + WAITING_FOR_USER)
    private long idleCount;     // Số phiên idle
}

package com.example.j2ee.service;

import com.example.j2ee.model.Banner;
import com.example.j2ee.repository.BannerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BannerService.updateThuTu
 */
@ExtendWith(MockitoExtension.class)
class BannerServiceTest {

    @Mock
    private BannerRepository bannerRepository;

    @InjectMocks
    private BannerService bannerService;

    private Banner testBanner;

    @BeforeEach
    void setUp() {
        testBanner = new Banner();
        testBanner.setMaBanner(1);
        testBanner.setTieuDe("Khuyen mai he");
        testBanner.setThuTu(3);
        testBanner.setTrangThai(true);
    }

    @Test
    void updateThuTu_capNhatThuTuVaLuu() {
        when(bannerRepository.findById(1)).thenReturn(Optional.of(testBanner));
        when(bannerRepository.save(any(Banner.class))).thenAnswer(inv -> inv.getArgument(0));

        Banner updated = bannerService.updateThuTu(1, 7);

        assertEquals(7, updated.getThuTu());
        verify(bannerRepository).findById(1);
        verify(bannerRepository).save(testBanner);
    }

    @Test
    void updateThuTu_bannerKhongTonTai_throwIllegalArgument() {
        when(bannerRepository.findById(99)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bannerService.updateThuTu(99, 1));

        assertTrue(ex.getMessage().contains("Banner không tồn tại"));
        verify(bannerRepository, never()).save(any(Banner.class));
    }
}

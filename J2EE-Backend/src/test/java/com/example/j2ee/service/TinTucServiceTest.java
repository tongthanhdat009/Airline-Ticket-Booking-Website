package com.example.j2ee.service;

import com.example.j2ee.model.TinTuc;
import com.example.j2ee.repository.TinTucRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests cho API tin tuc cong khai (trang customer).
 * Dam bao ban nhap KHONG bao gio lo ra ngoai.
 */
@ExtendWith(MockitoExtension.class)
class TinTucServiceTest {

    @Mock
    private TinTucRepository tinTucRepository;

    @InjectMocks
    private TinTucService tinTucService;

    private TinTuc published() {
        TinTuc t = new TinTuc();
        t.setMaTinTuc(1);
        t.setTieuDe("Mo duong bay moi");
        t.setTrangThai("da_xuat_ban");
        return t;
    }

    private TinTuc draft() {
        TinTuc t = new TinTuc();
        t.setMaTinTuc(2);
        t.setTieuDe("Bai nhap");
        t.setTrangThai("ban_nhap");
        return t;
    }

    @Test
    void getPublishedTinTuc_chiLayBaiDaXuatBan() {
        when(tinTucRepository.findByTrangThaiOrderByMaTinTucDesc("da_xuat_ban"))
                .thenReturn(List.of(published()));

        List<TinTuc> result = tinTucService.getPublishedTinTuc();

        assertEquals(1, result.size());
        assertEquals("da_xuat_ban", result.get(0).getTrangThai());
        verify(tinTucRepository).findByTrangThaiOrderByMaTinTucDesc("da_xuat_ban");
    }

    @Test
    void getPublishedById_baiDaXuatBan_traVeBai() {
        when(tinTucRepository.findById(1)).thenReturn(Optional.of(published()));

        assertNotNull(tinTucService.getPublishedById(1));
    }

    @Test
    void getPublishedById_banNhap_traVeNull() {
        when(tinTucRepository.findById(2)).thenReturn(Optional.of(draft()));

        assertNull(tinTucService.getPublishedById(2));
    }

    @Test
    void getPublishedById_khongTonTai_traVeNull() {
        when(tinTucRepository.findById(99)).thenReturn(Optional.empty());

        assertNull(tinTucService.getPublishedById(99));
    }
}

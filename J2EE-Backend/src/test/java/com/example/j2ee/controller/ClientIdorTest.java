package com.example.j2ee.controller;

import com.example.j2ee.dto.ApiResponse;
import com.example.j2ee.model.DatCho;
import com.example.j2ee.model.HanhKhach;
import com.example.j2ee.model.TaiKhoan;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.DatChoRepository;
import com.example.j2ee.repository.DonHangRepository;
import com.example.j2ee.repository.GheDaDatRepository;
import com.example.j2ee.repository.HanhKhachRepository;
import com.example.j2ee.repository.TaiKhoanRepository;
import com.example.j2ee.repository.TrangThaiThanhToanRepository;
import com.example.j2ee.service.BookingService;
import com.example.j2ee.service.DatChoService;
import com.example.j2ee.service.HanhKhachService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * Kiểm tra fix D-9/D-10: user A không đọc/sửa/hủy được dữ liệu của user B.
 */
@ExtendWith(MockitoExtension.class)
class ClientIdorTest {

    @Mock
    private TaiKhoanRepository taiKhoanRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private TaiKhoanController taiKhoanController;

    @Mock
    private DatChoService datChoService;
    @Mock
    private DatChoRepository datChoRepository;
    @Mock
    private DonHangRepository donHangRepository;
    @Mock
    private HanhKhachRepository hanhKhachRepository;
    @Mock
    private ChiTietGheRepository chiTietGheRepository;
    @Mock
    private TrangThaiThanhToanRepository trangThaiThanhToanRepository;
    @Mock
    private GheDaDatRepository gheDaDatRepository;
    @Mock
    private HanhKhachService hanhKhachService;
    @Mock
    private BookingService bookingService;
    @InjectMocks
    private ClientDatChoController datChoController;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    private TaiKhoan account(int id, String email) {
        TaiKhoan tk = new TaiKhoan();
        tk.setMaTaiKhoan(id);
        tk.setEmail(email);
        return tk;
    }

    private HanhKhach passengerWithAccount(String accountEmail) {
        HanhKhach hk = new HanhKhach();
        hk.setMaHanhKhach(10);
        hk.setEmail(accountEmail);
        TaiKhoan tk = new TaiKhoan();
        tk.setEmail(accountEmail);
        hk.setTaiKhoan(tk);
        return hk;
    }

    // ---------- TaiKhoanController ----------

    @Test
    void getAccount_otherEmail_forbidden() {
        loginAs("a@x.com");
        ResponseEntity<com.example.j2ee.dto.ApiResponse<com.example.j2ee.dto.TaiKhoanDTO>> res =
                taiKhoanController.getTaiKhoanByEmail("b@x.com");
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        verifyNoInteractions(taiKhoanRepository);
    }

    @Test
    void getAccount_ownEmail_allowed() {
        loginAs("a@x.com");
        when(taiKhoanRepository.findByEmail("a@x.com"))
                .thenReturn(Optional.of(account(1, "a@x.com")));
        ResponseEntity<?> res = taiKhoanController.getTaiKhoanByEmail("a@x.com");
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void updateAccount_otherId_forbidden() {
        loginAs("a@x.com");
        when(taiKhoanRepository.findById(2))
                .thenReturn(Optional.of(account(2, "b@x.com")));
        ResponseEntity<ApiResponse<TaiKhoan>> res =
                taiKhoanController.updateTaiKhoan(2, Map.of());
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        verify(taiKhoanRepository, never()).save(any());
    }

    @Test
    void changePassword_otherId_forbidden() {
        loginAs("a@x.com");
        when(taiKhoanRepository.findById(2))
                .thenReturn(Optional.of(account(2, "b@x.com")));
        ResponseEntity<ApiResponse<String>> res = taiKhoanController.changePassword(
                2, Map.of("oldPassword", "x", "newPassword", "y"));
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        verify(taiKhoanRepository, never()).save(any());
    }

    // ---------- ClientDatChoController ----------

    private DatCho bookingOf(String ownerEmail) {
        DatCho dc = new DatCho();
        dc.setMaDatCho(5);
        dc.setHanhKhach(passengerWithAccount(ownerEmail));
        return dc;
    }

    @Test
    void getBooking_otherOwner_forbidden() {
        loginAs("a@x.com");
        when(datChoService.getDatChoById(5))
                .thenReturn(Optional.of(bookingOf("b@x.com")));
        ResponseEntity<ApiResponse<DatCho>> res = datChoController.getDatChoById(5);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
    }

    @Test
    void getBooking_owner_allowed() {
        loginAs("a@x.com");
        when(datChoService.getDatChoById(5))
                .thenReturn(Optional.of(bookingOf("a@x.com")));
        ResponseEntity<ApiResponse<DatCho>> res = datChoController.getDatChoById(5);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }

    @Test
    void listBookings_otherPassenger_forbidden() {
        loginAs("a@x.com");
        when(hanhKhachRepository.findById(10))
                .thenReturn(Optional.of(passengerWithAccount("b@x.com")));
        ResponseEntity<ApiResponse<List<DatCho>>> res =
                datChoController.getDatChoByHanhKhach(10);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        verify(datChoService, never()).getDatChoByHanhKhach(anyInt());
    }

    @Test
    void cancelBooking_otherOwner_forbidden() {
        loginAs("a@x.com");
        when(datChoService.getDatChoById(5))
                .thenReturn(Optional.of(bookingOf("b@x.com")));
        ResponseEntity<ApiResponse<Void>> res = datChoController.huyDatCho(5);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        verify(datChoService, never()).huyDatCho(anyInt());
    }
}

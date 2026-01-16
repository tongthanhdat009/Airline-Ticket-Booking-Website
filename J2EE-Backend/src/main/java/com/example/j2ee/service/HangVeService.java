package com.example.j2ee.service;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.model.GiaChuyenBay;
import com.example.j2ee.model.HangVe;
import com.example.j2ee.repository.ChiTietGheRepository;
import com.example.j2ee.repository.GiaChuyenBayRepository;
import com.example.j2ee.repository.HangVeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HangVeService {
    private final HangVeRepository hangVeRepository;
    private final ChiTietGheRepository chiTietGheRepository;
    private final GiaChuyenBayRepository giaChuyenBayRepository;

    public HangVeService(HangVeRepository hangVeRepository,
                         ChiTietGheRepository chiTietGheRepository,
                         GiaChuyenBayRepository giaChuyenBayRepository) {
        this.hangVeRepository = hangVeRepository;
        this.chiTietGheRepository = chiTietGheRepository;
        this.giaChuyenBayRepository = giaChuyenBayRepository;
    }

    public List<HangVe> findAll() {
        return hangVeRepository.findAll();
    }

    public HangVe findById(Integer id) throws Exception {
        return hangVeRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy hạng vé với id: " + id));
    }

    public HangVe createHangVe(HangVe hangVe) throws Exception {
        // Kiểm tra tên hạng vé đã tồn tại chưa
        if (hangVeRepository.existsByTenHangVe(hangVe.getTenHangVe())) {
            throw new Exception("Hạng vé với tên '" + hangVe.getTenHangVe() + "' đã tồn tại!");
        }
        return hangVeRepository.save(hangVe);
    }

    public HangVe updateHangVe(Integer id, HangVe hangVe) throws Exception {
        HangVe hangVeToUpdate = hangVeRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy hạng vé với id: " + id));

        // Kiểm tra nếu thay đổi tên và tên mới đã tồn tại
        if (!hangVeToUpdate.getTenHangVe().equals(hangVe.getTenHangVe()) &&
            hangVeRepository.existsByTenHangVe(hangVe.getTenHangVe())) {
            throw new Exception("Hạng vé với tên '" + hangVe.getTenHangVe() + "' đã tồn tại!");
        }

        hangVeToUpdate.setTenHangVe(hangVe.getTenHangVe());

        return hangVeRepository.save(hangVeToUpdate);
    }

    /**
     * Xóa mềm hạng vé với cascade validation
     * - Soft-delete các chitietghe (seats) liên quan
     * - Soft-delete các giachuyenbay (prices) liên quan
     */
    @Transactional
    public void deleteHangVe(Integer id) throws Exception {
        HangVe hangVe = hangVeRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy hạng vé với id: " + id));

        // Kiểm tra xem hạng vé có đang được sử dụng bởi chitietghe không
        List<ChiTietGhe> chiTietGheList = chiTietGheRepository.findByHangVe_MaHangVe(id);
        if (!chiTietGheList.isEmpty()) {
            // Cascade soft-delete các chitietghe liên quan
            for (ChiTietGhe chiTietGhe : chiTietGheList) {
                chiTietGheRepository.deleteById(chiTietGhe.getMaGhe());
            }
        }

        // Kiểm tra xem hạng vé có đang được sử dụng bởi giachuyenbay không
        List<GiaChuyenBay> giaChuyenBayList = giaChuyenBayRepository.findByHangVe_MaHangVe(id);
        if (!giaChuyenBayList.isEmpty()) {
            // Cascade soft-delete các giachuyenbay liên quan
            for (GiaChuyenBay giaChuyenBay : giaChuyenBayList) {
                giaChuyenBayRepository.deleteById(giaChuyenBay.getMaGia());
            }
        }

        // Soft-delete hạng vé (sẽ tự động mangle tenhangve nhờ @SQLDelete)
        hangVeRepository.deleteById(id);
    }

    /**
     * Khôi phục hạng vé đã xóa mềm
     * Giữ nguyên tên đã delete để tránh xung đột
     */
    @Transactional
    public HangVe restoreHangVe(Integer id) throws Exception {
        // Kiểm tra xem hạng vé đã xóa có tồn tại không
        if (!hangVeRepository.findDeletedById(id).isPresent()) {
            throw new EntityNotFoundException("Không tìm thấy hạng vé đã xóa với id: " + id);
        }

        // Khôi phục hạng vé (giữ nguyên tên đã delete)
        hangVeRepository.restoreById(id);

        // Trả về hạng vé đã khôi phục
        return hangVeRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy hạng vé với id: " + id));
    }

    /**
     * Lấy danh sách hạng vé đã xóa mềm
     */
    public List<HangVe> getDeletedHangVe() {
        return hangVeRepository.findAllDeleted();
    }
}

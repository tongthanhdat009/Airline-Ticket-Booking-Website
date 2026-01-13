package com.example.j2ee.service;

import com.example.j2ee.model.HangVe;
import com.example.j2ee.repository.HangVeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HangVeService {
    private final HangVeRepository hangVeRepository;

    public HangVeService(HangVeRepository hangVeRepository) {
        this.hangVeRepository = hangVeRepository;
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

    public void deleteHangVe(Integer id) throws Exception {
        if (!hangVeRepository.existsById(id)) {
            throw new Exception("Không tìm thấy hạng vé với id: " + id);
        }
        hangVeRepository.deleteById(id);
    }
}

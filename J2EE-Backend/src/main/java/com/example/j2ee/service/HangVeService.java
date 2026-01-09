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

    public HangVe updateHangVe(Integer id, HangVe hangVe) throws Exception {
        if(hangVe.getSucChua() <= 0){
            throw new Exception("Sức chứa không thể là số âm và phải lớn hơn 0.");
        }
        HangVe hangVeToUpdate = hangVeRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy hạng vé với id: " + id));

        hangVeToUpdate.setTenHangVe(hangVe.getTenHangVe());
        hangVeToUpdate.setSucChua(hangVe.getSucChua());

        return hangVeRepository.save(hangVeToUpdate);
    }
}

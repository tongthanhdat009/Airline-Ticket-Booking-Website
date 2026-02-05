package com.example.j2ee.controller;

import com.example.j2ee.model.ChiTietGhe;
import com.example.j2ee.service.ChiTietGheService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard/ghechuyenbay")
public class GheChuyenBayController {
    private final ChiTietGheService chiTietGheService;

    public GheChuyenBayController(ChiTietGheService chiTietGheService) {
        this.chiTietGheService = chiTietGheService;
    }

    @GetMapping
    public List<ChiTietGhe> getAllChiTietGhe(){
        return chiTietGheService.getAllChiTietGhe();
    }

    @GetMapping("/{maChuyenBay}")
    public List<ChiTietGhe> getChiTietGheByChuyenBay(@PathVariable int maChuyenBay){
        return chiTietGheService.getAvailableSeatsForFlight(maChuyenBay);
    }
}

import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaUserCheck,
  FaChair,
  FaExchangeAlt,
  FaTimesCircle,
  FaUsers,
  FaPlane,
  FaTicketAlt,
  FaCheckCircle,
  FaCalendar,
  FaMapMarkerAlt,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaEdit,
  FaClock,
  FaMoneyBill
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Dữ liệu hardcode cho danh sách đặt chỗ
const MOCK_DAT_CHO = [
  {
    maDatCho: 'DC001',
    maVe: 'VN123456',
    hanhKhach: {
      hoVaTen: 'Nguyễn Văn An',
      cccd: '001234567890',
      gioiTinh: 'Nam',
      ngaySinh: '1990-05-15',
      soDienThoai: '0901234567',
      email: 'nguyenvan.a@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN001',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      ngayGio: '2025-02-10T08:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'A1', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 1750000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC002',
    maVe: 'VN123457',
    hanhKhach: {
      hoVaTen: 'Trần Thị Bình',
      cccd: '001234567891',
      gioiTinh: 'Nữ',
      ngaySinh: '1992-08-20',
      soDienThoai: '0912345678',
      email: 'tranthi.b@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN001',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      ngayGio: '2025-02-10T08:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'A2', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 1750000,
    trangThaiCheckIn: 'Đã check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC003',
    maVe: 'VN123458',
    hanhKhach: {
      hoVaTen: 'Lê Văn Cường',
      cccd: '001234567892',
      gioiTinh: 'Nam',
      ngaySinh: '1988-03-10',
      soDienThoai: '0923456789',
      email: 'levan.c@yahoo.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN001',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      ngayGio: '2025-02-10T08:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'B1', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 1750000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC004',
    maVe: 'VN123459',
    hanhKhach: {
      hoVaTen: 'Phạm Thị Dung',
      cccd: '001234567893',
      gioiTinh: 'Nữ',
      ngaySinh: '1995-12-25',
      soDienThoai: '0934567890',
      email: 'phamthi.d@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN002',
      sanBayDi: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      sanBayDen: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
      ngayGio: '2025-02-12T10:30:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'C1', loaiGhe: 'ThuongGia', hang: 'Thương gia' },
    hangVe: 'Thương gia',
    giaTien: 5200000,
    trangThaiCheckIn: 'Đã check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Khứ hồi'
  },
  {
    maDatCho: 'DC005',
    maVe: 'VN123460',
    hanhKhach: {
      hoVaTen: 'Hoàng Văn Em',
      cccd: '001234567894',
      gioiTinh: 'Nam',
      ngaySinh: '1985-07-08',
      soDienThoai: '0945678901',
      email: 'hoangvan.e@company.vn'
    },
    chuyenBay: {
      maChuyenBay: 'VN002',
      sanBayDi: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      sanBayDen: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
      ngayGio: '2025-02-12T10:30:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'C2', loaiGhe: 'ThuongGia', hang: 'Thương gia' },
    hangVe: 'Thương gia',
    giaTien: 5200000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Khứ hồi'
  },
  {
    maDatCho: 'DC006',
    maVe: 'VN123461',
    hanhKhach: {
      hoVaTen: 'Nguyễn Thị Flower',
      cccd: '001234567895',
      gioiTinh: 'Nữ',
      ngaySinh: '1998-04-30',
      soDienThoai: '0956789012',
      email: 'nguyenthi.f@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN003',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'CXR', tenSanBay: 'Cam Ranh', thanhPho: 'Nha Trang' },
      ngayGio: '2025-02-15T14:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'F1', loaiGhe: 'PhoThongDacBiet', hang: 'Phổ thông đặc biệt' },
    hangVe: 'Phổ thông đặc biệt',
    giaTien: 2800000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC007',
    maVe: 'VN123462',
    hanhKhach: {
      hoVaTen: 'Đỗ Văn Giang',
      cccd: '001234567896',
      gioiTinh: 'Nam',
      ngaySinh: '1991-09-12',
      soDienThoai: '0967890123',
      email: 'dovan.g@outlook.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN003',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'CXR', tenSanBay: 'Cam Ranh', thanhPho: 'Nha Trang' },
      ngayGio: '2025-02-15T14:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'F2', loaiGhe: 'PhoThongDacBiet', hang: 'Phổ thông đặc biệt' },
    hangVe: 'Phổ thông đặc biệt',
    giaTien: 2800000,
    trangThaiCheckIn: 'Đã check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC008',
    maVe: 'VN123463',
    hanhKhach: {
      hoVaTen: 'Bùi Thị Hương',
      cccd: '001234567897',
      gioiTinh: 'Nữ',
      ngaySinh: '1993-11-22',
      soDienThoai: '0978901234',
      email: 'buithi.h@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN004',
      sanBayDi: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
      sanBayDen: { maSanBay: 'PQC', tenSanBay: 'Phú Quốc', thanhPho: 'Phú Quốc' },
      ngayGio: '2025-02-18T09:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'A1', loaiGhe: 'ThuongGia', hang: 'Thương gia' },
    hangVe: 'Thương gia',
    giaTien: 6200000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Khứ hồi'
  },
  {
    maDatCho: 'DC009',
    maVe: 'VN123464',
    hanhKhach: {
      hoVaTen: 'Văn Tiến',
      cccd: '001234567898',
      gioiTinh: 'Nam',
      ngaySinh: '1987-02-14',
      soDienThoai: '0989012345',
      email: 'vanti@company.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN005',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'VCA', tenSanBay: 'Cần Thơ', thanhPho: 'Cần Thơ' },
      ngayGio: '2025-02-20T16:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'B5', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 1850000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC010',
    maVe: 'VN123465',
    hanhKhach: {
      hoVaTen: 'Lê Thị Kim',
      cccd: '001234567899',
      gioiTinh: 'Nữ',
      ngaySinh: '1996-06-18',
      soDienThoai: '0990123456',
      email: 'lienthi.k@gmail.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN006',
      sanBayDi: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      sanBayDen: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      ngayGio: '2025-02-22T07:30:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'E1', loaiGhe: 'PhoThongDacBiet', hang: 'Phổ thông đặc biệt' },
    hangVe: 'Phổ thông đặc biệt',
    giaTien: 2950000,
    trangThaiCheckIn: 'Đã check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  },
  {
    maDatCho: 'DC011',
    maVe: 'VN123466',
    hanhKhach: {
      hoVaTen: 'Phạm Minh Long',
      cccd: '001234567900',
      gioiTinh: 'Nam',
      ngaySinh: '1989-08-08',
      soDienThoai: '0912345671',
      email: 'phamminh.l@yahoo.com'
    },
    chuyenBay: {
      maChuyenBay: 'VN007',
      sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
      sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      ngayGio: '2025-02-25T08:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'A10', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 3000000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Khứ hồi'
  },
  {
    maDatCho: 'DC012',
    maVe: 'VN123467',
    hanhKhach: {
      hoVaTen: 'Ngô Quyết Mạnh',
      cccd: '001234567901',
      gioiTinh: 'Nam',
      ngaySinh: '1994-01-25',
      soDienThoai: '0923456790',
      email: 'ngoquyen.m@fpt.vn'
    },
    chuyenBay: {
      maChuyenBay: 'VN008',
      sanBayDi: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
      sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
      ngayGio: '2025-02-28T11:00:00',
      trangThai: 'Chưa bay'
    },
    ghe: { maGhe: 'C5', loaiGhe: 'Thuong', hang: 'Phổ thông' },
    hangVe: 'Phổ thông',
    giaTien: 2100000,
    trangThaiCheckIn: 'Chưa check-in',
    trangThai: 'Đã đặt chỗ',
    loaiVe: 'Một chiều'
  }
];

// Dữ liệu hardcode cho danh sách chuyến bay
const MOCK_CHUYEN_BAY = [
  {
    maChuyenBay: 'VN001',
    sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
    sanBayDen: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
    ngayGio: '2025-02-10T08:00:00',
    trangThai: 'Chưa bay',
    soGheTrong: 156,
    tongSoGhe: 180
  },
  {
    maChuyenBay: 'VN002',
    sanBayDi: { maSanBay: 'HAN', tenSanBay: 'Nội Bài', thanhPho: 'Hà Nội' },
    sanBayDen: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
    ngayGio: '2025-02-12T10:30:00',
    trangThai: 'Chưa bay',
    soGheTrong: 45,
    tongSoGhe: 180
  },
  {
    maChuyenBay: 'VN003',
    sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
    sanBayDen: { maSanBay: 'CXR', tenSanBay: 'Cam Ranh', thanhPho: 'Nha Trang' },
    ngayGio: '2025-02-15T14:00:00',
    trangThai: 'Chưa bay',
    soGheTrong: 98,
    tongSoGhe: 180
  },
  {
    maChuyenBay: 'VN004',
    sanBayDi: { maSanBay: 'DAD', tenSanBay: 'Đà Nẵng', thanhPho: 'Đà Nẵng' },
    sanBayDen: { maSanBay: 'PQC', tenSanBay: 'Phú Quốc', thanhPho: 'Phú Quốc' },
    ngayGio: '2025-02-18T09:00:00',
    trangThai: 'Chưa bay',
    soGheTrong: 120,
    tongSoGhe: 180
  },
  {
    maChuyenBay: 'VN005',
    sanBayDi: { maSanBay: 'SGN', tenSanBay: 'Tân Sơn Nhất', thanhPho: 'TP. Hồ Chí Minh' },
    sanBayDen: { maSanBay: 'VCA', tenSanBay: 'Cần Thơ', thanhPho: 'Cần Thơ' },
    ngayGio: '2025-02-20T16:00:00',
    trangThai: 'Chưa bay',
    soGheTrong: 165,
    tongSoGhe: 180
  }
];

const QuanLyDatCho = () => {
  // Tab active
  const [activeTab, setActiveTab] = useState('quan-ly-dat-cho');

  // States cho dữ liệu
  const [datChoList, setDatChoList] = useState(MOCK_DAT_CHO);
  const [filteredDatCho, setFilteredDatCho] = useState(MOCK_DAT_CHO);
  const [chuyenBayList] = useState(MOCK_CHUYEN_BAY);
  const [selectedChuyenBay, setSelectedChuyenBay] = useState(null);
  const [passengersOnFlight, setPassengersOnFlight] = useState([]);

  // States cho search
  const [search, setSearch] = useState('');

  // States cho modal
  const [selectedDatCho, setSelectedDatCho] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDoiGheModalOpen, setIsDoiGheModalOpen] = useState(false);
  const [isDoiChuyenModalOpen, setIsDoiChuyenModalOpen] = useState(false);
  const [isHuyVeModalOpen, setIsHuyVeModalOpen] = useState(false);

  // States cho Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // States cho ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    onConfirm: null
  });

  // States cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ConfirmDialog handlers
  const showConfirm = (title, message, type, confirmText, onConfirm) => {
    setConfirmDialog({
      isVisible: true,
      title,
      message,
      type,
      confirmText,
      onConfirm
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isVisible: false }));
  };

  // Filter theo search text
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredDatCho(datChoList);
    } else {
      const filtered = datChoList.filter(
        (dc) =>
          dc.maDatCho.toLowerCase().includes(search.toLowerCase()) ||
          dc.maVe.toLowerCase().includes(search.toLowerCase()) ||
          dc.hanhKhach.hoVaTen.toLowerCase().includes(search.toLowerCase()) ||
          dc.hanhKhach.cccd.includes(search) ||
          dc.chuyenBay.maChuyenBay.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDatCho(filtered);
    }
    setCurrentPage(1);
  }, [search, datChoList]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDatCho.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDatCho.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format functions
  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Handlers
  const handleViewDetail = (datCho) => {
    setSelectedDatCho(datCho);
    setIsDetailModalOpen(true);
  };

  const handleCheckIn = (datCho) => {
    setSelectedDatCho(datCho);
    setIsCheckInModalOpen(true);
  };

  const handleDoiGhe = (datCho) => {
    setSelectedDatCho(datCho);
    setIsDoiGheModalOpen(true);
  };

  const handleDoiChuyen = (datCho) => {
    setSelectedDatCho(datCho);
    setIsDoiChuyenModalOpen(true);
  };

  const handleHuyVe = (datCho) => {
    setSelectedDatCho(datCho);
    setIsHuyVeModalOpen(true);
  };

  const confirmCheckIn = () => {
    showConfirm(
      'Xác nhận Check-in',
      `Bạn có chắc chắn muốn check-in cho hành khách ${selectedDatCho?.hanhKhach.hoVaTen}?`,
      'warning',
      'Check-in',
      () => {
        const updatedList = datChoList.map(dc =>
          dc.maDatCho === selectedDatCho.maDatCho
            ? { ...dc, trangThaiCheckIn: 'Đã check-in' }
            : dc
        );
        setDatChoList(updatedList);
        setIsCheckInModalOpen(false);
        hideConfirm();
        showToast('Check-in thành công!');
      }
    );
  };

  const confirmDoiGhe = (newGhe) => {
    showConfirm(
      'Xác nhận đổi ghế',
      `Đổi ghế từ ${selectedDatCho?.ghe.maGhe} sang ${newGhe}?`,
      'warning',
      'Xác nhận',
      () => {
        const updatedList = datChoList.map(dc =>
          dc.maDatCho === selectedDatCho.maDatCho
            ? { ...dc, ghe: { ...dc.ghe, maGhe: newGhe } }
            : dc
        );
        setDatChoList(updatedList);
        setIsDoiGheModalOpen(false);
        hideConfirm();
        showToast(`Đổi ghế sang ${newGhe} thành công!`);
      }
    );
  };

  const confirmDoiChuyen = (newChuyenBay) => {
    showConfirm(
      'Xác nhận đổi chuyến',
      `Đổi từ chuyến ${selectedDatCho?.chuyenBay.maChuyenBay} sang ${newChuyenBay.maChuyenBay}?`,
      'warning',
      'Xác nhận',
      () => {
        const updatedList = datChoList.map(dc =>
          dc.maDatCho === selectedDatCho.maDatCho
            ? { ...dc, chuyenBay: newChuyenBay, trangThaiCheckIn: 'Chưa check-in' }
            : dc
        );
        setDatChoList(updatedList);
        setIsDoiChuyenModalOpen(false);
        hideConfirm();
        showToast(`Đổi sang chuyến ${newChuyenBay.maChuyenBay} thành công!`);
      }
    );
  };

  const confirmHuyVe = (lyDo) => {
    showConfirm(
      'Xác nhận hủy vé',
      `Bạn có chắc chắn muốn hủy vé của hành khách ${selectedDatCho?.hanhKhach.hoVaTen}? Lý do: ${lyDo}`,
      'danger',
      'Hủy vé',
      () => {
        const updatedList = datChoList.filter(dc => dc.maDatCho !== selectedDatCho.maDatCho);
        setDatChoList(updatedList);
        setIsHuyVeModalOpen(false);
        hideConfirm();
        showToast('Hủy vé thành công!');
      }
    );
  };

  // Xem danh sách khách trên chuyến bay
  const handleViewPassengers = (chuyenBay) => {
    setSelectedChuyenBay(chuyenBay);
    const passengers = datChoList.filter(dc => dc.chuyenBay.maChuyenBay === chuyenBay.maChuyenBay);
    setPassengersOnFlight(passengers);
  };

  // Get status info
  const getCheckInStatus = (status) => {
    switch (status) {
      case 'Đã check-in':
        return { text: 'Đã check-in', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> };
      case 'Chưa check-in':
        return { text: 'Chưa check-in', color: 'bg-yellow-100 text-yellow-700', icon: <FaClock /> };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: <FaTicketAlt /> };
    }
  };

  const getTrangThaiDatCho = (status) => {
    switch (status) {
      case 'Đã đặt chỗ':
        return { text: 'Đã đặt chỗ', color: 'bg-blue-100 text-blue-700' };
      case 'Đã hủy':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Render tabs
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('quan-ly-dat-cho')}
        className={`px-6 py-3 font-semibold transition-all ${
          activeTab === 'quan-ly-dat-cho'
            ? 'bg-violet-600 text-white border-t-2 border-violet-600'
            : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
        }`}
      >
        <FaTicketAlt className="inline mr-2" />
        Quản lý đặt chỗ
      </button>
      <button
        onClick={() => setActiveTab('danh-sach-hanh-khach')}
        className={`px-6 py-3 font-semibold transition-all ${
          activeTab === 'danh-sach-hanh-khach'
            ? 'bg-violet-600 text-white border-t-2 border-violet-600'
            : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
        }`}
      >
        <FaUsers className="inline mr-2" />
        Danh sách hành khách theo chuyến
      </button>
    </div>
  );

  // Render Quản lý đặt chỗ tab
  const renderQuanLyDatCho = () => (
    <div>
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng đặt chỗ</p>
              <p className="text-3xl font-bold mt-2">{datChoList.length}</p>
            </div>
            <FaTicketAlt size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Đã check-in</p>
              <p className="text-3xl font-bold mt-2">
                {datChoList.filter(dc => dc.trangThaiCheckIn === 'Đã check-in').length}
              </p>
            </div>
            <FaUserCheck size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Chưa check-in</p>
              <p className="text-3xl font-bold mt-2">
                {datChoList.filter(dc => dc.trangThaiCheckIn === 'Chưa check-in').length}
              </p>
            </div>
            <FaClock size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Chuyến bay</p>
              <p className="text-3xl font-bold mt-2">{chuyenBayList.length}</p>
            </div>
            <FaPlane size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đặt chỗ, mã vé, tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Mã Đặt Chỗ</th>
                <th className="px-4 py-4 text-left font-semibold">Hành khách</th>
                <th className="px-4 py-4 text-left font-semibold">Chuyến bay</th>
                <th className="px-4 py-4 text-left font-semibold">Ghế</th>
                <th className="px-4 py-4 text-center font-semibold">Check-in</th>
                <th className="px-4 py-4 text-right font-semibold">Giá vé</th>
                <th className="px-4 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((dc, index) => {
                  const checkInStatus = getCheckInStatus(dc.trangThaiCheckIn);
                  return (
                    <tr
                      key={dc.maDatCho}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-violet-50 transition-colors`}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-violet-600">#{dc.maDatCho}</p>
                          <p className="text-xs text-gray-500">{dc.maVe}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{dc.hanhKhach.hoVaTen}</p>
                          <p className="text-xs text-gray-500">CCCD: {dc.hanhKhach.cccd}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{dc.chuyenBay.maChuyenBay}</p>
                          <p className="text-xs text-gray-500">
                            {dc.chuyenBay.sanBayDi.thanhPho} → {dc.chuyenBay.sanBayDen.thanhPho}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(dc.chuyenBay.ngayGio)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dc.ghe.loaiGhe === 'ThuongGia' ? 'bg-purple-100 text-purple-700' :
                          dc.ghe.loaiGhe === 'PhoThongDacBiet' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {dc.ghe.maGhe}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${checkInStatus.color}`}>
                          {checkInStatus.icon} {checkInStatus.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(dc.giaTien)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCheckIn(dc)}
                            className={`p-2 rounded-lg transition-colors ${
                              dc.trangThaiCheckIn === 'Đã check-in'
                                ? 'bg-green-100 text-green-400 cursor-not-allowed'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title="Check-in"
                            disabled={dc.trangThaiCheckIn === 'Đã check-in'}
                          >
                            <FaUserCheck />
                          </button>
                          <button
                            onClick={() => handleDoiGhe(dc)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Đổi ghế"
                          >
                            <FaChair />
                          </button>
                          <button
                            onClick={() => handleDoiChuyen(dc)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Đổi chuyến"
                          >
                            <FaExchangeAlt />
                          </button>
                          <button
                            onClick={() => handleHuyVe(dc)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Hủy vé"
                          >
                            <FaTimesCircle />
                          </button>
                          <button
                            onClick={() => handleViewDetail(dc)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaTicketAlt className="text-gray-300 text-5xl" />
                      <p className="text-gray-500 font-medium">
                        Không tìm thấy đặt chỗ nào.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredDatCho.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị{' '}
            <span className="font-bold text-violet-600">{indexOfFirstItem + 1}</span> đến{' '}
            <span className="font-bold text-violet-600">
              {Math.min(indexOfLastItem, filteredDatCho.length)}
            </span>{' '}
            của{' '}
            <span className="font-bold text-violet-600">{filteredDatCho.length}</span> kết quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  ← Trước
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-violet-600 text-white shadow-lg'
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );

  // Render Danh sách hành khách theo chuyến tab
  const renderDanhSachHanhKhach = () => (
    <div>
      {/* Danh sách chuyến bay */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          <FaPlane className="inline mr-2 text-violet-600" />
          Chọn chuyến bay
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chuyenBayList.map((cb) => (
            <div
              key={cb.maChuyenBay}
              onClick={() => handleViewPassengers(cb)}
              className={`bg-white rounded-xl shadow-md border-2 p-4 cursor-pointer transition-all hover:shadow-xl ${
                selectedChuyenBay?.maChuyenBay === cb.maChuyenBay
                  ? 'border-violet-500 ring-2 ring-violet-200'
                  : 'border-gray-200 hover:border-violet-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-violet-600">{cb.maChuyenBay}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  cb.trangThai === 'Chưa bay' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {cb.trangThai}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{cb.sanBayDi.thanhPho}</span>
                <span>→</span>
                <span>{cb.sanBayDen.thanhPho}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaCalendar className="text-orange-500" />
                <span>{formatDateTime(cb.ngayGio)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <FaUsers className="inline mr-1 text-violet-500" />
                  Ghế trống: <span className="font-bold text-violet-600">{cb.soGheTrong}/{cb.tongSoGhe}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách hành khách của chuyến bay đã chọn */}
      {selectedChuyenBay && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-r from-violet-600 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              <FaUsers className="inline mr-2" />
              Danh sách hành khách - {selectedChuyenBay.maChuyenBay}
            </h3>
            <p className="text-violet-100 text-sm mt-1">
              {selectedChuyenBay.sanBayDi.thanhPho} → {selectedChuyenBay.sanBayDen.thanhPho} | {formatDateTime(selectedChuyenBay.ngayGio)}
            </p>
          </div>

          <div className="p-6">
            {/* Thống kê chuyến bay */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{passengersOnFlight.length}</p>
                <p className="text-sm text-blue-600">Tổng hành khách</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {passengersOnFlight.filter(p => p.trangThaiCheckIn === 'Đã check-in').length}
                </p>
                <p className="text-sm text-green-600">Đã check-in</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {passengersOnFlight.filter(p => p.trangThaiCheckIn === 'Chưa check-in').length}
                </p>
                <p className="text-sm text-yellow-600">Chưa check-in</p>
              </div>
            </div>

            {/* Bảng hành khách */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">STT</th>
                    <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                    <th className="px-4 py-3 text-left font-semibold">CCCD</th>
                    <th className="px-4 py-3 text-left font-semibold">Mã vé</th>
                    <th className="px-4 py-3 text-left font-semibold">Ghế</th>
                    <th className="px-4 py-3 text-left font-semibold">Hạng vé</th>
                    <th className="px-4 py-3 text-center font-semibold">Check-in</th>
                    <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passengersOnFlight.length > 0 ? (
                    passengersOnFlight.map((passenger, index) => {
                      const checkInStatus = getCheckInStatus(passenger.trangThaiCheckIn);
                      return (
                        <tr
                          key={passenger.maDatCho}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-violet-50 transition-colors`}
                        >
                          <td className="px-4 py-3 font-medium">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{passenger.hanhKhach.hoVaTen}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{passenger.hanhKhach.cccd}</td>
                          <td className="px-4 py-3 font-mono text-violet-600">{passenger.maVe}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              passenger.ghe.loaiGhe === 'ThuongGia' ? 'bg-purple-100 text-purple-700' :
                              passenger.ghe.loaiGhe === 'PhoThongDacBiet' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {passenger.ghe.maGhe}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{passenger.hangVe}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${checkInStatus.color}`}>
                              {checkInStatus.icon} {checkInStatus.text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleCheckIn(passenger)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  passenger.trangThaiCheckIn === 'Đã check-in'
                                    ? 'bg-green-100 text-green-400 cursor-not-allowed'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title="Check-in"
                                disabled={passenger.trangThaiCheckIn === 'Đã check-in'}
                              >
                                <FaUserCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleViewDetail(passenger)}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Xem chi tiết"
                              >
                                <FaEye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Không có hành khách nào trên chuyến bay này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Modal chi tiết đặt chỗ
  const renderDetailModal = () => {
    if (!isDetailModalOpen || !selectedDatCho) return null;

    const dc = selectedDatCho;
    const checkInStatus = getCheckInStatus(dc.trangThaiCheckIn);
    const trangThaiDatCho = getTrangThaiDatCho(dc.trangThai);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-linear-to-r from-violet-600 to-purple-600 px-6 py-4 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Chi tiết đặt chỗ</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Thông tin đặt chỗ */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-violet-600" />
                Thông tin đặt chỗ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Mã đặt chỗ</p>
                  <p className="font-bold text-violet-600">#{dc.maDatCho}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Mã vé</p>
                  <p className="font-bold text-violet-600">{dc.maVe}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trangThaiDatCho.color}`}>
                    {trangThaiDatCho.text}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Check-in</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${checkInStatus.color}`}>
                    {checkInStatus.icon} {checkInStatus.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin hành khách */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUserCheck className="text-violet-600" />
                Thông tin hành khách
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-semibold">{dc.hanhKhach.hoVaTen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giới tính</p>
                    <p className="font-semibold">{dc.hanhKhach.gioiTinh}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CCCD</p>
                    <p className="font-semibold">{dc.hanhKhach.cccd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-semibold">{formatDate(dc.hanhKhach.ngaySinh)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <p className="font-semibold">{dc.hanhKhach.soDienThoai}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <p className="font-semibold">{dc.hanhKhach.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin chuyến bay */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPlane className="text-violet-600" />
                Thông tin chuyến bay
              </h3>
              <div className="bg-linear-to-r from-violet-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500">Mã chuyến bay</p>
                    <p className="font-bold text-violet-600">{dc.chuyenBay.maChuyenBay}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500">Đi</p>
                    <p className="font-bold text-gray-800">{dc.chuyenBay.sanBayDi.thanhPho}</p>
                    <p className="text-xs text-gray-500">{dc.chuyenBay.sanBayDi.tenSanBay}</p>
                  </div>
                  <div className="text-violet-600 text-2xl">→</div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500">Đến</p>
                    <p className="font-bold text-gray-800">{dc.chuyenBay.sanBayDen.thanhPho}</p>
                        <p className="text-xs text-gray-500">{dc.chuyenBay.sanBayDen.tenSanBay}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500">Giờ bay</p>
                    <p className="font-bold text-gray-800">{formatDateTime(dc.chuyenBay.ngayGio)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin ghế */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChair className="text-violet-600" />
                Thông tin ghế
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Số ghế</p>
                  <p className="text-2xl font-bold text-violet-600">{dc.ghe.maGhe}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Hạng ghế</p>
                  <p className="font-semibold">{dc.ghe.loaiGhe}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Hạng vé</p>
                  <p className="font-semibold">{dc.hangVe}</p>
                </div>
              </div>
            </div>

            {/* Thông tin giá */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMoneyBill className="text-violet-600" />
                Thông tin giá
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Giá vé</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(dc.giaTien)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Loại vé</p>
                  <p className="font-semibold">{dc.loaiVe}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 sticky bottom-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Check-in
  const renderCheckInModal = () => {
    if (!isCheckInModalOpen || !selectedDatCho) return null;

    const dc = selectedDatCho;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUserCheck />
              Check-in hành khách
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Hành khách</p>
              <p className="font-bold text-lg">{dc.hanhKhach.hoVaTen}</p>
              <p className="text-sm text-gray-500">Mã đặt chỗ</p>
              <p className="font-semibold text-violet-600">#{dc.maDatCho}</p>
              <p className="text-sm text-gray-500">Chuyến bay</p>
              <p className="font-semibold">{dc.chuyenBay.maChuyenBay} - {dc.chuyenBay.sanBayDi.thanhPho} → {dc.chuyenBay.sanBayDen.thanhPho}</p>
              <p className="text-sm text-gray-500">Ghế</p>
              <p className="font-semibold">{dc.ghe.maGhe} ({dc.hangVe})</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmCheckIn}
                className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold transition-all"
              >
                Xác nhận Check-in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Đổi ghế
  const renderDoiGheModal = () => {
    if (!isDoiGheModalOpen || !selectedDatCho) return null;

    const dc = selectedDatCho;
    const availableSeats = ['A3', 'A4', 'A5', 'B3', 'B4', 'B5', 'C3', 'C4', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2'];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="bg-linear-to-r from-blue-500 to-cyan-600 px-6 py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChair />
              Đổi ghế
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Hành khách</p>
              <p className="font-bold">{dc.hanhKhach.hoVaTen}</p>
              <p className="text-sm text-gray-500 mt-2">Ghế hiện tại</p>
              <p className="font-bold text-violet-600 text-lg">{dc.ghe.maGhe} ({dc.hangVe})</p>
            </div>
            <p className="font-semibold mb-3">Chọn ghế mới:</p>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {availableSeats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => confirmDoiGhe(seat)}
                  className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold"
                >
                  {seat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsDoiGheModalOpen(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Đổi chuyến
  const renderDoiChuyenModal = () => {
    if (!isDoiChuyenModalOpen || !selectedDatCho) return null;

    const dc = selectedDatCho;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-linear-to-r from-orange-500 to-amber-600 px-6 py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaExchangeAlt />
              Đổi chuyến bay
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Hành khách</p>
              <p className="font-bold">{dc.hanhKhach.hoVaTen}</p>
              <p className="text-sm text-gray-500 mt-2">Chuyến bay hiện tại</p>
              <p className="font-semibold text-violet-600">{dc.chuyenBay.maChuyenBay} - {dc.chuyenBay.sanBayDi.thanhPho} → {dc.chuyenBay.sanBayDen.thanhPho}</p>
              <p className="text-sm text-gray-500">{formatDateTime(dc.chuyenBay.ngayGio)}</p>
            </div>
            <p className="font-semibold mb-3">Chọn chuyến bay mới:</p>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {chuyenBayList.filter(cb => cb.maChuyenBay !== dc.chuyenBay.maChuyenBay).map((cb) => (
                <button
                  key={cb.maChuyenBay}
                  onClick={() => confirmDoiChuyen(cb)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-violet-600">{cb.maChuyenBay}</p>
                      <p className="text-sm text-gray-600">{cb.sanBayDi.thanhPho} → {cb.sanBayDen.thanhPho}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDateTime(cb.ngayGio)}</p>
                      <p className="text-xs text-green-600">{cb.soGheTrong} ghế trống</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsDoiChuyenModalOpen(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Hủy vé
  const renderHuyVeModal = () => {
    if (!isHuyVeModalOpen || !selectedDatCho) return null;

    const dc = selectedDatCho;
    const [lyDo, setLyDo] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="bg-linear-to-r from-red-500 to-rose-600 px-6 py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaTimesCircle />
              Hủy vé
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Hành khách</p>
              <p className="font-bold">{dc.hanhKhach.hoVaTen}</p>
              <p className="text-sm text-gray-500 mt-2">Mã đặt chỗ</p>
              <p className="font-semibold text-violet-600">#{dc.maDatCho}</p>
              <p className="text-sm text-gray-500">Chuyến bay</p>
              <p className="font-semibold">{dc.chuyenBay.maChuyenBay}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lý do hủy:</label>
              <select
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">-- Chọn lý do --</option>
                <option value="Khách hàng yêu cầu hủy">Khách hàng yêu cầu hủy</option>
                <option value="Thay đổi lịch trình">Thay đổi lịch trình</option>
                <option value="Chuyến bay bị hủy">Chuyến bay bị hủy</option>
                <option value="Trùng chuyến bay">Trùng chuyến bay</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsHuyVeModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => lyDo && confirmHuyVe(lyDo)}
                disabled={!lyDo}
                className="flex-1 px-4 py-2 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card title="Quản lý đặt chỗ">
      {/* Toast Component */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isVisible={confirmDialog.isVisible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={hideConfirm}
      />

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      {activeTab === 'quan-ly-dat-cho' && renderQuanLyDatCho()}
      {activeTab === 'danh-sach-hanh-khach' && renderDanhSachHanhKhach()}

      {/* Modals */}
      {renderDetailModal()}
      {renderCheckInModal()}
      {renderDoiGheModal()}
      {renderDoiChuyenModal()}
      {renderHuyVeModal()}
    </Card>
  );
};

export default QuanLyDatCho;

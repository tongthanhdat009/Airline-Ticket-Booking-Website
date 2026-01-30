import { useRef, useState, useEffect, useMemo} from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

function DanhSachNgayBay({ ngayChon, onSelect = () => {} }) {
  const soNgay = 30;
  const soHienThi = 5;
  const itemWidth = 110;
  const gap = 12;
  const scrollRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [startDate] = useState(() => new Date(ngayChon || new Date()));

  const days = useMemo(() => {
    return Array.from({ length: soNgay }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return {
        weekday: d.toLocaleDateString("vi-VN", { weekday: "long" }),
        day: d.getDate(),
        month: d.getMonth() + 1,
        dateStr: d.toISOString().split("T")[0],
      };
    });
  }, [startDate]);

  const totalItemWidth = itemWidth + gap;
  const leadingPlaceholders = 2;

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const containerWidth = soHienThi * totalItemWidth - gap;
    const scrollTo =
      (index + leadingPlaceholders) * totalItemWidth -
      containerWidth / 2 +
      itemWidth / 2;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    scrollToIndex(index);
    try {
      const selectedDate = new Date(startDate);
      selectedDate.setDate(startDate.getDate() + index);
      onSelect(selectedDate);
    } catch (error) {
      console.error("Lỗi khi gọi hàm onSelect:", error);
    }
  };

  const scrollLeft = () => handleSelect(Math.max(selectedIndex - 1, 0));
  const scrollRight = () =>
    handleSelect(Math.min(selectedIndex + 1, days.length - 1));

  // Xử lý ngày truyền vào (props)
  useEffect(() => {
    if (!ngayChon) return;

    const ngayProp = new Date(ngayChon);
    const ngayStr = ngayProp.toISOString().split("T")[0];
    const foundIndex = days.findIndex((d) => d.dateStr === ngayStr);

    if (foundIndex !== -1 && foundIndex !== selectedIndex) {
      setSelectedIndex(foundIndex);
      scrollToIndex(foundIndex);
    }
  }, [ngayChon, days]);

  return (
    <div className="relative flex items-center justify-center mt-3 px-38">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Nút trái */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 z-10 bg-white shadow-md rounded-full p-2 cursor-pointer"
      >
        <IoChevronBack className="w-5 h-5 text-gray-700" />
      </button>

      {/* Danh sách ngày */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 scroll-smooth hide-scrollbar justify-start"
        style={{
          width: `${soHienThi * totalItemWidth - gap}px`,
          scrollSnapType: "x mandatory",
        }}
      >
        <div style={{ minWidth: itemWidth }} />
        <div style={{ minWidth: itemWidth }} />

        {days.map((d, index) => (
          <div
            key={d.dateStr}
            onClick={() => handleSelect(index)}
            className={`flex flex-col items-center justify-center rounded-xl py-3 cursor-pointer transition-all duration-300 ${
              selectedIndex === index
                ? "bg-linear-to-tl from-yellow-500 to-yellow-400 text-white scale-105 drop-shadow-lg"
                : " text-gray-700"
            }`}
            style={{
              minWidth: itemWidth,
              scrollSnapAlign: "center",
              userSelect: "none",
            }}
          >
            <div className="text-sm font-semibold capitalize select-none">
              {d.weekday}
            </div>
            <div className="text-sm select-none">
              {d.day} tháng {d.month}
            </div>
          </div>
        ))}

        <div style={{ minWidth: itemWidth }} />
        <div style={{ minWidth: itemWidth }} />
      </div>

      {/* Nút phải */}
      <button
        onClick={scrollRight}
        className="absolute right-0 z-10 bg-white shadow-md rounded-full p-2 cursor-pointer"
      >
        <IoChevronForward className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

export default DanhSachNgayBay;

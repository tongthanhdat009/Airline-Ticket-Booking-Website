import React, { useState, useEffect, useCallback } from "react";
import { getChiTietGheByGheId, getLuaChonByDichVuId } from "../../services/datVeServices";

function ChoNgoiPanel({
  isOpen,
  onClose,
  width = "600px",
  formData = {},
  dichVu,
  onSave,
}) {
  const [tab, setTab] = useState("di");
  const [serviceState, setServiceState] = useState({ di: {}, ve: {} });
  const [seatRows, setSeatRows] = useState({ di: [], ve: [] });
  const currentService = serviceState[tab]?.[dichVu?.maDichVu] || {};

  const extractAllServiceData = useCallback((state) => {
    const result = {};

    ["di", "ve"].forEach(tabKey => {
      const services = state?.[tabKey] || {};
      const tabResult = {};

      Object.keys(services).forEach(serviceId => {
        const data = services[serviceId] || {};
        const numericId = parseInt(serviceId, 10);

        // GHẾ
        if (numericId === 99 && data.selectedSeats?.length > 0) {
          tabResult.selectedSeats = data.selectedSeats.map(s => ({
            id: s.id,
            hangVe: s.hangVe
          }));
        }

        // KHỞI TẠO MẢNG OPTIONS
        tabResult.options = tabResult.options || [];

        // CHECKBOX
        if (data.checked) {
          const picked = Object.keys(data.checked).filter(k => data.checked[k]);
          if (picked.length > 0) {
            tabResult.options = tabResult.options.concat(
              picked.map(id => {
                const opt = data.options.find(o => o.maLuaChon === parseInt(id));
                return {
                  maLuaChon: parseInt(id),
                  label: opt?.tenLuaChon || "",
                  price: opt?.gia || 0
                };
              })
            );
          }
        }

        // QUANTITY
        if (data.quantities) {
          const picked = Object.keys(data.quantities).filter(k => data.quantities[k] > 0);
          if (picked.length > 0) {
            tabResult.options = tabResult.options.concat(
              picked.map(id => {
                const qty = data.quantities[id];
                const opt = data.options.find(o => o.maLuaChon === parseInt(id));
                return {
                  maLuaChon: parseInt(id),
                  label: opt?.tenLuaChon || "",
                  price: opt?.gia || 0,
                  quantity: qty
                };
              })
            );
          }
        }
      });

      if (Object.keys(tabResult).length > 0) {
        result[tabKey] = tabResult;
      }
    });

    return result;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTab("di"); // reset về tab đi mỗi khi panel mở
    }
  }, [isOpen]);
  // ================= UPDATE SERVICE =================
  const updateService = useCallback((tabKey, serviceId, payload) => {
    setServiceState((prev) => ({
      ...prev,
      [tabKey]: {
        ...(prev[tabKey] || {}),
        [serviceId]: {
          ...(prev[tabKey]?.[serviceId] || {}),
          ...payload,
        },
      },
    }));
  }, []);

  // ================= FETCH SERVICE DATA =================
  const fetchServiceData = useCallback(async () => {
    if (!dichVu) return;

    try {
      // ----------- GHẾ (serviceId === 99) -----------
      if (dichVu?.maDichVu === 99) {
        const maChuyenBay =
          tab === "di"
            ? formData?.selectedTuyenBayDi?.maChuyenBay
            : formData?.selectedTuyenBayVe?.maChuyenBay;

        if (!maChuyenBay) {
          setSeatRows((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        const res = await getChiTietGheByGheId(maChuyenBay);
        const gheList = res?.data || res || [];

        const hangVePriority = {
          "first class": 3,
          business: 2,
          deluxe: 1,
          economy: 0,
        };

        const userHangVe =
          tab === "di"
            ? formData?.selectedTuyenBayDi?.hangVe?.hangVe?.tenHangVe?.toLowerCase()
            : formData?.selectedTuyenBayVe?.hangVe?.hangVe?.tenHangVe?.toLowerCase();

        const userPriority = hangVePriority[userHangVe] ?? 0;

        const seatsMapped = (gheList || []).map((item) => {
          const seatType = item?.hangVe?.tenHangVe?.toLowerCase?.() || "economy";
          const seatPriority = hangVePriority[seatType] ?? 0;

          return {
            id: `${item?.maGhe ?? item?.soGhe ?? ""}`,
            type: seatType,
            hangVe: item?.hangVe?.tenHangVe || "",
            booked: seatPriority > userPriority,
          };
        });

        // chia thành hàng (6 ghế/một hàng)
        const rows = [];
        for (let i = 0; i < seatsMapped.length; i += 6) {
          rows.push({
            row: Math.floor(i / 6) + 1,
            seats: seatsMapped.slice(i, i + 6),
          });
        }

        setSeatRows((prev) => ({ ...prev, [tab]: rows }));
        return;
      }

      // ----------- DỊCH VỤ KHÁC -----------
      const res = await getLuaChonByDichVuId(dichVu?.maDichVu);
      const optionsWithPrice = (res?.data || []).map((item) => ({
        ...item,
        totalPrice: item.gia || 0,
      }));

      updateService(tab, dichVu?.maDichVu, { options: optionsWithPrice });
    } catch (error) {
      console.error("Lỗi khi fetch service data:", error);
    }
  }, [dichVu, tab, formData, updateService]);

  // gọi fetch khi thay đổi tab hoặc dichVu (mở panel đã được điều khiển bên ngoài)
  useEffect(() => {
    // chỉ fetch khi component mở và có dichVu
    if (!dichVu) return;
    fetchServiceData();
  }, [fetchServiceData, dichVu, tab]);

  // ============================ GHẾ ============================
  const selectedSeats = currentService.selectedSeats || [];

  const handleSelect = (seat) => {
    if (!seat || seat.booked) return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    let updated;

    if (isSelected) {
      updated = selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      const maxPassengers = formData?.passengers ?? formData?.passengerInfo?.length ?? 1;
      if (selectedSeats.length >= maxPassengers) return;
      updated = [...selectedSeats, seat];
    }

    updateService(tab, 99, { selectedSeats: updated });
  };

  const getSeatColor = (seat) => {
    if (!seat) return "bg-white";
    if (seat.booked) return "bg-gray-400 cursor-not-allowed text-white";
    if (selectedSeats.some((s) => s.id === seat.id)) return "bg-blue-500 text-white";

    switch ((seat.type || "").toLowerCase()) {
      case "first class":
        return "bg-yellow-300 hover:bg-yellow-400";
      case "business":
        return "bg-orange-300 hover:bg-orange-400";
      case "deluxe":
        return "bg-green-300 hover:bg-green-400";
      default:
        return "bg-white hover:bg-blue-100";
    }
  };

  // ============================ DỊCH VỤ SỐ LƯỢNG ============================
  const updateQuantity = (id, delta) => {
    const qty = (currentService.quantities || {})[id] || 0;
    const price = currentService.options?.find((x) => x.maLuaChon === id)?.gia || 0;
    const newQty = Math.max(0, qty + delta);

    // recalc total price from quantities
    const newQuantities = {
      ...(currentService.quantities || {}),
      [id]: newQty,
    };

    let newTotal = 0;
    if (currentService.options) {
      Object.keys(newQuantities).forEach((k) => {
        const p = currentService.options.find((o) => o.maLuaChon === parseInt(k, 10))?.gia || 0;
        newTotal += (newQuantities[k] || 0) * p;
      });
    } else {
      newTotal = (currentService.totalPrice || 0) + delta * price;
    }

    updateService(tab, dichVu?.maDichVu, {
      quantities: newQuantities,
      totalPrice: newTotal,
      currency: "VND",
    });
  };

  const setQuantity = (id, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);

    const newQuantities = {
      ...(currentService.quantities || {}),
      [id]: num,
    };

    const allZero = Object.values(newQuantities).every(q => q === 0);

    if (allZero) {
      // Không còn lựa chọn -> xóa service khỏi state
      updateService(tab, dichVu?.maDichVu, {});
    } else {
      let newTotal = 0;
      if (currentService.options) {
        Object.keys(newQuantities).forEach((k) => {
          const p = currentService.options.find((o) => o.maLuaChon === parseInt(k, 10))?.gia || 0;
          newTotal += (newQuantities[k] || 0) * p;
        });
      }
      updateService(tab, dichVu?.maDichVu, {
        quantities: newQuantities,
        totalPrice: newTotal,
        currency: "VND",
      });
    }
  };

  // ============================ CHECKBOX ============================
  const toggleCheckbox = (id) => {
    const checkedNow = !(currentService.checked?.[id] || false);
    const newChecked = {
      ...(currentService.checked || {}),
      [id]: checkedNow,
    };

    const totalPrice = Object.entries(newChecked).reduce((sum, [k, v]) => {
      if (v) {
        const price = currentService.options?.find(x => x.maLuaChon === parseInt(k))?.gia || 0;
        return sum + price;
      }
      return sum;
    }, 0);

    updateService(tab, dichVu?.maDichVu, {
      checked: newChecked,
      totalPrice,
      currency: "VND"
    });
  };


  const rowsToRender = seatRows[tab] || [];

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />}

      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300"
        style={{
          width,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex bg-linear-to-b from-[#1E88E5] to-[#1565C0] items-center px-4 py-3 ">
            <h2 className="text-xl text-white font-bold">Chọn dịch vụ</h2>
            <button onClick={onClose} className="text-white text-2xl ml-auto">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white text-black flex">
            <button
              className={`flex-1 px-4 py-2 border-b-2 ${
                tab === "di" ? "border-[#1E88E5]" : "border-transparent text-gray-500"
              }`}
              onClick={() => setTab("di")}
            >
              Chuyến đi
            </button>
            {formData.flightType === "round" && (
              <button
                className={`flex-1 px-4 py-2 border-b-2 ${
                  tab === "ve" ? "border-[#1E88E5]" : "border-transparent text-gray-500"
                }`}
                onClick={() => setTab("ve")}
              >
                Chuyến về
              </button>
            )}
          </div>

          {/* Hành khách */}
          <div className="bg-gray-100">
            <div className="w-full flex flex-col justify-center items-center py-4 px-4">
              <div className="flex flex-col justify-center items-center rounded-t-lg bg-linear-to-b from-[#1E88E5] to-[#1565C0] py-2 px-2 text-white w-4/5 min-h-[60px]">
                <span className="text-sm">Hành Khách</span>
                <div className="flex">
                  {(formData?.passengerInfo || []).map((p, i) => (
                    <span key={i} className="pl-2 font-bold text-md">
                      {p.firstName} {p.lastName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center items-center bg-white rounded-b-lg py-2 px-2 text-black w-4/5">
                <span className="font-bold">
                  {tab === "di"
                    ? `${formData?.departure || ""} - ${formData?.arrival || ""}`
                    : `${formData?.arrival || ""} - ${formData?.departure || ""}`}
                </span>

                {dichVu?.maDichVu === 99 && (
                  <span className="font-bold min-h-[30px] block">
                    {selectedSeats.map((s) => `${s.id}-${s.hangVe}`).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {dichVu?.maDichVu === 99 ? (
              <>
                <div className="text-lg font-semibold mb-4 flex justify-center">Sơ đồ chỗ ngồi</div>
                <div className="grid grid-cols-8 gap-1 justify-items-center">
                  <div></div>
                  <div>A</div>
                  <div>B</div>
                  <div>C</div>
                  <div></div>
                  <div>D</div>
                  <div>E</div>
                  <div>F</div>
                </div>

                {rowsToRender?.map((row) => (
                  <div key={row.row} className="grid grid-cols-8 gap-1 items-center my-1">
                    <div className="font-bold">{row.row}</div>
                    {row.seats.slice(0, 3).map((seat) => (
                      <div
                        key={seat.id}
                        onClick={() => handleSelect(seat)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 ${getSeatColor(
                          seat
                        )}`}
                      >
                        {seat.id}
                      </div>
                    ))}
                    <div></div>
                    {row.seats.slice(3).map((seat) => (
                      <div
                        key={seat.id}
                        onClick={() => handleSelect(seat)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 ${getSeatColor(
                          seat
                        )}`}
                      >
                        {seat.id}
                      </div>
                    ))}
                  </div>
                ))}
                {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm pt-5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-white"></div>
                  <span>Economy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-green-300"></div>
                  <span>Deluxe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-orange-300"></div>
                  <span>Business</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-yellow-300"></div>
                  <span>First Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-blue-500"></div>
                  <span>Đã chọn</span>
                </div>
              </div>
              </>
            ) : (
              (currentService.options || []).map((item) => (
                <div
                  key={item.maLuaChon}
                  className="bg-gray-50 p-4 rounded shadow w-full flex items-center mb-4 hover:shadow-lg transition-shadow"
                >
                  {item.anh && (
                    <img
                      src={`http://localhost:8080/admin/dashboard/dichvu/luachon/anh/${item.anh}`}
                      alt={item.tenLuaChon}
                      className="w-20 h-20 rounded-lg mr-4 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <span className="font-bold text-xl">{item.tenLuaChon}</span>
                    <span className="text-[#FF7043] text-2xl block">
                      {item.gia} {item.currency || "VND"}
                    </span>
                  </div>

                  <div className="ml-auto">
                    {(dichVu?.maDichVu === 2) ? (
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => updateQuantity(item.maLuaChon, -1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="w-16 text-center border rounded"
                          value={currentService.quantities?.[item.maLuaChon] ?? 0}
                          onChange={(e) => setQuantity(item.maLuaChon, e.target.value)}
                        />
                        <button
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => updateQuantity(item.maLuaChon, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={currentService.checked?.[item.maLuaChon] || false}
                        onChange={() => toggleCheckbox(item.maLuaChon)}
                        className="w-6 h-6 accent-green-500"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-linear-to-b from-[#1E88E5] to-[#1565C0] flex justify-between items-center text-white">
            {tab === "di" || formData.flightType === "round" ? (
              <>
                <div>
                  <span className="font-bold">Chuyến {tab === "di" ? "đi" : "về"}: </span>
                  {dichVu?.maDichVu === 99 ? (
                    <>
                      <span className="text-[#E3F2FD]">
                        {selectedSeats.length > 0
                          ? selectedSeats.map((s) => `${s.id}-${s.hangVe}`).join(", ")
                          : "Chưa chọn"}
                      </span>
                      ({selectedSeats.length}/{formData?.passengers ?? formData?.passengerInfo?.length ?? 0})
                    </>
                  ) : (
                    <span className="text-[#E3F2FD]">
                      {currentService.totalPrice || 0} {currentService.currency || "VND"}
                    </span>
                  )}
                </div>

                <button
                  disabled={dichVu?.maDichVu === 99 && selectedSeats.length != (formData?.passengers ?? formData?.passengerInfo?.length ?? 0)}
                  onClick={() => {
                    if (onSave) {
                      const allServices = extractAllServiceData(serviceState);
                      onSave(allServices);
                    }
                    if (formData.flightType === "round" && tab === "di") {
                      setTab("ve");
                    } else {
                      onClose();
                    }
                  }}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    dichVu?.maDichVu === 99 && selectedSeats.length != (formData?.passengers ?? formData?.passengerInfo?.length ?? 0)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Xác nhận
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChoNgoiPanel;

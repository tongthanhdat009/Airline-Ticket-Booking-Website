import React, { useState, useEffect, useCallback } from "react";
import { getSoDoGheByChuyenBay, getLuaChonByDichVuId } from "../../services/datVeServices";
import { getAssetUrl } from "../../config/api.config";

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
            soGhe: s.soGhe,
            hangVe: s.hangVe?.tenHangVe || s.hangVe
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
          setSeatRows((prev) => ({ ...prev, [tab]: { rows: [], columns: [] } }));
          return;
        }

        const res = await getSoDoGheByChuyenBay(maChuyenBay);
        const gheList = res?.data || res || [];

        // Map ghế với đầy đủ thông tin hang/cot và trạng thái daDat
        const seatsMapped = (gheList || []).map((item) => ({
          maGhe: item?.maGhe,
          soGhe: item?.soGhe,
          hang: item?.hang,
          cot: item?.cot,
          hangVe: item?.hangVe,
          viTriGhe: item?.viTriGhe,
          daDat: item?.daDat === true,
          id: String(item?.maGhe ?? ''),
        }));

        // Nhóm theo hàng thực tế (hang/cot)
        const rowMap = {};
        const columnSet = new Set();
        seatsMapped.forEach(seat => {
          if (seat.hang != null) {
            if (!rowMap[seat.hang]) rowMap[seat.hang] = {};
            rowMap[seat.hang][seat.cot] = seat;
            if (seat.cot) columnSet.add(seat.cot);
          }
        });

        const allColumns = Array.from(columnSet).sort();
        const sortedRows = Object.keys(rowMap)
          .map(r => parseInt(r))
          .sort((a, b) => a - b)
          .map(row => ({ row, seatsByCol: rowMap[row] }));

        setSeatRows((prev) => ({ ...prev, [tab]: { rows: sortedRows, columns: allColumns } }));
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

  // Hạng vé hiện tại của hành khách (maHangVe từ chuyến bay đã chọn)
  const userMaHangVe =
    tab === "di"
      ? formData?.selectedTuyenBayDi?.hangVe?.maHangVe
      : (formData?.selectedTuyenBayVe?.hangVe?.maHangVe ?? formData?.selectedTuyenBayDi?.hangVe?.maHangVe);

  const handleSelect = (seat) => {
    if (!seat) return;
    // Không cho chọn ghế đã đặt
    if (seat.daDat) return;
    // Chỉ cho chọn ghế cùng hạng vé với vé đã mua
    if (userMaHangVe && seat.hangVe?.maHangVe !== userMaHangVe) return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    let updated;

    if (isSelected) {
      updated = selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      const maxPassengers = Number(formData?.passengers ?? formData?.passengerInfo?.length ?? 1);
      if (selectedSeats.length >= maxPassengers) return;
      updated = [...selectedSeats, seat];
    }

    updateService(tab, 99, { selectedSeats: updated });
  };

  const getSeatColor = (seat) => {
    if (!seat) return "bg-white border-gray-200 text-gray-400";
    // Ghế đã được đặt bởi người khác
    if (seat.daDat) return "bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed opacity-60";
    // Ghế đã được chọn bởi người dùng hiện tại
    if (selectedSeats.some((s) => s.id === seat.id))
      return "bg-sky-500 border-sky-600 text-white cursor-pointer";
    const maHangVe = seat.hangVe?.maHangVe || 1;
    const isUserClass = !userMaHangVe || maHangVe === userMaHangVe;
    const notAllowed = !isUserClass ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105";
    if (maHangVe === 5) return `bg-amber-50 border-amber-400 text-amber-700 ${notAllowed}`;
    if (maHangVe === 4) return `bg-slate-700 border-slate-800 text-white ${notAllowed}`;
    if (maHangVe === 3) return `bg-emerald-50 border-emerald-400 text-emerald-700 ${notAllowed}`;
    if (maHangVe === 2) return `bg-sky-50 border-sky-300 text-sky-700 ${notAllowed}`;
    return `bg-gray-50 border-gray-200 text-gray-600 ${notAllowed}`;
  };

  // Xác định vị trí lối đi
  const shouldInsertAisle = (colIdx, totalCols) => {
    if (totalCols === 4) return colIdx === 1;
    if (totalCols === 6) return colIdx === 2;
    if (totalCols === 9) return colIdx === 2 || colIdx === 5;
    if (totalCols === 10) return colIdx === 2 || colIdx === 6;
    return false;
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


  const rowsToRender = seatRows[tab] || { rows: [], columns: [] };

  // Lưu state hiện tại vào parent và đóng panel
  const handleSaveAndClose = () => {
    if (onSave) {
      const allServices = extractAllServiceData(serviceState);
      onSave(allServices);
    }
    onClose();
  };

  return (
    <>
      {isOpen && <div onClick={handleSaveAndClose} className="fixed inset-0 bg-black/50 z-60" />}

      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-70 transform transition-transform duration-300"
        style={{
          width,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex bg-linear-to-b from-[#1E88E5] to-[#1565C0] items-center px-4 py-3 ">
            <h2 className="text-xl text-white font-bold">Chọn dịch vụ</h2>
            <button onClick={handleSaveAndClose} className="text-white text-2xl ml-auto">
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
                      {p.fullName}
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
                    {selectedSeats.map((s) => s.soGhe || s.id).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {dichVu?.maDichVu === 99 ? (
              <>
                <div className="text-lg font-semibold mb-3 flex justify-center">Sơ đồ chỗ ngồi</div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border bg-gray-50 border-gray-200"></div><span>Economy</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border bg-sky-50 border-sky-300"></div><span>Economy Saver</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border bg-emerald-50 border-emerald-400"></div><span>Deluxe</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border bg-slate-700 border-slate-800"></div><span>Business</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border bg-amber-50 border-amber-400"></div><span>First Class</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-sky-500"></div><span>Đã chọn</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-gray-300 opacity-60"></div><span>Đã đặt</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-gray-200 opacity-50"></div><span>Khác hạng</span></div>
                </div>

                {rowsToRender.rows?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="border-collapse mx-auto text-xs">
                      <thead>
                        <tr>
                          <th className="px-1 py-1 w-8">
                            <div className="w-8 h-8 flex items-center justify-center bg-slate-600 rounded text-[10px] font-semibold text-white">R</div>
                          </th>
                          {rowsToRender.columns?.map((col, idx) => (
                            <React.Fragment key={col}>
                              {shouldInsertAisle(idx, rowsToRender.columns.length) && (
                                <th className="px-2"></th>
                              )}
                              <th className="px-0.5 py-1">
                                <div className="w-10 h-7 flex items-center justify-center bg-slate-500 rounded text-xs font-semibold text-white">{col}</div>
                              </th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rowsToRender.rows?.map(({ row, seatsByCol }) => (
                          <tr key={row}>
                            <td className="px-1 py-1 text-center">
                              <div className="w-8 h-10 flex items-center justify-center bg-gray-200 rounded text-xs font-semibold text-gray-600">{row}</div>
                            </td>
                            {rowsToRender.columns?.map((col, idx) => {
                              const seat = seatsByCol[col];
                              return (
                                <React.Fragment key={col}>
                                  {shouldInsertAisle(idx, rowsToRender.columns.length) && (
                                    <td className="px-2"></td>
                                  )}
                                  <td className="px-0.5 py-0.5">
                                    {seat ? (
                                      <div
                                        onClick={() => handleSelect(seat)}
                                        title={seat.daDat ? `${seat.soGhe} - Đã đặt` : seat.hangVe?.maHangVe !== userMaHangVe ? `${seat.soGhe} - Không đúng hạng vé` : `${seat.soGhe} - ${seat.hangVe?.tenHangVe || ''}`}
                                        className={`w-10 h-10 flex flex-col items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${getSeatColor(seat)}`}
                                      >
                                        <span className="text-[9px] font-semibold leading-none">{seat.soGhe}</span>
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-200 border border-gray-300 cursor-not-allowed">
                                        <span className="text-gray-400 text-xs">✕</span>
                                      </div>
                                    )}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">Không có ghế khả dụng</div>
                )}
              </>
            ) : (
              (currentService.options || []).map((item) => (
                <div
                  key={item.maLuaChon}
                  className="bg-gray-50 p-4 rounded shadow w-full flex items-center mb-4 hover:shadow-lg transition-shadow"
                >
                  {item.anh && (
                    <img
                      src={getAssetUrl(`/admin/dashboard/dichvu/luachon/anh/${item.anh}`)}
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
                          ? selectedSeats.map((s) => s.soGhe || s.id).join(", ")
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

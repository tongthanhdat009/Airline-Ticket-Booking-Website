import apiClient from "./apiClient";

/**
 * ===============================================
 * PHAN QUYEN SERVICE - Quản lý phân quyền vai trò
 * ===============================================
 */

/**
 * Lấy tất cả chức năng trong hệ thống
 * GET /admin/dashboard/phan-quyen/chuc-nang
 */
export const getAllChucNang = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/phan-quyen/chuc-nang');
        return response.data;
    } catch (error) {
        console.error("Error fetching chuc nang:", error);
        throw error;
    }
};

/**
 * Lấy tất cả chức năng theo nhóm
 * GET /admin/dashboard/phan-quyen/chuc-nang/grouped
 */
export const getAllChucNangGrouped = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/phan-quyen/chuc-nang/grouped');
        return response.data;
    } catch (error) {
        console.error("Error fetching grouped chuc nang:", error);
        throw error;
    }
};

/**
 * Lấy tất cả hành động trong hệ thống
 * GET /admin/dashboard/phan-quyen/hanh-dong
 */
export const getAllHanhDong = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/phan-quyen/hanh-dong');
        return response.data;
    } catch (error) {
        console.error("Error fetching hanh dong:", error);
        throw error;
    }
};

/**
 * Lấy tất cả vai trò kèm thông tin SUPER_ADMIN
 * GET /admin/dashboard/phan-quyen/vai-tro
 */
export const getAllVaiTroWithSuperAdminFlag = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/phan-quyen/vai-tro');
        return response.data;
    } catch (error) {
        console.error("Error fetching vai tro:", error);
        throw error;
    }
};

/**
 * Lấy danh sách phân quyền của một vai trò
 * GET /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}
 */
export const getPhanQuyenByVaiTro = async (maVaiTro) => {
    try {
        const response = await apiClient.get(`/admin/dashboard/phan-quyen/vai-tro/${maVaiTro}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching phan quyen:", error);
        throw error;
    }
};

/**
 * Lấy ma trận phân quyền của một vai trò
 * GET /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/matrix
 * 
 * Trả về map có key là "maChucNang-maHanhDong", value là true/false
 */
export const getPermissionMatrix = async (maVaiTro) => {
    try {
        const response = await apiClient.get(`/admin/dashboard/phan-quyen/vai-tro/${maVaiTro}/matrix`);
        return response.data;
    } catch (error) {
        console.error("Error fetching permission matrix:", error);
        throw error;
    }
};

/**
 * Cập nhật phân quyền cho vai trò
 * PUT /admin/dashboard/phan-quyen/vai-tro
 * 
 * @param {Object} data - Request body
 * @param {number} data.maVaiTro - ID vai trò cần cập nhật
 * @param {Array} data.permissions - Danh sách quyền mới
 * @param {number} data.permissions[].maChucNang - ID chức năng
 * @param {string} data.permissions[].maHanhDong - Mã hành động
 * 
 * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
 */
export const updatePhanQuyen = async (data) => {
    try {
        const response = await apiClient.put('/admin/dashboard/phan-quyen/vai-tro', data);
        return response.data;
    } catch (error) {
        console.error("Error updating phan quyen:", error);
        throw error;
    }
};

/**
 * Thêm một quyền cho vai trò
 * POST /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/permission
 * 
 * @param {number} maVaiTro - ID vai trò
 * @param {number} maChucNang - ID chức năng
 * @param {string} maHanhDong - Mã hành động
 * 
 * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
 */
export const addPermission = async (maVaiTro, maChucNang, maHanhDong) => {
    try {
        const response = await apiClient.post(
            `/admin/dashboard/phan-quyen/vai-tro/${maVaiTro}/permission`,
            null,
            { params: { maChucNang, maHanhDong } }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding permission:", error);
        throw error;
    }
};

/**
 * Xóa một quyền khỏi vai trò
 * DELETE /admin/dashboard/phan-quyen/vai-tro/{maVaiTro}/permission
 * 
 * @param {number} maVaiTro - ID vai trò
 * @param {number} maChucNang - ID chức năng
 * @param {string} maHanhDong - Mã hành động
 * 
 * LƯU Ý: Không cho phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN
 */
export const removePermission = async (maVaiTro, maChucNang, maHanhDong) => {
    try {
        const response = await apiClient.delete(
            `/admin/dashboard/phan-quyen/vai-tro/${maVaiTro}/permission`,
            { params: { maChucNang, maHanhDong } }
        );
        return response.data;
    } catch (error) {
        console.error("Error removing permission:", error);
        throw error;
    }
};

/**
 * Sao chép phân quyền từ vai trò này sang vai trò khác
 * POST /admin/dashboard/phan-quyen/copy
 * 
 * @param {number} fromVaiTro - ID vai trò nguồn
 * @param {number} toVaiTro - ID vai trò đích
 * 
 * LƯU Ý: Không cho phép sao chép sang vai trò SUPER_ADMIN
 */
export const copyPermissions = async (fromVaiTro, toVaiTro) => {
    try {
        const response = await apiClient.post(
            '/admin/dashboard/phan-quyen/copy',
            null,
            { params: { fromVaiTro, toVaiTro } }
        );
        return response.data;
    } catch (error) {
        console.error("Error copying permissions:", error);
        throw error;
    }
};

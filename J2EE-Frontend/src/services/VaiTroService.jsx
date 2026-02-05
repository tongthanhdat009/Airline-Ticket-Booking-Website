import apiClient from "./apiClient";

/**
 * Lấy tất cả vai trò
 * GET /admin/dashboard/vai-tro
 */
export const getAllVaiTro = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/vai-tro');
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

/**
 * Lấy vai trò theo ID
 * GET /admin/dashboard/vai-tro/{id}
 */
export const getVaiTroById = async (id) => {
    try {
        const response = await apiClient.get(`/admin/dashboard/vai-tro/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching role:", error);
        throw error;
    }
};

/**
 * Tạo vai trò mới
 * POST /admin/dashboard/vai-tro
 * Validation: Tên vai trò không được để trống, trạng thái mặc định là Active
 */
export const createVaiTro = async (vaiTroData) => {
    try {
        const response = await apiClient.post('/admin/dashboard/vai-tro', vaiTroData);
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
};

/**
 * Cập nhật vai trò
 * PUT /admin/dashboard/vai-tro/update/{id}
 * Validation: Tên vai trò không được để trống
 */
export const updateVaiTro = async (id, vaiTroData) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/vai-tro/update/${id}`, vaiTroData);
        return response.data;
    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
};

/**
 * Xóa vai trò (soft delete)
 * DELETE /admin/dashboard/vai-tro/{id}
 * Validation: Không được xóa khi có tài khoản đang sử dụng
 */
export const deleteVaiTro = async (id) => {
    try {
        const response = await apiClient.delete(`/admin/dashboard/vai-tro/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting role:", error);
        throw error;
    }
};

/**
 * Lấy danh sách vai trò theo trạng thái
 * GET /admin/dashboard/vai-tro/trang-thai?trangThai=true
 */
export const getVaiTroByTrangThai = async (trangThai) => {
    try {
        const response = await apiClient.get('/admin/dashboard/vai-tro/trang-thai', {
            params: { trangThai }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching roles by status:", error);
        throw error;
    }
};

/**
 * Tìm kiếm vai trò
 * GET /admin/dashboard/vai-tro/search?keyword=admin
 */
export const searchVaiTro = async (keyword) => {
    try {
        const response = await apiClient.get('/admin/dashboard/vai-tro/search', {
            params: { keyword }
        });
        return response.data;
    } catch (error) {
        console.error("Error searching roles:", error);
        throw error;
    }
};

/**
 * Đếm số admin đang sử dụng vai trò
 * GET /admin/dashboard/vai-tro/{id}/count-admin
 */
export const countAdminByVaiTro = async (id) => {
    try {
        const response = await apiClient.get(`/admin/dashboard/vai-tro/${id}/count-admin`);
        return response.data;
    } catch (error) {
        console.error("Error counting admin by role:", error);
        throw error;
    }
};

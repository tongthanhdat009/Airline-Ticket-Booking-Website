package com.example.j2ee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // Constructor cho response thành công với data
    public ApiResponse(boolean success, T data) {
        this.success = success;
        this.data = data;
    }

    // Constructor cho response chỉ có message
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Static methods để tạo response nhanh
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> successMessage(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}

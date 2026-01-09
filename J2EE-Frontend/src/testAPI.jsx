import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Tên component trong React phải bắt đầu bằng chữ hoa
function TestAPI() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Gọi API khi component được render lần đầu
        axios.get('http://localhost:8080/api/v1/hanhkhach')
            .then(response => {
                console.log('Dữ liệu nhận được:', response.data);
                setData(response.data); // Lưu dữ liệu vào state
                setLoading(false);
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setError(error); // Lưu lỗi vào state
                setLoading(false);
            });
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div>Lỗi khi tải dữ liệu: {error.message}</div>;
    }

    return (
        <div>
            <h1>Test API</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default TestAPI;
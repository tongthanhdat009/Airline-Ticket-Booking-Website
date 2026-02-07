import React, { useState, useEffect } from 'react';
import ThongTinKhachHang from './ThongTinKhachHang';
import ThongTinTaiKhoan from './ThongTinTaiKhoan';
import ThongTinChuyenBay from './ThongTinChuyenBay';

const ViewKhachHangModal = ({
    isOpen,
    onClose,
    customer,
    onCustomerUpdate,
    defaultTab = 'thong-tin',
    initialEditMode = false
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [localCustomer, setLocalCustomer] = useState(customer);

    useEffect(() => {
        setLocalCustomer(customer);
    }, [customer]);

    useEffect(() => {
        // Reset to default tab when modal opens
        if (isOpen) {
            setActiveTab(defaultTab);
        }
    }, [isOpen, defaultTab]);

    const handleCustomerUpdate = () => {
        // Fetch updated customer data if onCustomerUpdate callback is provided
        if (onCustomerUpdate) {
            onCustomerUpdate();
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    if (!isOpen || !localCustomer) return null;

    const tabs = [
        {
            id: 'thong-tin',
            label: 'Thông tin KH',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'tai-khoan',
            label: 'Tài khoản',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            id: 'chuyen-bay',
            label: 'Chuyến bay',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'thong-tin':
                return <ThongTinKhachHang customer={localCustomer} onUpdate={handleCustomerUpdate} initialEditMode={initialEditMode} />;
            case 'tai-khoan':
                return <ThongTinTaiKhoan customer={localCustomer} />;
            case 'chuyen-bay':
                return <ThongTinChuyenBay customer={localCustomer} />;
            default:
                return <ThongTinKhachHang customer={localCustomer} onUpdate={handleCustomerUpdate} initialEditMode={initialEditMode} />;
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold">Thông tin chi tiết khách hàng</h3>
                        <p className="text-sm text-blue-100 mt-1">#{localCustomer.maHanhKhach} - {localCustomer.hoVaTen}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-50 border-r border-gray-200 shrink-0">
                        <nav className="p-4 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-white">
                        {renderContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewKhachHangModal;

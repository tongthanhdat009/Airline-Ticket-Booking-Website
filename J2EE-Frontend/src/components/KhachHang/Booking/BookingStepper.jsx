import { useTranslation } from 'react-i18next';
import { IoCheckmarkCircle } from 'react-icons/io5';

const steps = [
    { key: 'flight', icon: '✈️' },
    { key: 'info', icon: '👤' },
    { key: 'services', icon: '🧳' },
    { key: 'payment', icon: '💳' },
];

/**
 * BookingStepper - Progress indicator cho quy trình đặt vé
 * @param {number} currentStep - Bước hiện tại (0-3)
 * @param {function} onStepClick - Callback khi click vào bước (chỉ cho phép quay lại)
 */
function BookingStepper({ currentStep = 0, onStepClick }) {
    const { t } = useTranslation();

    const stepLabels = [
        t('booking.stepper.flight', 'Chọn chuyến bay'),
        t('booking.stepper.info', 'Thông tin'),
        t('booking.stepper.services', 'Dịch vụ'),
        t('booking.stepper.payment', 'Thanh toán'),
    ];

    return (
        <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32 py-2">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-3 md:p-4">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.key} className="flex items-center flex-1">
                            {/* Step circle */}
                            <div
                                className={`flex flex-col items-center cursor-pointer group transition-all duration-300 ${
                                    index <= currentStep ? 'opacity-100' : 'opacity-50'
                                }`}
                                onClick={() => {
                                    if (index < currentStep && onStepClick) {
                                        onStepClick(index);
                                    }
                                }}
                            >
                                <div
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 ${
                                        index < currentStep
                                            ? 'bg-green-500 text-white shadow-md shadow-green-200'
                                            : index === currentStep
                                            ? 'bg-[#1E88E5] text-white shadow-md shadow-blue-200 ring-3 ring-blue-100'
                                            : 'bg-gray-200 text-gray-400'
                                    } ${index < currentStep ? 'group-hover:scale-110' : ''}`}
                                >
                                    {index < currentStep ? (
                                        <IoCheckmarkCircle className="text-lg" />
                                    ) : (
                                        <span className="text-sm">{step.icon}</span>
                                    )}
                                </div>
                                <span
                                    className={`mt-1 text-[10px] md:text-xs font-medium text-center transition-colors duration-300 ${
                                        index < currentStep
                                            ? 'text-green-600'
                                            : index === currentStep
                                            ? 'text-[#1E88E5] font-bold'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    {stepLabels[index]}
                                </span>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-2 md:mx-3">
                                    <div
                                        className={`h-0.5 rounded-full transition-all duration-500 ${
                                            index < currentStep
                                                ? 'bg-green-400'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BookingStepper;

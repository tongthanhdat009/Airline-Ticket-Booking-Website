import { HiUser, HiShoppingCart, HiCreditCard } from 'react-icons/hi2';
import { MdFlight} from 'react-icons/md';
import { useTranslation } from 'react-i18next';

function HeaderTimKiemChuyen({ data}) {
  const { t } = useTranslation();
  const flightTypeText = data.flightType === "round" ? t('booking.flight_type.round') : t('booking.flight_type.one_way');
  return (
    <div className="w-full min-h-16 from-[#1E88E5] to-[#64B5F6] bg-linear-to-r flex items-center justify-between px-32 py-4">
        <div className='text-white'>
            <p className="mb-1">
                {t('booking.header.flight_prefix')} {flightTypeText} | {data.passengers} {t('booking.header.passenger_label')}
            </p>
            <div className='flex gap-6'>
                <div className='text-white'>{t('booking.header.departure_label')}: <span className='text-yellow-200 font-medium'>{data.departure} ({data.sanBayDi?.maIATA || data.selectedTuyenBayDi?.tuyenBay.sanBayDi?.maIATA})</span></div>
                <div className='text-white'>{t('booking.header.destination_label')}: <span className='text-yellow-200 font-medium'>{data.arrival} ({data.sanBayDen?.maIATA || data.selectedTuyenBayDi?.tuyenBay.sanBayDen?.maIATA})</span></div>
            </div>
        </div>
        <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-linear-to-r from-green-500 to-green-400`}>
                <MdFlight className="text-white text-2xl"/>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${data.state > 0 ? "bg-linear-to-r from-green-500 to-green-400" : "bg-white"}`}>
                <HiUser className="text-[#1E88E5] text-2xl"/>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${data.state > 1 ? "bg-linear-to-r from-green-500 to-green-400" : "bg-white"}`}>
                <HiShoppingCart className="text-[#1E88E5] text-2xl"/>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${data.state > 2 ? "bg-linear-to-r from-green-500 to-green-400" : "bg-white"}`}>
                <HiCreditCard className="text-[#1E88E5] text-2xl"/>
            </div>
        </div>
    </div>
  )
}
export default HeaderTimKiemChuyen
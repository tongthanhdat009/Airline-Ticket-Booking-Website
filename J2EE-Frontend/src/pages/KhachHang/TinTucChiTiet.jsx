import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaEye, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Footer from "../../components/common/Footer";
import useTitle from '../../hooks/useTitle';
import TinTucService from '../../services/TinTucService';

function TinTucChiTiet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let found = null;
        const passed = location.state && location.state.tinTucList;
        if (Array.isArray(passed)) {
          found = passed.find(b => String(b.id) === String(id));
        }
        if (!found) {
          const data = await TinTucService.getPublished();
          const list = Array.isArray(data) ? data : [];
          found = list.find(b => String(b.id) === String(id));
          if (found) {
            setRelated(list.filter(b => String(b.id) !== String(id) && b.danhMuc === found.danhMuc).slice(0, 3));
          }
        } else {
          setRelated(passed.filter(b => String(b.id) !== String(id) && b.danhMuc === found.danhMuc).slice(0, 3));
        }
        setItem(found || null);
        if (found) {
          TinTucService.incrementView(found.id).catch(() => {});
        }
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useTitle(item ? item.tieuDe + ' - JadT Airline' : t('home_page.news_detail_browser_title'));

  const paragraphs = item && item.noiDung
    ? item.noiDung.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/tin-tuc')}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft /> {t('home_page.news_back')}
        </button>

        {loading ? (
          <div className="text-center py-16 text-gray-500">{t('home_page.news_loading')}</div>
        ) : !item ? (
          <div className="text-center py-16 text-gray-500">{t('home_page.news_not_found')}</div>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">{item.danhMuc}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><FaUser />{item.tacGia || 'Admin'}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt />{item.ngayDang || '-'}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><FaEye />{(item.luotXem || 0).toLocaleString()} {t('home_page.news_views')}</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-800 mb-4">{item.tieuDe}</h1>
              <p className="text-base lg:text-lg text-slate-500 font-medium mb-6">{item.tomTat}</p>
              {item.hinhAnh && (
                <img src={item.hinhAnh} alt={item.tieuDe} className="w-full rounded-xl mb-6 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="space-y-4 text-slate-700 leading-relaxed">
                {paragraphs.length > 0 ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : null}
              </div>
            </div>

            {related.length > 0 && (
              <div className="border-t border-slate-100 p-6 lg:p-10 pt-6">
                <h2 className="font-bold text-slate-800 text-lg mb-4">{t('home_page.news_related')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map(r => (
                    <article
                      key={r.id}
                      onClick={() => navigate('/tin-tuc/' + r.id, { state: { tinTucList: undefined } })}
                      className="border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {r.hinhAnh && (
                        <img src={r.hinhAnh} alt={r.tieuDe} className="w-full h-32 object-cover" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      <div className="p-3">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{r.tieuDe}</p>
                        <p className="text-xs text-gray-500 mt-1">{r.ngayDang || '-'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default TinTucChiTiet;

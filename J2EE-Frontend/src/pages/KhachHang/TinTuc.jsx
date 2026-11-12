import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaEye, FaCalendarAlt } from 'react-icons/fa';
import Footer from "../../components/common/Footer";
import useTitle from '../../hooks/useTitle';
import TinTucService from '../../services/TinTucService';

function TinTuc() {
  const { t } = useTranslation();
  useTitle(t('home_page.news_page_browser_title'));
  const navigate = useNavigate();
  const [tinTuc, setTinTuc] = useState([]);
  const [search, setSearch] = useState('');
  const [danhMuc, setDanhMuc] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await TinTucService.getPublished();
        setTinTuc(Array.isArray(data) ? data : []);
      } catch {
        setTinTuc([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const danhMucs = useMemo(() => {
    const set = new Set(tinTuc.map(b => b.danhMuc).filter(Boolean));
    return ['all', ...set];
  }, [tinTuc]);

  const filtered = tinTuc.filter(b => {
    const matchSearch = !search || b.tieuDe.toLowerCase().includes(search.toLowerCase());
    const matchDanhMuc = danhMuc === 'all' || b.danhMuc === danhMuc;
    return matchSearch && matchDanhMuc;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900">{t('home_page.news_page_title')}</h1>
          <p className="text-slate-600 mt-2">{t('home_page.news_page_desc')}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <section aria-label={t('home_page.news_page_title')}>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('home_page.news_search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {danhMucs.map(dm => (
              <button
                key={dm}
                onClick={() => setDanhMuc(dm)}
                className={danhMuc === dm ? 'px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-blue-500 text-white' : 'px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-800 hover:bg-gray-100'}
              >
                {dm === 'all' ? t('home_page.news_filter_all') : dm}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-500">{t('home_page.news_loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">{t('home_page.news_empty')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <article
                key={item.id}
                onClick={() => navigate('/tin-tuc/' + item.id, { state: { tinTucList: filtered } })}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-slate-100"
              >
                {item.hinhAnh && (
                  <img src={item.hinhAnh} alt={item.tieuDe} className="w-full h-44 object-cover" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-medium">{item.danhMuc}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><FaCalendarAlt />{item.ngayDang || '-'}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto"><FaEye />{(item.luotXem || 0).toLocaleString()}</span>
                  </div>
                  <h2 className="font-bold text-slate-800 line-clamp-2 mb-2 text-base">{item.tieuDe}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2">{item.tomTat}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default TinTuc;

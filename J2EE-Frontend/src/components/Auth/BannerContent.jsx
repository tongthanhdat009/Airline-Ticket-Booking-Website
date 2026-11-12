import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

/**
 * Banner content cho trang đăng nhập
 */
export const LoginBannerContent = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
        ✈️ JadT Airline 2026
      </div>
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight whitespace-nowrap">
        {t('auth.banner_login_title')}
      </h2>
      <p className="text-lg text-blue-100 mb-8 leading-relaxed">
        {t('auth.banner_login_desc')}
      </p>

      <div className="space-y-4">
        {[
          { icon: "🎁", title: t('auth.banner_b1_title'), desc: t('auth.banner_b1_desc') },
          { icon: "⭐", title: t('auth.banner_b2_title'), desc: t('auth.banner_b2_desc') },
          { icon: "💬", title: t('auth.banner_b3_title'), desc: t('auth.banner_b3_desc') }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 5 }}
            className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-blue-100">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

/**
 * Banner content cho trang đăng ký với progress steps
 */
export const RegisterBannerContent = ({ currentStep = 1, showVerificationPrompt = false }) => {
  const { t } = useTranslation();
  const STEPS = [
    { id: 1, title: t('auth.banner_step1'), icon: '👤' },
    { id: 2, title: t('auth.banner_step2'), icon: '📞' },
    { id: 3, title: t('auth.banner_step3'), icon: '🔒' }
  ];

  const stepStatus = (step) =>
    currentStep > step.id ? t('auth.banner_done') : currentStep === step.id ? t('auth.banner_active') : t('auth.banner_wait');

  return (
    <>
      <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
        ✈️ JadT Airline 2026
      </div>
      <h2 className="text-3xl font-extrabold mb-4 leading-tight">
        {t('auth.banner_reg_title')}
      </h2>
      <p className="text-base text-blue-100 mb-6">
        {t('auth.banner_reg_desc')}
      </p>

      {/* Progress Steps */}
      {!showVerificationPrompt && (
        <div className="space-y-3">
          {STEPS.map((step) => (
            <motion.div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentStep === step.id
                  ? 'bg-white/20 scale-105'
                  : currentStep > step.id
                  ? 'bg-white/10 opacity-70'
                  : 'bg-white/5 opacity-40'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                currentStep === step.id
                  ? 'bg-white text-blue-600'
                  : currentStep > step.id
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/60'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div>
                <p className="font-semibold text-sm">{step.title}</p>
                <p className="text-xs text-blue-100 opacity-80">
                  {stepStatus(step)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Benefits */}
      {showVerificationPrompt && (
        <div className="space-y-3 mt-4">
          {[
            { icon: "🔒", title: t('auth.banner_v1') },
            { icon: "📩", title: t('auth.banner_v2') },
            { icon: "🎁", title: t('auth.banner_v3') }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

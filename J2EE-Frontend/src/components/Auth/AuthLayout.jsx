import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

/**
 * Layout chung cho trang đăng nhập/đăng ký
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung chính (form)
 * @param {React.ReactNode} props.bannerContent - Nội dung banner bên trái
 * @param {string} props.className - Class thêm vào cho container
 * @param {boolean}.props.showProgress - Có hiển thị progress step không (đăng ký)
 * @param {number} props.currentStep - Bước hiện tại (1-3)
 * @param {Array} props.steps - Danh sách các bước đăng ký
 */
const AuthLayout = ({
  children,
  bannerContent,
  className = "",
  showProgress = false,
  currentStep = 1,
  steps = []
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className={`max-w-5xl mx-auto relative z-10 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Banner */}
          <motion.div variants={itemVariants} className="order-2 md:order-1">
            <div className="bg-linear-to-br from-blue-600 to-cyan-600 rounded-3xl p-10 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                {bannerContent}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div variants={itemVariants} className="order-1 md:order-2">
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;

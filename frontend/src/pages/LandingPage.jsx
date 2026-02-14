import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, UserPlus, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      
      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -150, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 12 }}
          transition={{ duration: 2.4, delay: 0.3 }}
          className="absolute left-[-10%] top-[15%] w-[600px] h-[140px]"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500/[0.15] to-transparent backdrop-blur-[2px] border-2 border-white/[0.15]"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -150, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -15 }}
          transition={{ duration: 2.4, delay: 0.5 }}
          className="absolute right-[-5%] top-[70%] w-[500px] h-[120px]"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-full h-full rounded-full bg-gradient-to-r from-rose-500/[0.15] to-transparent backdrop-blur-[2px] border-2 border-white/[0.15]"
          />
        </motion.div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
        >
          <Circle className="h-2 w-2 fill-rose-500/80" />
          <span className="text-sm text-white/60 tracking-wide">
            TalentFit AI - Powered by SBERT
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-center mb-12 max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Find the Perfect
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-rose-300">
              Candidate Match
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-2 max-w-2xl mx-auto">
            TalentFit AI: Discover the Top 1% of Talent
          </p>
          <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto">
            AI-powered semantic matching • 35+ skills tracked • Instant results
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login', { state: { isSignUp: false } })}
            className="
              group flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600
              hover:from-indigo-500 hover:via-purple-500 hover:to-rose-500
              text-white shadow-2xl hover:shadow-indigo-500/50
              transition-all duration-300 ease-out
              border border-white/20
              min-w-[200px]
            "
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Login
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Sign Up Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login', { state: { isSignUp: true } })}
            className="
              group flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg
              bg-white/5 backdrop-blur-sm
              hover:bg-white/10
              text-white shadow-xl hover:shadow-white/20
              transition-all duration-300 ease-out
              border border-white/10
              min-w-[200px]
            "
          >
            <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Sign Up
          </motion.button>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="flex flex-wrap justify-center gap-8 text-white/40 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400/50"></div>
            <span>SBERT Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400/50"></div>
            <span>Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400/50"></div>
            <span>Semantic Matching</span>
          </div>
        </motion.div>
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
}

export default LandingPage;

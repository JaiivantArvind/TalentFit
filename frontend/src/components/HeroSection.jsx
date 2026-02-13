import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, XCircle, FileText, Search } from 'lucide-react'; // Added Search icon

const HeroSection = ({ onFileUpload, processing, jobDescription, onJobDescriptionChange, onSubmitAnalysis, file }) => {
  const [dragActive, setDragActive] = useState(false);
  // Removed local 'file' state as it's now passed via props
  const [error, setError] = useState(null); // Local error for file type validation

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      validateAndSetFile(uploadedFile);
    }
  }, [onFileUpload]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      validateAndSetFile(uploadedFile);
    }
  }, [onFileUpload]);

  const validateAndSetFile = (uploadedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
    ];
    if (!allowedTypes.includes(uploadedFile.type)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      // Do not call onFileUpload if validation fails, ensure file state in App.jsx remains null or previous
      onFileUpload(null);
      return;
    }
    setError(null);
    onFileUpload(uploadedFile); // Pass the file to the parent component
  };

  const fileInputRef = useRef(null); // Changed to useRef

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const isFormValid = file && jobDescription.trim() !== '';

  return (
    <section className="relative min-h-screen bg-[#030303] text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Gradient Effect - Matching HeroGeometric */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
            TalentFit AI
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-white/60 mb-8"
        >
          Uncover the perfect match. Effortlessly analyze resumes against job descriptions.
        </motion.p>

        {/* Resume Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 100 }}
          className={`
            relative flex flex-col items-center justify-center p-8 border-2 border-dashed
            rounded-3xl backdrop-blur-xl bg-white/[0.03] bg-opacity-40 mb-8
            transition-all duration-300 ease-in-out
            ${dragActive ? 'border-indigo-400/50 scale-105' : 'border-white/[0.08]'}
            ${error ? 'border-rose-500/50' : ''}
            hover:border-indigo-400/50 hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.15)]
            group
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.docx,.txt"
          />
          {processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-indigo-400"
            >
              <FileText className="w-16 h-16 mb-4 animate-pulse" />
              <p className="text-xl font-semibold">Processing Resume...</p>
              <p className="text-sm text-slate-400 mt-2">This might take a moment.</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`
                  mb-4 p-3 rounded-full
                  ${file ? 'bg-emerald-500/80 shadow-[0_8px_32px_0_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-indigo-500 to-rose-500 group-hover:from-indigo-400 group-hover:to-rose-400'}
                  transition-all duration-300 ease-in-out
                  group-hover:scale-110
                `}
              >
                {file ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-white" />
                )}
              </motion.div>
              {file ? (
                <div className="text-lg font-medium text-slate-200 flex items-center mb-2">
                  <FileText className="w-5 h-5 mr-2 text-indigo-300" />
                  {file.name}
                </div>
              ) : (
                <p className="text-lg font-medium text-white/80 mb-2">
                  Drag & Drop your Resume (PDF, DOCX, TXT)
                </p>
              )}
              <p className="text-white/40 mb-4">or</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleButtonClick}
                className="
                  px-6 py-3 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-rose-600
                  hover:from-indigo-500 hover:to-rose-500
                  transition-all duration-300 ease-in-out
                  shadow-[0_8px_32px_0_rgba(99,102,241,0.2)] hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.4)]
                  border border-white/10
                "
              >
                Browse Files
              </motion.button>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-rose-500 flex items-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {error}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Job Description Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 w-full"
        >
          <label htmlFor="job-description" className="block text-white/70 text-lg font-semibold mb-2 text-left">
            Paste Job Description
          </label>
          <textarea
            id="job-description"
            rows="8"
            value={jobDescription}
            onChange={onJobDescriptionChange}
            className="
              w-full p-4 rounded-xl backdrop-blur-xl bg-white/[0.03]
              border border-white/[0.08] text-white/90 placeholder-white/30
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
              transition-all duration-300 ease-in-out resize-none
            "
            placeholder="e.g., 'We are looking for a Senior Software Engineer with expertise in React, Node.js, and AWS...'"
          ></textarea>
        </motion.div>

        {/* Analyze Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSubmitAnalysis}
          disabled={!isFormValid || processing}
          className={`
            mt-8 px-8 py-4 rounded-xl font-extrabold text-white text-xl
            bg-gradient-to-r from-emerald-500 to-cyan-500
            hover:from-emerald-400 hover:to-cyan-400
            transition-all duration-300 ease-in-out
            shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.5)]
            border border-white/20
            flex items-center justify-center gap-2
            ${!isFormValid || processing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {processing ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Search className="w-6 h-6" />
              </motion.span>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-6 h-6" />
              Analyze Resumes
            </>
          )}
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
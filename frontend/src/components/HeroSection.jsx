import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, XCircle, FileText, Search, Type, Upload } from 'lucide-react';

const HeroSection = ({ onFileUpload, processing, jobDescription, onJobDescriptionChange, onSubmitAnalysis, file, jdFile, onJdFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [jdDragActive, setJdDragActive] = useState(false);
  const [jdTab, setJdTab] = useState('text'); // 'text' or 'file'
  const [error, setError] = useState(null);
  const [jdError, setJdError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleJdDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setJdDragActive(true);
    } else if (e.type === 'dragleave') {
      setJdDragActive(false);
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

  const handleJdDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setJdDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      validateAndSetJdFile(uploadedFile);
    }
  }, [onJdFileUpload]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      validateAndSetFile(uploadedFile);
    }
  }, [onFileUpload]);

  const handleJdChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      validateAndSetJdFile(uploadedFile);
    }
  }, [onJdFileUpload]);

  const validateAndSetFile = (uploadedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(uploadedFile.type)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      onFileUpload(null);
      return;
    }
    setError(null);
    onFileUpload(uploadedFile);
  };

  const validateAndSetJdFile = (uploadedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(uploadedFile.type)) {
      setJdError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      onJdFileUpload(null);
      return;
    }
    setJdError(null);
    onJdFileUpload(uploadedFile);
  };

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleJdButtonClick = () => {
    jdFileInputRef.current.click();
  };

  const isFormValid = file && (jobDescription.trim() !== '' || jdFile);

  return (
    <section className="relative min-h-screen bg-[#030303] text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Gradient Effect */}
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
            ${dragActive ? 'border-indigo-400/50 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-white/[0.08]'}
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

        {/* Job Description Section with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 w-full"
        >
          <label className="block text-white/70 text-lg font-semibold mb-3 text-left">
            Job Description
          </label>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setJdTab('text')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${jdTab === 'text' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                }
              `}
            >
              <Type className="w-4 h-4" />
              Paste Text
            </button>
            <button
              onClick={() => setJdTab('file')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${jdTab === 'file' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                }
              `}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {jdTab === 'text' ? (
              <motion.div
                key="text-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <textarea
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
            ) : (
              <motion.div
                key="file-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`
                  relative flex flex-col items-center justify-center p-8 border-2 border-dashed
                  rounded-xl backdrop-blur-xl bg-white/[0.03]
                  transition-all duration-300 ease-in-out
                  ${jdDragActive ? 'border-purple-400/50 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-white/[0.08]'}
                  ${jdError ? 'border-rose-500/50' : ''}
                  hover:border-purple-400/50 hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.15)]
                  group cursor-pointer
                `}
                onDragEnter={handleJdDrag}
                onDragLeave={handleJdDrag}
                onDragOver={handleJdDrag}
                onDrop={handleJdDrop}
                onClick={handleJdButtonClick}
              >
                <input
                  ref={jdFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleJdChange}
                  accept=".pdf,.docx,.txt"
                />
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`
                    mb-3 p-2 rounded-full
                    ${jdFile ? 'bg-purple-500/80 shadow-[0_8px_32px_0_rgba(168,85,247,0.3)]' : 'bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-purple-400 group-hover:to-pink-400'}
                    transition-all duration-300 ease-in-out
                    group-hover:scale-110
                  `}
                >
                  {jdFile ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Upload className="w-6 h-6 text-white" />
                  )}
                </motion.div>
                {jdFile ? (
                  <div className="text-sm font-medium text-slate-200 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-300" />
                    {jdFile.name}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white/80 mb-1">
                      Drop JD file here or click to browse
                    </p>
                    <p className="text-xs text-white/40">PDF, DOCX, or TXT</p>
                  </>
                )}
                {jdError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-rose-400 flex items-center text-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {jdError}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
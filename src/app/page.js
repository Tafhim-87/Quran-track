"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MoonIcon, UserIcon, BookOpenIcon, CheckCircleIcon, ExclamationCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [name, setName] = useState("");
  const [para, setPara] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userStats, setUserStats] = useState({
    totalRead: 0,
    remainingParas: 30,
    lastRead: null,
    readingHistory: []
  });
  const [stats, setStats] = useState({
    ramadanDay: '-',
    totalParas: '30',
    activeReaders: '0',
    todayReading: '0'
  });
  
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const nameInputRef = useRef(null);
  const selectInputRef = useRef(null);
  const buttonRef = useRef(null);

  // Generate para options efficiently
  const paraOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5);

  // Load user data from localStorage on mount
  useEffect(() => {
    loadUserData();
    fetchStats();
  }, []);

  // Save to localStorage whenever userStats changes
  useEffect(() => {
    if (userStats.totalRead > 0 || userStats.readingHistory.length > 0) {
      localStorage.setItem('ramadanUserStats', JSON.stringify(userStats));
    }
  }, [userStats]);

  const loadUserData = () => {
    try {
      const savedData = localStorage.getItem('ramadanUserStats');
      if (savedData) {
        setUserStats(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('ramadanUserStats');
    setUserStats({
      totalRead: 0,
      remainingParas: 30,
      lastRead: null,
      readingHistory: []
    });
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/participants");
      const result = await res.json();
      
      if (result.success) {
        setStats({
          ramadanDay: result.data[0]?.ramadanDay || '-',
          totalParas: '30',
          activeReaders: result.summary?.uniqueParticipants || '0',
          todayReading: result.summary?.totalParaRead?.toFixed(1) || '0'
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    // Initial animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(formRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "backOut(1.2)" },
      "-=0.5"
    )
    .fromTo([nameInputRef.current, selectInputRef.current],
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(buttonRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "bounce.out" },
      "-=0.2"
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Button animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), para: Number(para) }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update user stats in localStorage
        const newTotal = userStats.totalRead + Number(para);
        const newHistory = [
          ...userStats.readingHistory,
          {
            date: new Date().toISOString(),
            paras: Number(para),
            name: name.trim()
          }
        ];

        setUserStats({
          totalRead: newTotal,
          remainingParas: Math.max(0, 30 - newTotal),
          lastRead: new Date().toISOString(),
          readingHistory: newHistory
        });

        setShowSuccess(true);
        
        // Success animation
        gsap.to(formRef.current, {
          backgroundColor: "#f0fdf4",
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);

        setName("");
        setPara("");
        
        // Refresh stats
        fetchStats();
      } else {
        // Error animation
        gsap.to(formRef.current, {
          x: -10,
          duration: 0.1,
          repeat: 3,
          yoyo: true
        });
        
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputFocus = (ref) => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 1.02,
        borderColor: "#059669",
        boxShadow: "0 0 0 4px rgba(5, 150, 105, 0.1)",
        duration: 0.3
      });
    }
  };

  const handleInputBlur = (ref) => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 1,
        borderColor: "#d1d5db",
        boxShadow: "none",
        duration: 0.3
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4 shadow-lg">
            <MoonIcon className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            Ramadan Quran Reading Tracker
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Track your daily Quran reading progress throughout the blessed month
          </p>
        </div>

        {/* User Progress Section */}
        {userStats.totalRead > 0 && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Your Personal Progress</h3>
                  <p className="text-emerald-100 text-sm">Last read: {formatDate(userStats.lastRead)}</p>
                </div>
              </div>
              <button
                onClick={clearUserData}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                Reset Progress
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-100 text-xs">Total Read</p>
                <p className="text-2xl font-bold">{userStats.totalRead.toFixed(1)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-100 text-xs">Remaining</p>
                <p className="text-2xl font-bold">{userStats.remainingParas.toFixed(1)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-100 text-xs">Progress</p>
                <p className="text-2xl font-bold">
                  {((userStats.totalRead / 30) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-emerald-100 text-xs">Entries</p>
                <p className="text-2xl font-bold">{userStats.readingHistory.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userStats.totalRead / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="relative">
          <div 
            ref={formRef}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border border-emerald-100 transition-colors duration-300"
          >
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <p className="text-emerald-800 font-medium">
                  Submitted Successfully! 🌙 May Allah accept your efforts.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <UserIcon className="w-4 h-4 inline mr-2 text-emerald-600" />
                  Your Name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Enter your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => handleInputFocus(nameInputRef)}
                  onBlur={() => handleInputBlur(nameInputRef)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-gray-900 placeholder-gray-400 bg-white"
                  disabled={isSubmitting}
                />
              </div>

              {/* Para Select */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <BookOpenIcon className="w-4 h-4 inline mr-2 text-emerald-600" />
                  Select Para
                </label>
                <select
                  ref={selectInputRef}
                  required
                  value={para}
                  onChange={(e) => setPara(e.target.value)}
                  onFocus={() => handleInputFocus(selectInputRef)}
                  onBlur={() => handleInputBlur(selectInputRef)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                  disabled={isSubmitting}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Choose para you've read</option>
                  {paraOptions.map((p) => (
                    <option key={p} value={p}>
                      {p} {p === 1 ? 'Para' : 'Paras'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                ref={buttonRef}
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5" />
                      Submit Reading
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Ramadan Day', value: stats.ramadanDay, icon: '🌙' },
              { label: 'Total Paras', value: stats.totalParas, icon: '📖' },
              { label: 'Active Readers', value: stats.activeReaders, icon: '👥' },
              { label: "Today's Reading", value: stats.todayReading, icon: '📊' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="text-xl sm:text-2xl mb-1 block">{stat.icon}</span>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-700">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          {userStats.readingHistory.length > 0 && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userStats.readingHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="text-xs text-gray-600 flex justify-between items-center py-1 border-b border-emerald-50 last:border-0">
                    <span>{entry.name} read {entry.paras} {entry.paras === 1 ? 'para' : 'paras'}</span>
                    <span className="text-emerald-600">{formatDate(entry.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            🌙 May this Ramadan bring peace and blessings to all 🌙
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { 
  UsersIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  UserGroupIcon,
  SunIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function AdminPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const cardsRef = useRef([]);
  const tableRef = useRef(null);
  const headerRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with filters
      let url = "/api/participants";
      const params = new URLSearchParams();
      
      if (selectedDay !== 'all') {
        params.append('day', selectedDay);
      }
      
      if (searchTerm) {
        params.append('name', searchTerm);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        setSummary(result.summary);
      } else {
        throw new Error(result.message);
      }
      
      // Animate new data
      if (tableRef.current) {
        gsap.fromTo(tableRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDay, searchTerm]);

  useEffect(() => {
    if (!loading && data.length > 0 && cardsRef.current.length > 0) {
      // Animate cards
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.1,
          ease: "backOut(1.2)"
        }
      );

      // Animate header
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 1 }
        );
      }
    }
  }, [loading, data]);

  // Get unique Ramadan days for filter
  const ramadanDays = [...new Set(data.map(item => item.ramadanDay))].sort((a, b) => a - b);

  const handleRefresh = () => {
    gsap.to(cardsRef.current, {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: fetchData
    });
  };

  const handleRowHover = (index, isEnter) => {
    gsap.to(`.table-row-${index}`, {
      backgroundColor: isEnter ? "#f0fdf4" : "white",
      scale: isEnter ? 1.02 : 1,
      boxShadow: isEnter ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
      duration: 0.2
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cardData = summary ? [
    { 
      icon: UsersIcon, 
      label: 'Total Readings', 
      value: summary.totalParticipants,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: BookOpenIcon, 
      label: 'Total Para Read', 
      value: summary.totalParaRead,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      icon: UserGroupIcon, 
      label: 'Unique Participants', 
      value: summary.uniqueParticipants,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      icon: ChartBarIcon, 
      label: 'Avg Para/Day', 
      value: summary.averageParaPerDay,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div ref={headerRef} className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-emerald-100 rounded-2xl">
                  <SunIcon className="w-6 h-6 text-emerald-700" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 ml-16">
                Track and manage Ramadan Quran reading progress
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            Error: {error}
          </div>
        )}

        {loading && data.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 whitespace-nowrap">
                Loading data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    ref={el => cardsRef.current[index] = el}
                    className={`${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 border border-white/50 backdrop-blur-sm`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${card.color} rounded-xl shadow-lg`}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-4xl font-bold text-gray-900">
                        {card.value}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{card.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700 font-medium">Filter:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-gray-900 bg-white"
                >
                  <option value="all">All Days</option>
                  {ramadanDays.map(day => (
                    <option key={day} value={day}>Day {day}</option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {data.length} records
            </div>

            {/* Table */}
            <div 
              ref={tableRef}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-emerald-100"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <tr>
                      {['Name', 'Para Read', 'Total Para', 'Ramadan Day', 'Date'].map((header, index) => (
                        <th 
                          key={index}
                          className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <BookOpenIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          No records found
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr 
                          key={item._id}
                          className={`table-row-${index} hover:bg-emerald-50 transition-all duration-200 cursor-pointer`}
                          onMouseEnter={() => handleRowHover(index, true)}
                          onMouseLeave={() => handleRowHover(index, false)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                {item.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                              {item.para} {item.para === 1 ? 'Para' : 'Paras'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalPara}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              Day {item.ramadanDay}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
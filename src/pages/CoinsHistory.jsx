import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Award, AlertCircle, Coins } from "lucide-react";

const API_BASE_URL = "https://zuhr-star-production.up.railway.app";

const apiRequest = async (endpoint, options = {}) => {
  const rawRoot = localStorage.getItem("persist:root")

  let token = null

  if (rawRoot) {
    const root = JSON.parse(rawRoot)

    if (root.auth) {
      const auth = JSON.parse(root.auth) // ⬅️ ВАЖНО
      token = auth.accessToken
    }
  }

  console.log("TOKEN USED:", token)

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

const CoinsHistory = () => {
  const [history, setHistory] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoinsHistory();
  }, [type]);

  const fetchCoinsHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const endpoint = `/api/student-lms/coins/history${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiRequest(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch coins history');
      }

      const result = await response.json();

      if (result.success) {
        setHistory(result.data.transactions || []);
        setPagination(result.data.pagination || null);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('❌ Error fetching coins history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (itemType) => {
    switch (itemType) {
      case "earned":
        return <TrendingUp className="w-5 h-5" />;
      case "spent":
        return <TrendingDown className="w-5 h-5" />;
      case "bonus":
        return <Award className="w-5 h-5" />;
      case "penalty":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Coins className="w-5 h-5" />;
    }
  };

  const getTypeStyle = (itemType) => {
    switch (itemType) {
      case "earned":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "spent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "bonus":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "penalty":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalCoins = history.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 w-full md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            // onClick={() => navigate(-1)}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-200 font-medium text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Coins History</h1>
            <p className="text-gray-600">Track your earnings and spending</p>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 shadow-lg min-w-[200px]">
            <div className="flex items-center gap-3 text-white mb-2">
              <Coins className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Net Balance</span>
            </div>
            <div className="text-4xl font-bold text-white">{totalCoins}</div>
            <div className="text-xs text-white/80 mt-1">coins</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Filter by Type
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full md:w-64 border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gradient-to-r from-gray-50 to-blue-50 font-medium cursor-pointer text-gray-700 appearance-none pr-10"
            >
              <option value="">All Transactions</option>
              <option value="earned">💰 Earned</option>
              <option value="spent">🛒 Spent</option>
              <option value="bonus">🎁 Bonus</option>
              <option value="penalty">⚠️ Penalty</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Error loading transactions</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Loading transactions...</p>
          </div>
        ) : history.length > 0 ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-600 to-gray-700">
                      <th className="p-4 text-left font-semibold text-white text-sm">#</th>
                      <th className="p-4 text-left font-semibold text-white text-sm">Type</th>
                      <th className="p-4 text-left font-semibold text-white text-sm">Amount</th>
                      <th className="p-4 text-left font-semibold text-white text-sm">Reason</th>
                      <th className="p-4 text-left font-semibold text-white text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr
                        key={item.transaction_id || index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 text-gray-600 font-medium">{index + 1}</td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium capitalize ${getTypeStyle(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold text-lg ${item.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {item.amount > 0 ? "+" : ""}{item.amount}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700">{item.reason || "-"}</td>
                        <td className="p-4 text-gray-600">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {history.map((item, index) => (
                  <div key={item.transaction_id || index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium capitalize text-sm ${getTypeStyle(item.type)}`}>
                        {getTypeIcon(item.type)}
                        {item.type}
                      </div>
                      <span className={`font-bold text-xl ${item.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.amount > 0 ? "+" : ""}{item.amount}
                      </span>
                    </div>
                    <div className="text-gray-700 font-medium mb-1">{item.reason || "-"}</div>
                    <div className="text-sm text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Info */}
            {pagination && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing page {pagination.current} of {pagination.total} ({pagination.totalItems} total transactions)
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No transactions found</p>
            <p className="text-gray-500">Try adjusting your filters or start earning coins!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinsHistory;
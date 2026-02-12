import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://zuhr-star-production.up.railway.app";

const apiRequest = async (endpoint, options = {}) => {
  const rawRoot = localStorage.getItem("persist:root");

  let token = null;

  if (rawRoot) {
    const root = JSON.parse(rawRoot);

    if (root.auth) {
      const auth = JSON.parse(root.auth);
      token = auth.accessToken;
    }
  }

  console.log("TOKEN USED:", token);

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

const Home = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [introductions, setIntroductions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await apiRequest("/api/student-lms/dashboard");

      if (!response.ok) {
        console.log("Dashboard fetch failed");
        return;
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntroductions = async () => {
    try {
      const response = await apiRequest("/api/introductions");

      if (!response.ok) {
        console.log("Introductions fetch failed");
        return;
      }

      const result = await response.json();
      setIntroductions(result.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchIntroductions();
  }, []);

  // Skeleton
  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7F8] flex flex-col gap-6 items-center justify-center">
        <div className="animate-pulse w-[90%] max-w-[1200px]">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            <div className="flex flex-col gap-3 w-1/2">
              <div className="h-6 bg-gray-300 rounded w-[70%]" />
              <div className="h-4 bg-gray-300 rounded w-[40%]" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[140px] bg-gray-300 rounded-[18px]" />
            ))}
          </div>

          <div className="w-full h-[300px] bg-gray-300 rounded-[18px]" />
        </div>
      </div>
    );
  }

  const student = dashboardData.student || {};
  const statistics = dashboardData.statistics || {};
  const leaderboard = dashboardData.leaderboard || [];

  return (
    <div className="px-[48px] py-[45px] bg-[#F5F7F8] w-full min-h-screen">
      {/* HEADER */}
      <div className="flex gap-[18px]">
        <img
          src={student.imgURL || "https://via.placeholder.com/64"}
          alt=""
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="font-[Inter] font-medium text-[28px]">
            Welcome back, {student.name} {student.surname}!
          </h2>
          <p className="font-[Inter] font-medium text-[20px]">{student.role}</p>
        </div>
      </div>

      {/* VIDEO CARDS */}
      {/* <div className="mt-[36px] flex gap-6 flex-wrap">
        {introductions.map((item) => (
          <div
            key={item._id}
            className="w-[380px] h-[320px] bg-white rounded-[18px] p-[18px]"
          >
            <video
              src={item.video}
              controls
              className="w-full h-[200px] rounded-[12px] object-cover"
            />

            <h2 className="font-[Inter] font-medium text-[18px] pt-[12px]">
              {item.title}
            </h2>

            <p className="font-[Inter] font-medium text-[15px] text-[#4C6282]">
              {item.description}
            </p>
          </div>
        ))}
      </div> */}

      {/* STATISTICS */}
      <div>
        <h2 className="font-[Inter] font-medium text-[28px] mt-[46px]">Your Statistics</h2>
        <div className="flex gap-[28px] mt-[19px]">
          <div
            className="w-[280px] h-[140px] rounded-[18px] bg-white pt-[31px] px-[28px] cursor-pointer hover:scale-110 transition duration-500"
            onClick={() => navigate("/coins-history")}
          >
            <p className="font-[Inter] font-medium text-[18px] text-[#60708A]">Coins</p>
            <p className="font-[Inter] font-medium text-[34px]">
              {statistics.totalCoins?.toLocaleString() || 0}
            </p>
          </div>

          <div className="w-[280px] h-[140px] rounded-[18px] bg-white pt-[31px] px-[28px] cursor-pointer hover:scale-110 transition duration-500">
            <p className="font-[Inter] font-medium text-[18px] text-[#60708A]">Level</p>
            <p className="font-[Inter] font-medium text-[34px]">
              {statistics.currentLevel || 0}
            </p>
          </div>

          <div
            className="w-[280px] h-[140px] rounded-[18px] bg-white pt-[31px] px-[28px] cursor-pointer hover:scale-110 transition duration-500"
            onClick={() => navigate("/ranking")}
          >
            <p className="font-[Inter] font-medium text-[18px] text-[#60708A]">Ranking</p>
            <p className="font-[Inter] font-medium text-[34px]">
              {statistics.currentRank || 1}
              {statistics.currentRank === 1
                ? "st"
                : statistics.currentRank === 2
                  ? "nd"
                  : statistics.currentRank === 3
                    ? "rd"
                    : "th"}{" "}
              place
            </p>
          </div>

          <div className="w-[280px] h-[140px] rounded-[18px] bg-white pt-[31px] px-[28px] cursor-pointer hover:scale-110 transition duration-500">
            <p className="font-[Inter] font-medium text-[18px] text-[#60708A]">Modules</p>
            <p className="font-[Inter] font-medium text-[34px]">
              {statistics.completedModules || 0}/{statistics.totalModules || 0}
            </p>
          </div>
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="mt-[45px]">
        <h2 className="font-[Inter] font-medium text-[28px]">Leaderboard</h2>

        <table className="w-full bg-white border-collapse rounded-xl overflow-hidden shadow-sm mt-[18px]">
          <thead>
            <tr className="bg-white text-left">
              <th className="p-3 pl-7 font-[Inter] font-medium text-[16px] text-black text-center">
                Rank
              </th>
              <th className="p-3 pl-7 font-[Inter] font-medium text-[16px] text-black">
                Name
              </th>
              <th className="p-3 pl-7 font-[Inter] font-medium text-[16px] text-black text-center">
                Coins
              </th>
              <th className="p-3 pl-7 font-[Inter] font-medium text-[16px] text-black text-center">
                Modules
              </th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((s, i) => (
              <tr key={i} className="border-t border-[#dbdbdb] hover:bg-gray-50">
                <td className="p-3 font-[Inter] font-medium text-center">{s.rank}</td>

                <td className="p-3 pl-7 font-[Inter] font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={s.imgURL}
                      alt={s.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {s.name}
                  </div>
                </td>

                <td className="p-3 font-[Inter] font-medium text-center">{s.coins}</td>
                <td className="p-3 font-[Inter] font-medium text-center">{s.modules}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
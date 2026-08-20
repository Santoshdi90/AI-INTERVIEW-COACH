import React, { useEffect, useState } from 'react';
import { analyticsApi } from '@/services/api.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { BarChart3, TrendingUp, Award, Target, Zap } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getAnalytics()
      .then((res) => setData(res.data?.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-96 skeleton rounded-2xl w-full" />;
  }

  const { summary, weeklyProgress, skillRadar, skills, typeDistribution } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[#fafafa] tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">
          Track interview progression, evaluation metrics, and skill trajectory over time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Practice Sessions</span>
          <p className="text-2xl font-semibold text-white mt-1">{summary?.totalInterviews || 0}</p>
          <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">
            {summary?.completedInterviews || 0} sessions completed
          </span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</span>
          <p className="text-2xl font-semibold text-emerald-400 mt-1">{summary?.successRate || 0}%</p>
          <span className="text-[10px] text-gray-500 mt-1 block">Completion ratio</span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg Overall Score</span>
          <p className="text-2xl font-semibold text-white mt-1">{summary?.averageScore || 0}%</p>
          <span className="text-[10px] text-gray-500 mt-1 block">Cross-session mean</span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Technical Accuracy</span>
          <p className="text-2xl font-semibold text-white mt-1">{summary?.technicalScore || 0}%</p>
          <span className="text-[10px] text-gray-500 mt-1 block">Technical correctness depth</span>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
        <h3 className="text-xs font-semibold text-gray-250 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" /> Weekly Score Progression
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyProgress || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" stroke="#6b6b7a" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#6b6b7a" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Average Score"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Radar & Interview Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
          <h3 className="text-xs font-semibold text-gray-250 uppercase tracking-wider mb-4">Skill Assessment Matrix</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadar || []}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="skill" stroke="#8e8e9f" fontSize={10} />
                <Radar dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
          <h3 className="text-xs font-semibold text-gray-250 uppercase tracking-wider mb-4">Category Practice Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="type" stroke="#6b6b7a" fontSize={9} />
                <YAxis stroke="#6b6b7a" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" name="Sessions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

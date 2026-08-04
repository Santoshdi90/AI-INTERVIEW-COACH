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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">
          Track interview progression, evaluation metrics, and skill trajectory over time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400">Total Practice Sessions</span>
          <p className="text-2xl font-extrabold text-white mt-1">{summary?.totalInterviews || 0}</p>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 block">
            {summary?.completedInterviews || 0} Completed Sessions
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400">Completion Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{summary?.successRate || 0}%</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Completion ratio</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400">Avg Overall Score</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-1">{summary?.averageScore || 0}%</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Cross-session mean score</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-gray-400">Technical Accuracy</span>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">{summary?.technicalScore || 0}%</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Technical depth index</span>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" /> Weekly Score Progression
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyProgress || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#6b6b85" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#6b6b85" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12121f',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Average Score"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: '#7c3aed', r: 5 }}
                activeDot={{ r: 8, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Radar & Interview Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-gray-100 mb-4">Skill Assessment Matrix</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillRadar || []}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" stroke="#a0a0b8" fontSize={11} />
                <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-gray-100 mb-4">Category Practice Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="type" stroke="#6b6b85" fontSize={10} />
                <YAxis stroke="#6b6b85" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121f',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" name="Sessions" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

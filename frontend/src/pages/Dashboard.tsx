import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/services/api.service';
import {
  Video,
  FileText,
  Trophy,
  Target,
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    userApi
      .getDashboard()
      .then((res) => setData(res.data?.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 skeleton w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const skillsRadar =
    data?.skills?.map((s: any) => ({
      subject: s.name,
      score: s.proficiency,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Banner / Welcome */}
      <div className="border border-zinc-800 p-6 md:p-8 rounded-xl bg-zinc-900/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#fafafa] tracking-tight">
              Interview Practice Workspace
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              Practice real-time technical & behavioral questions, get instant structure diagnostics, confidence metrics, and technical correctness analytics.
            </p>
          </div>
          <button
            onClick={() => navigate('/interview/new')}
            className="btn-primary shrink-0 py-2.5 px-5 text-xs shadow-sm hover:scale-[1.01] transition-transform"
          >
            <PlusCircle className="w-4 h-4" /> Start Mock Practice
          </button>
        </div>
      </div>

      {/* AI Diagnostic Assessment Card */}
      {data?.diagnosticFeedback && (
        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/20 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-indigo-400 border border-zinc-700 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#fafafa] mb-1">Diagnostic Assessment</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{data.diagnosticFeedback}</p>
          </div>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Practice Sessions</span>
            <Video className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-white mt-1.5">{data?.totalInterviews || 0}</p>
          <span className="text-[10px] text-gray-500 block mt-1">
            {data?.completedInterviews || 0} sessions completed
          </span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Average Evaluation</span>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-white mt-1.5">
            {data?.averageScore ? `${data.averageScore}%` : 'N/A'}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">
            Overall response score
          </span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Resume Quality</span>
            <FileText className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-semibold text-white mt-1.5">
            {data?.resumeScore ? `${data.resumeScore}/100` : 'Not uploaded'}
          </p>
          <span
            className="text-[10px] text-indigo-400 hover:underline cursor-pointer inline-flex items-center gap-0.5 mt-1"
            onClick={() => navigate('/resume')}
          >
            ATS Rating: {data?.atsScore || 'N/A'}% <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="border border-zinc-800 p-5 rounded-xl bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Key Focus Area</span>
            <Target className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-sm font-bold text-white mt-2 truncate">
            {data?.weakSkills?.[0]?.name || 'System Design'}
          </p>
          <span className="text-[10px] text-amber-500 inline-flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" /> Practice recommended
          </span>
        </div>
      </div>

      {/* Radar Chart & Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">Skill Proficiency Radar</h3>
            <span className="text-xs text-indigo-400 hover:underline cursor-pointer" onClick={() => navigate('/analytics')}>
              View Analytics →
            </span>
          </div>

          {skillsRadar.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#8e8e9f" fontSize={10} />
                  <Radar
                    name="Skill"
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-gray-400">No skill data yet.</p>
              <button onClick={() => navigate('/resume')} className="btn-secondary text-xs mt-3">
                Upload Resume to Extract Skills
              </button>
            </div>
          )}
        </div>

        {/* Strong / Weak Areas */}
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Skill Assessment Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                  Top Strengths
                </span>
                <div className="flex flex-wrap gap-2">
                  {data?.strongSkills?.length > 0 ? (
                    data.strongSkills.map((s: any) => (
                      <span key={s.id} className="badge badge-emerald">
                        {s.name} ({s.proficiency}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Take an interview to discover strengths</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-2">
                  Areas Needing Improvement
                </span>
                <div className="flex flex-wrap gap-2">
                  {data?.weakSkills?.length > 0 ? (
                    data.weakSkills.map((s: any) => (
                      <span key={s.id} className="badge badge-rose">
                        {s.name} ({s.proficiency}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No weak areas identified yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400">Active Target: <strong className="text-gray-200">{data?.user?.targetRole || 'Software Engineer'}</strong></span>
            <button onClick={() => navigate('/profile')} className="text-xs text-indigo-400 font-semibold hover:underline">
              Edit Target →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-200">Recent Interview Sessions</h3>
          <button onClick={() => navigate('/interview/new')} className="btn-secondary text-xs py-1.5 px-3">
            + New Interview
          </button>
        </div>

        {data?.recentInterviews?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title / Type</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInterviews.map((item: any) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-gray-200">
                      {item.title}
                      <span className="block text-[11px] text-gray-400 font-normal">{item.type}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.difficulty === 'EASY'
                            ? 'badge-emerald'
                            : item.difficulty === 'MEDIUM'
                            ? 'badge-amber'
                            : 'badge-rose'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'COMPLETED'
                            ? 'badge-purple'
                            : item.status === 'IN_PROGRESS'
                            ? 'badge-cyan'
                            : 'badge-amber'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="font-bold text-gray-100">
                      {item.overallScore ? `${item.overallScore}%` : '-'}
                    </td>
                    <td className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(
                            item.status === 'COMPLETED'
                              ? `/interview/${item.id}/feedback`
                              : `/interview/${item.id}`
                          )
                        }
                        className="text-xs text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        {item.status === 'COMPLETED' ? 'View Feedback' : 'Continue'}{' '}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 mb-3">No interview sessions found.</p>
            <button onClick={() => navigate('/interview/new')} className="btn-primary text-xs">
              Start Your First Practice Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

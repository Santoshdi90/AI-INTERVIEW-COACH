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
      <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-black/60 border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5" /> AI Performance Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ready for your next interview?
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              Practice real-time technical & behavioral questions, get instantaneous feedback on STAR methodology, confidence, and keyword depth.
            </p>
          </div>
          <button
            onClick={() => navigate('/interview/new')}
            className="btn-primary py-3 px-6 text-sm shadow-xl shadow-purple-900/50 hover:scale-105 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" /> Start Practice Interview
          </button>
        </div>
      </div>

      {/* AI Diagnostic Assessment Card */}
      {data?.diagnosticFeedback && (
        <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">AI Diagnostic Assessment</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{data.diagnosticFeedback}</p>
          </div>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Practice Sessions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{data?.totalInterviews || 0}</p>
          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-emerald-400" /> {data?.completedInterviews || 0} completed
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Average Performance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {data?.averageScore ? `${data.averageScore}%` : 'N/A'}
          </p>
          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
            <Award className="w-3 h-3 text-amber-400" /> Overall AI Evaluation
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Resume Quality Score</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {data?.resumeScore ? `${data.resumeScore}/100` : 'Not uploaded'}
          </p>
          <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 mt-1" onClick={() => navigate('/resume')}>
            ATS Score: {data?.atsScore || 'N/A'} <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Key Focus Area</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-white mt-2 truncate">
            {data?.weakSkills?.[0]?.name || 'System Design'}
          </p>
          <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" /> Practice recommended
          </span>
        </div>
      </div>

      {/* Radar Chart & Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-100">Skill Proficiency Radar</h3>
            <span className="text-xs text-purple-400 hover:underline cursor-pointer" onClick={() => navigate('/analytics')}>
              View Analytics →
            </span>
          </div>

          {skillsRadar.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="#a0a0b8" fontSize={11} />
                  <Radar
                    name="Skill"
                    dataKey="score"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm text-gray-400">No skill data yet.</p>
              <button onClick={() => navigate('/resume')} className="btn-secondary text-xs mt-3">
                Upload Resume to Extract Skills
              </button>
            </div>
          )}
        </div>

        {/* Strong / Weak Areas */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-100 mb-4">Skill Assessment Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
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
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-2">
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
            <span className="text-xs text-gray-400">Active Target: <strong>{data?.user?.targetRole || 'Software Engineer'}</strong></span>
            <button onClick={() => navigate('/profile')} className="text-xs text-purple-400 font-semibold hover:underline">
              Edit Target →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-100">Recent Interview Sessions</h3>
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
                        className="text-xs text-purple-400 font-semibold hover:underline inline-flex items-center gap-1"
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

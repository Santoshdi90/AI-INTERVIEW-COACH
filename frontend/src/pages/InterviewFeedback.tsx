import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '@/services/api.service';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const InterviewFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    interviewApi
      .getFeedback(id)
      .then((res) => setData(res.data?.data))
      .catch((err) => {
        toast.error('Failed to load feedback.');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-96 skeleton rounded-2xl w-full" />;
  }

  const { interview, feedbacks } = data || {};
  const overallScore = interview?.overallScore || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-black border border-purple-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="badge badge-purple text-xs mb-2">{interview?.type}</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Interview Performance Evaluation
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Completed on {new Date(interview?.updatedAt).toLocaleDateString()} • {interview?.questions?.length} Questions Answered
            </p>
          </div>

          <div className="flex items-center gap-6 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">
                Overall AI Score
              </span>
              <span className="text-3xl font-extrabold gradient-text">{overallScore}%</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-xs py-2.5 px-4"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Per Question AI Breakdown */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" /> Question-by-Question Analysis
        </h3>

        {feedbacks?.map((item: any, idx: number) => {
          const fb = item;
          const q = fb.question || interview?.questions?.[idx];
          const ans = q?.answer;

          return (
            <div key={fb.id || idx} className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Question {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-white leading-snug">{q?.text}</h4>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold text-sm shrink-0">
                  Score: {fb.overallScore || 0}%
                </div>
              </div>

              {/* User Answer */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Your Answer Transcript
                </span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{ans?.transcript || 'No response recorded'}"
                </p>
              </div>

              {/* Metric Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Technical Accuracy</span>
                  <span className="text-base font-bold text-emerald-400">{fb.technicalScore || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Communication</span>
                  <span className="text-base font-bold text-cyan-400">{fb.communicationScore || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">STAR Method</span>
                  <span className="text-base font-bold text-purple-400">{fb.starMethodScore || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Confidence</span>
                  <span className="text-base font-bold text-amber-400">{fb.confidenceScore || 0}%</span>
                </div>
              </div>

              {/* Ideal Answer Comparison */}
              {fb.idealAnswer && (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Model Answer Benchmark
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">{fb.idealAnswer}</p>
                </div>
              )}

              {/* Suggestions */}
              {fb.suggestions?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-bold text-gray-200">AI Improvement Tips:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fb.suggestions.map((sug: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-lg bg-white/[0.02] text-xs text-gray-300 flex items-start gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

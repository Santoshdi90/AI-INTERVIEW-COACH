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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="badge badge-purple text-xs mb-2">{interview?.type}</span>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Interview Evaluation Report
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Completed on {new Date(interview?.updatedAt).toLocaleDateString()} • {interview?.questions?.length} Questions Answered
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">
                Overall Score
              </span>
              <span className="text-3xl font-bold text-white">{overallScore}%</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-xs py-2 px-4"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Per Question AI Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          Question-by-Question Analysis
        </h3>

        {feedbacks?.map((item: any, idx: number) => {
          const fb = item;
          const q = fb.question || interview?.questions?.[idx];
          const ans = q?.answer;

          return (
            <div key={fb.id || idx} className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Question {idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-white leading-snug">{q?.text}</h4>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-bold text-xs shrink-0">
                  Score: {fb.overallScore || 0}%
                </div>
              </div>

              {/* User Answer */}
              <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Your Answer
                </span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{ans?.transcript || 'No response recorded'}"
                </p>
              </div>

              {/* Metric Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-800 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Technical</span>
                  <span className="text-base font-bold text-white">{fb.technicalScore || 0}%</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-800 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Communication</span>
                  <span className="text-base font-bold text-white">{fb.communicationScore || 0}%</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-800 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">STAR Structure</span>
                  <span className="text-base font-bold text-white">{fb.starMethodScore || 0}%</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-800 text-center">
                  <span className="text-[10px] text-gray-400 block font-semibold">Confidence</span>
                  <span className="text-base font-bold text-white">{fb.confidenceScore || 0}%</span>
                </div>
              </div>

              {/* Ideal Answer Comparison */}
              {fb.idealAnswer && (
                <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                    Model Answer Benchmark
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">{fb.idealAnswer}</p>
                </div>
              )}

              {/* Suggestions */}
              {fb.suggestions?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <span className="text-xs font-semibold text-gray-200">Improvement Suggestions:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fb.suggestions.map((sug: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-lg bg-zinc-900/20 border border-zinc-800 text-xs text-gray-300 flex items-start gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '@/services/api.service';
import {
  Code,
  UserCheck,
  Brain,
  Layers,
  Sparkles,
  Zap,
  Server,
  Database,
  Cpu,
  Globe,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const INTERVIEW_TYPES = [
  { id: 'HR', label: 'HR Interview', icon: UserCheck, desc: 'Behavioral, career goals & culture fit' },
  { id: 'TECHNICAL', label: 'General Technical', icon: Code, desc: 'Algorithms, data structures & concepts' },
  { id: 'SYSTEM_DESIGN', label: 'System Design', icon: Layers, desc: 'Scalability, microservices & architecture' },
  { id: 'FRONTEND', label: 'Frontend Tech', icon: Globe, desc: 'Web fundamentals, CSS, DOM & performance' },
  { id: 'BACKEND', label: 'Backend Tech', icon: Server, desc: 'APIs, concurrency, caching & servers' },
  { id: 'REACT', label: 'React.js Specialist', icon: Zap, desc: 'Hooks, Virtual DOM, state management' },
  { id: 'NODE', label: 'Node.js Specialist', icon: Cpu, desc: 'Event loop, streams & async patterns' },
  { id: 'DATABASE', label: 'Databases & SQL', icon: Database, desc: 'Indexing, ACID, normalization & ORMs' },
  { id: 'JAVASCRIPT', label: 'JavaScript Deep Dive', icon: Code, desc: 'Closures, promises, scope & ES6+' },
  { id: 'CUSTOM', label: 'Custom Topic', icon: Boxes, desc: 'Define your specific topic or technology' },
];

export const InterviewSetup: React.FC = () => {
  const [selectedType, setSelectedType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.create({
        type: selectedType,
        difficulty,
        totalQuestions: questionCount,
        customTopic: selectedType === 'CUSTOM' ? customTopic : undefined,
      });

      const interviewId = res.data?.data?.interview?.id;
      if (interviewId) {
        toast.success('Interview session generated!');
        navigate(`/interview/${interviewId}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create interview session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Setup AI Mock Interview</h1>
        <p className="text-xs text-gray-400 mt-1">
          Customize your interview category, difficulty level, and session parameters.
        </p>
      </div>

      {/* Step 1: Select Type */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" /> 1. Select Interview Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-900/20'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">{type.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{type.desc}</p>
              </div>
            );
          })}
        </div>

        {selectedType === 'CUSTOM' && (
          <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Custom Topic / Specification
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Next.js 14 App Router, GraphQL, Microfrontends"
              className="input-field text-xs"
            />
          </div>
        )}
      </div>

      {/* Step 2: Difficulty & Question Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-200">2. Select Difficulty Level</h3>
          <div className="grid grid-cols-3 gap-2">
            {['EASY', 'MEDIUM', 'HARD'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                  difficulty === level
                    ? level === 'EASY'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : level === 'MEDIUM'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-200">3. Number of Questions</h3>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                  questionCount === count
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary py-3 px-8 text-sm shadow-xl shadow-purple-900/40"
        >
          {loading ? (
            'Generating Interview Questions...'
          ) : (
            <>
              Launch Interview <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

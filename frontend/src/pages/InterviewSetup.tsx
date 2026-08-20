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
        <h1 className="text-lg md:text-xl font-semibold text-[#fafafa] tracking-tight">Configure Practice Session</h1>
        <p className="text-xs text-gray-400 mt-1">
          Select your category, difficulty preference, and question quantity to begin.
        </p>
      </div>

      {/* Step 1: Select Type */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
        <h3 className="text-xs font-semibold text-gray-200 flex items-center gap-2 uppercase tracking-wider">
          1. Select Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-500/5 border-indigo-600'
                    : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`p-1.5 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">{type.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{type.desc}</p>
              </div>
            );
          })}
        </div>

        {selectedType === 'CUSTOM' && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
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
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
          <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">2. Difficulty Level</h3>
          <div className="grid grid-cols-3 gap-2">
            {['EASY', 'MEDIUM', 'HARD'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  difficulty === level
                    ? level === 'EASY'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : level === 'MEDIUM'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-zinc-900/20 border-zinc-800 text-gray-400 hover:border-zinc-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
          <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">3. Number of Questions</h3>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  questionCount === count
                    ? 'bg-indigo-500/10 border-indigo-600 text-indigo-400'
                    : 'bg-zinc-900/20 border-zinc-800 text-gray-400 hover:border-zinc-700'
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
          className="btn-primary py-2.5 px-6 text-xs shadow-sm"
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

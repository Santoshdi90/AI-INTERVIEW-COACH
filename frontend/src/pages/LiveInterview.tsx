import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '@/services/api.service';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  Mic,
  MicOff,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LiveInterview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const {
    isListening,
    fullTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  // Load interview details
  useEffect(() => {
    if (!id) return;
    interviewApi
      .getById(id)
      .then((res) => {
        const data = res.data?.data?.interview;
        setInterview(data);
        if (data?.status === 'PENDING') {
          interviewApi.start(id);
        }
        if (data?.currentQuestion !== undefined) {
          setCurrentIndex(data.currentQuestion < data.questions.length ? data.currentQuestion : 0);
        }
      })
      .catch((err) => {
        toast.error('Failed to load interview.');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Sync transcript to textInput
  useEffect(() => {
    if (fullTranscript) {
      setTextInput(fullTranscript);
    }
  }, [fullTranscript]);

  // Timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = interview?.questions?.[currentIndex];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!textInput.trim()) {
      toast.error('Please record or type an answer before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      if (isListening) stopListening();

      await interviewApi.submitAnswer(id!, {
        questionId: currentQuestion.id,
        transcript: textInput,
        duration: timer,
      });

      toast.success('Answer evaluated!');
      resetTranscript();
      setTextInput('');
      setShowHint(false);

      if (currentIndex + 1 < interview.questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last question completed -> Finish interview
        handleFinishInterview();
      }
    } catch (err: any) {
      toast.error('Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    try {
      await interviewApi.complete(id!);
      toast.success('Interview session completed!');
      navigate(`/interview/${id}/feedback`);
    } catch (err) {
      navigate(`/interview/${id}/feedback`);
    }
  };

  const handleTextSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return <div className="h-96 skeleton rounded-2xl w-full" />;
  }

  if (!interview || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400">Interview session not available.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary text-xs mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border border-zinc-800 p-4 rounded-xl bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <span className="badge badge-purple text-xs font-semibold">{interview.type}</span>
          <span className="badge badge-amber text-xs font-semibold">{interview.difficulty}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-200 font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> {formatTimer(timer)}
          </div>

          <button
            onClick={handleFinishInterview}
            className="btn-danger text-xs py-1.5 px-3"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="border border-zinc-800 p-6 md:p-8 rounded-xl bg-zinc-900/20">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span className="font-semibold uppercase tracking-wider text-indigo-400">
            Question {currentIndex + 1} of {interview.questions.length}
          </span>
          <button
            onClick={() => handleTextSpeech(currentQuestion.text)}
            className="flex items-center gap-1 text-xs text-gray-300 hover:text-indigo-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition-all border border-zinc-700"
          >
            <Volume2 className="w-3.5 h-3.5" /> Read Aloud
          </button>
        </div>

        <h2 className="text-base md:text-lg font-semibold text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Hints */}
        {currentQuestion.hints?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Show Answer Hint'}
            </button>
            {showHint && (
              <p className="mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300/90 leading-relaxed">
                💡 {currentQuestion.hints.join(' ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Answer Input Section */}
      <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Your Response
          </label>

          {isSupported ? (
            <button
              onClick={handleToggleMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-xs transition-all border ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <MicOff className="w-3.5 h-3.5" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-zinc-400" /> Record Answer
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-amber-400">Speech API not supported in browser</span>
          )}
        </div>

        <textarea
          rows={5}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Speak into your microphone or type your response here..."
          className="input-field text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary text-xs py-2 px-4 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting || !textInput.trim()}
            className="btn-primary text-xs py-2 px-5 shadow-sm"
          >
            {submitting ? (
              'Evaluating Answer...'
            ) : currentIndex + 1 === interview.questions.length ? (
              <>
                Submit & Finish Interview <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Next Question <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

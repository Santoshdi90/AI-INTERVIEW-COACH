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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="badge badge-purple text-xs font-bold">{interview.type}</span>
          <span className="badge badge-amber text-xs">{interview.difficulty}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
            <Clock className="w-4 h-4 text-purple-400" /> {formatTimer(timer)}
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
      <div className="glass-card p-6 md:p-8 rounded-2xl relative bg-gradient-to-b from-purple-900/10 to-transparent border border-purple-500/20">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span className="font-semibold uppercase tracking-wider text-purple-400">
            Question {currentIndex + 1} of {interview.questions.length}
          </span>
          <button
            onClick={() => handleTextSpeech(currentQuestion.text)}
            className="flex items-center gap-1 text-xs text-gray-300 hover:text-purple-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" /> Read Aloud
          </button>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Hints */}
        {currentQuestion.hints?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Show Answer Hint'}
            </button>
            {showHint && (
              <p className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                💡 {currentQuestion.hints.join(' ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Answer Input Section */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Your Response (Speech to Text)
          </label>

          {isSupported ? (
            <button
              onClick={handleToggleMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                isListening
                  ? 'bg-rose-500 text-white recording-pulse shadow-lg shadow-rose-900/40'
                  : 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-purple-400" /> Record Answer
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
            className="btn-primary text-xs py-2 px-6 shadow-lg shadow-purple-900/30"
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

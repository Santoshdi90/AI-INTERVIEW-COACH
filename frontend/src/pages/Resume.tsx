import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeApi } from '@/services/api.service';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  Award,
  ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Resume: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await resumeApi.getAll();
      const list = res.data?.data?.resumes || [];
      setResumes(list);
      const active = list.find((r: any) => r.isActive) || list[0] || null;
      setActiveResume(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await resumeApi.upload(formData);
      toast.success('Resume uploaded & analyzed by AI!');
      await fetchResumes();
      if (res.data?.data?.resume) {
        setActiveResume(res.data.data.resume);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleDelete = async (id: string) => {
    try {
      await resumeApi.delete(id);
      toast.success('Resume deleted');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await resumeApi.setActive(id);
      toast.success('Active resume updated');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to set active resume');
    }
  };

  if (loading) {
    return <div className="h-64 skeleton rounded-2xl w-full" />;
  }

  const analysis = activeResume?.analysisJson || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Resume Analyzer</h1>
        <p className="text-xs text-gray-400 mt-1">
          Upload your PDF resume to extract skills, calculate ATS score, and receive AI optimization suggestions.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`glass-card p-8 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/10 hover:border-purple-500/40 hover:bg-white/[0.02]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-200">
          {isDragActive ? 'Drop your PDF resume here...' : 'Click or drag PDF resume to upload'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB (PDF only)</p>
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-400 font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing resume with AI...
          </div>
        )}
      </div>

      {activeResume ? (
        <div className="space-y-6">
          {/* Resume Analysis Summary Header */}
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-black">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeResume.fileName}</h3>
                  <p className="text-xs text-gray-400">
                    Uploaded on {new Date(activeResume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">
                    Overall Score
                  </span>
                  <span className="text-2xl font-extrabold text-purple-400">
                    {activeResume.overallScore || 0}/100
                  </span>
                </div>

                <div className="text-center border-l border-white/10 pl-6">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">
                    ATS Readiness
                  </span>
                  <span className="text-2xl font-extrabold text-cyan-400">
                    {activeResume.atsScore || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted & Missing Skills */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-purple-400" /> Extracted Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skills?.map((skill: string) => (
                  <span key={skill} className="badge badge-purple">
                    {skill}
                  </span>
                ))}
              </div>

              {analysis.missingSkills?.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <h5 className="text-xs font-semibold text-rose-400 mb-2">Recommended Skills to Add</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill: string) => (
                      <span key={skill} className="badge badge-rose">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> AI Diagnostic Feedback
              </h4>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-400">Strengths:</p>
                <ul className="space-y-1">
                  {analysis.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-xs font-semibold text-amber-400">Improvement Opportunities:</p>
                <ul className="space-y-1">
                  {analysis.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Suggestions Box */}
          <div className="glass-card p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Optimization Suggestions
            </h4>
            <div className="space-y-2">
              {analysis.suggestions?.map((sug: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-gray-300 flex items-start gap-2"
                >
                  <span className="font-bold text-purple-400">{idx + 1}.</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-xs text-gray-400">No active resume analyzed yet. Upload one above.</p>
        </div>
      )}

      {/* Uploaded Resumes List */}
      {resumes.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-gray-200 mb-4">Resume History</h3>
          <div className="space-y-2">
            {resumes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold text-gray-200">{item.fileName}</p>
                    <p className="text-[10px] text-gray-400">
                      Score: {item.overallScore}/100 • ATS: {item.atsScore}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isActive ? (
                    <span className="badge badge-emerald">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(item.id)}
                      className="text-xs text-purple-400 hover:underline"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

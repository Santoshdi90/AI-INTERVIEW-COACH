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
        <h1 className="text-lg md:text-xl font-semibold text-[#fafafa] tracking-tight">Resume Diagnostics</h1>
        <p className="text-xs text-gray-400 mt-1">
          Upload your PDF resume to extract skills, review ATS correctness, and see specific structure suggestions.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-all ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-700'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mx-auto mb-3 border border-zinc-700">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-gray-200">
          {isDragActive ? 'Drop your resume here...' : 'Click or drag PDF resume to upload'}
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF format only, maximum 5MB</p>
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-400 font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing resume structure...
          </div>
        )}
      </div>

      {activeResume ? (
        <div className="space-y-6">
          {/* Resume Analysis Summary Header */}
          <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/40">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{activeResume.fileName}</h3>
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
                  <span className="text-xl font-bold text-white">
                    {activeResume.overallScore || 0} / 100
                  </span>
                </div>

                <div className="text-center border-l border-zinc-800 pl-6">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">
                    ATS Readiness
                  </span>
                  <span className="text-xl font-bold text-indigo-400">
                    {activeResume.atsScore || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted & Missing Skills */}
            <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
              <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-zinc-500" /> Extracted Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skills?.map((skill: string) => (
                  <span key={skill} className="badge badge-purple">
                    {skill}
                  </span>
                ))}
              </div>

              {analysis.missingSkills?.length > 0 && (
                <div className="pt-3 border-t border-zinc-850">
                  <h5 className="text-xs font-semibold text-rose-450 mb-2">Recommended Skills to Add</h5>
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
            <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30 space-y-4">
              <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-500" /> Evaluation Assessment
              </h4>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-400">Strengths:</p>
                <ul className="space-y-1">
                  {analysis.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-850">
                <p className="text-xs font-semibold text-amber-400">Improvement Opportunities:</p>
                <ul className="space-y-1">
                  {analysis.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Suggestions Box */}
          <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              Optimization Suggestions
            </h4>
            <div className="space-y-2">
              {analysis.suggestions?.map((sug: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-zinc-900/50 border border-zinc-800 text-xs text-gray-300 flex items-start gap-2"
                >
                  <span className="font-bold text-indigo-400">{idx + 1}.</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800 p-8 rounded-xl bg-zinc-900/30 text-center">
          <p className="text-xs text-gray-400">No active resume analyzed yet. Upload one above.</p>
        </div>
      )}

      {/* Uploaded Resumes List */}
      {resumes.length > 0 && (
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900/30">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Resume History</h3>
          <div className="space-y-2">
            {resumes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/20 border border-zinc-800 text-xs hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-400" />
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
                      className="text-xs text-indigo-400 hover:underline"
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

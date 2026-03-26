import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Table, 
  Zap, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeDecision, AnalysisType } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [decision, setDecision] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pros-cons');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeDecision(decision, analysisType);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setDecision('');
    setResult(null);
    setError(null);
  };

  const analysisOptions = [
    { id: 'pros-cons', label: 'Pros & Cons List' },
    { id: 'comparison', label: 'Comparison Table' },
    { id: 'swot', label: 'SWOT Analysis' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-16 px-6 pb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-5xl font-bold tracking-tight text-indigo-600">The Tie Breaker</h1>
          <p className="text-[#64748b] text-lg font-medium">
            Your AI-powered decision-making co-pilot.
          </p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="bg-white p-10 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200"
            >
              <form onSubmit={handleAnalyze} className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="decision" className="block text-lg font-semibold text-slate-700 mb-2">
                      What decision do you need to make?
                    </label>
                    <textarea
                      id="decision"
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      placeholder="Should I offer my app for free or charge for a paid $20/month plan"
                      className="w-full min-h-[140px] p-5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl transition-all outline-none text-lg shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <span className="block text-lg font-semibold text-slate-700 mb-4">
                      Choose Analysis Type:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {analysisOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAnalysisType(option.id)}
                          className={cn(
                            "py-4 px-6 rounded-xl border-2 font-semibold transition-all text-center",
                            analysisType === option.id 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                              : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !decision.trim()}
                    className="w-full py-5 bg-indigo-600 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-indigo-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Get Analysis
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200">
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Analysis Result</h2>
                  <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
                </div>

                <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:text-slate-700 prose-td:text-slate-600 overflow-hidden">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-lg font-bold transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Analysis
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-8">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Objective Analysis
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Data Driven
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-slate-400 text-sm font-medium">
        <div className="max-w-4xl mx-auto space-y-2">
          <p>The Tie Breaker v1.0</p>
          <p className="text-xs opacity-70 uppercase tracking-widest">Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

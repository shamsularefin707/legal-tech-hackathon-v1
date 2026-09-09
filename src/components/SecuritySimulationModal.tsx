/**
 * লাইভ নিরাপত্তা মহড়া মডাল (Interactive End-to-End Security Simulation)
 * ১০-ধাপ বিশিষ্ট অনুপ্রবেশ প্রতিরোধ ও ইনসিডেন্ট রেসপন্স মহড়া
 */

import React from 'react';
import {
  X,
  Play,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  ExternalLink,
  History,
  Lock,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const SecuritySimulationModal: React.FC = () => {
  const {
    isSimulationModalOpen,
    setIsSimulationModalOpen,
    simulationState,
    runSecuritySimulation,
    setActiveView,
    viewSecurityIncident,
  } = useLegalAid();

  if (!isSimulationModalOpen) return null;

  const { isRunning, currentStep, isCompleted, logs, correlationId } = simulationState;

  const progressPercent = Math.min(100, Math.round((currentStep / 10) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="bg-white rounded border border-gray-400 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3.5 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-gray-100">
                  নিরাপত্তা অনুপ্রবেশ প্রতিরোধ ও ইনসিডেন্ট রেসপন্স মহড়া
                </h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                  লাইভ সিমুলেশন স্যান্ডবক্স
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                কাল্পনিক বাহ্যিক আক্রমণ প্রতিহতকরণ, স্বয়ংক্রিয় লগিং ও প্রতিরোধ ব্যবস্থার মহড়া
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulationModalOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Status Header */}
        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-2/3 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
              <span>মহড়া অগ্রগতি: ধাপ {currentStep} / ১০</span>
              <span className={isCompleted ? 'text-emerald-700' : 'text-blue-700'}>
                {isCompleted ? 'সম্পন্ন (১০০%)' : `${progressPercent}%`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {isRunning && (
              <span className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-900 px-2.5 py-1 rounded text-[11px] font-bold border border-blue-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>সিমুলেশন চলছে...</span>
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>আক্রমণ প্রতিহত ও নিয়ন্ত্রিত</span>
              </span>
            )}
            {correlationId && (
              <span className="bg-gray-200 text-gray-800 text-[10px] font-mono px-2 py-1 rounded border border-gray-300">
                আইডি: {correlationId}
              </span>
            )}
          </div>
        </div>

        {/* 10-Step Interactive Log Feed */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5 bg-gray-50/70">
          <div className="text-[11px] font-bold text-gray-600 mb-1 flex items-center justify-between">
            <span>ইনসিডেন্ট রেসপন্স লাইফসাইকেল (Detect → Contain → Audit):</span>
            <span className="text-[10px] text-gray-400 font-normal">
              রিয়েল-টাইম স্টেট ও অডিট ট্রেস
            </span>
          </div>

          {logs.map((item) => {
            const isDone = item.status === 'DONE';
            const isCur = item.status === 'RUNNING';
            const isPend = item.status === 'PENDING';

            return (
              <div
                key={item.step}
                className={`p-3 rounded border transition-all ${
                  isDone
                    ? 'bg-white border-gray-300 text-gray-800 shadow-xs'
                    : isCur
                    ? 'bg-blue-50/90 border-blue-400 text-blue-950 ring-1 ring-blue-300'
                    : 'bg-gray-100/60 border-gray-200 text-gray-400 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isDone && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {isCur && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                      {isPend && (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center space-x-2">
                        <span>{item.titleBn}</span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          ({item.titleEn})
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 text-gray-600 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCur
                        ? 'bg-blue-200 text-blue-900 animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone ? 'সফল' : isCur ? 'প্রক্রিয়াধীন' : 'অপেক্ষমাণ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-gray-100 px-5 py-3 border-t border-gray-300 flex flex-wrap justify-between items-center gap-2">
          <div className="text-[11px] text-gray-500">
            {isCompleted
              ? 'মহড়ার সকল প্রমাণাদি এবং কোরিলেশন রেকর্ড অডিট ট্রেইলে যুক্ত হয়েছে।'
              : 'সিমুলেশন চলছে, অনুগ্রহ করে অপেক্ষা করুন...'}
          </div>

          <div className="flex items-center space-x-2">
            {isCompleted && (
              <>
                <button
                  onClick={() => {
                    setIsSimulationModalOpen(false);
                    viewSecurityIncident('inc-42');
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-900 border border-red-300 hover:bg-red-100 rounded font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                  <span>ইনসিডেন্ট বিস্তারিত দেখুন</span>
                </button>

                <button
                  onClick={() => {
                    setIsSimulationModalOpen(false);
                    setActiveView('audit-log');
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100 rounded font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-blue-700" />
                  <span>অডিট লগে দেখুন</span>
                </button>

                <button
                  onClick={runSecuritySimulation}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>পুনরায় মহড়া চালান</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsSimulationModalOpen(false)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-semibold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

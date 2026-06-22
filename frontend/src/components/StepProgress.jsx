import { useLocation } from "react-router-dom";
import { Mic, ScanLine, HeartPulse, Stethoscope, FileText, Check } from "lucide-react";

const STEPS = [
  { path: "/intake", label: "Intake", icon: Mic },
  { path: "/scan", label: "Scan", icon: ScanLine },
  { path: "/vitals", label: "Vitals", icon: HeartPulse },
  { path: "/triage", label: "Triage", icon: Stethoscope },
  { path: "/report", label: "Report", icon: FileText },
];

export default function StepProgress() {
  const location = useLocation();
  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

  // Don't show on pages that aren't part of the flow (e.g. dashboard)
  if (currentIndex === -1) return null;

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 py-4 sm:px-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.path} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${
                      isCompleted
                        ? "bg-teal-600 border-teal-600 text-white"
                        : isCurrent
                        ? "bg-teal-50 border-teal-600 text-teal-700"
                        : "bg-slate-50 border-slate-300 text-slate-400"
                    }`}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? "text-teal-700"
                      : isCompleted
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 ${
                    index < currentIndex ? "bg-teal-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Mic, ScanLine, HeartPulse, Stethoscope, FileText, ArrowRight } from "lucide-react";

const FLOW_STEPS = [
  { label: "Intake", icon: Mic, desc: "Record symptoms by voice" },
  { label: "Scan", icon: ScanLine, desc: "Digitise prescriptions" },
  { label: "Vitals", icon: HeartPulse, desc: "Enter patient vitals" },
  { label: "Triage", icon: Stethoscope, desc: "AI severity assessment" },
  { label: "Report", icon: FileText, desc: "Voice + PDF summary" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gradient-to-b from-teal-50 to-white px-6 py-12 sm:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
          Rural Healthcare Triage Assistant
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mb-10">
          AI-powered support for community health workers — faster triage,
          clearer decisions, better care.
        </p>

        <button
          onClick={() => navigate("/intake")}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700
                     text-white font-semibold px-8 py-3.5 rounded-xl shadow-sm
                     transition-colors text-base sm:text-lg mb-14"
        >
          Start New Patient Assessment
          <ArrowRight size={20} />
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
          {FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center w-full sm:w-auto">
                <div
                  className="flex flex-col items-center bg-white border border-slate-200
                             rounded-xl px-5 py-5 shadow-sm w-full sm:w-36"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600
                                  flex items-center justify-center mb-3">
                    <Icon size={22} />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">
                    {step.label}
                  </span>
                  <span className="text-xs text-slate-400 text-center mt-1">
                    {step.desc}
                  </span>
                </div>

                {index < FLOW_STEPS.length - 1 && (
                  <ArrowRight
                    className="text-slate-300 hidden sm:block mx-2 shrink-0"
                    size={20}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

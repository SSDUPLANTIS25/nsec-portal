"use client";

import { X, Package, Clock, Camera, Receipt, FileText, Wrench } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Props {
  open: boolean;
  onClose: () => void;
}

const fieldActions = [
  { icon: Clock, label: "Clock In / Out", color: "bg-green-500" },
  { icon: Camera, label: "Submit Photo", color: "bg-blue-500" },
  { icon: Receipt, label: "Log Mileage", color: "bg-orange-500" },
  { icon: Wrench, label: "Report Issue", color: "bg-red-500" },
  { icon: FileText, label: "Site Report", color: "bg-purple-500" },
];

const officeActions = [
  { icon: Package, label: "New Order", color: "bg-brand-blue" },
  { icon: FileText, label: "New Quote", color: "bg-purple-500" },
  { icon: Clock, label: "Log Time", color: "bg-green-500" },
  { icon: Receipt, label: "Submit Expense", color: "bg-orange-500" },
];

const mgmtActions = [
  { icon: Package, label: "New Order", color: "bg-brand-blue" },
  { icon: FileText, label: "New Project", color: "bg-purple-500" },
  { icon: Clock, label: "Log Time", color: "bg-green-500" },
  { icon: Receipt, label: "Submit Expense", color: "bg-orange-500" },
  { icon: Wrench, label: "New Task", color: "bg-teal-500" },
];

export default function QuickCreateSheet({ open, onClose }: Props) {
  const { user } = useAuth();
  const role = user?.role ?? "field";
  const actions = role === "field" ? fieldActions : role === "office" ? officeActions : mgmtActions;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 animate-fadeIn" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slideUp pb-safe">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <span className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center`}>
                <action.icon className="w-6 h-6" />
              </span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

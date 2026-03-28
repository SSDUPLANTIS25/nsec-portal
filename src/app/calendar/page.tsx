"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMondayData } from "@/lib/use-monday-data";
import type { CalendarEvent, Installation } from "@/lib/monday-types";
import { MapPin, ChevronLeft, ChevronRight, Users, MessageSquare, Package, CheckCircle2, Calendar, AlertTriangle } from "lucide-react";

export default function CalendarPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: calendarEvents, loading, error } = useMondayData<CalendarEvent[]>("calendar");
  const { data: installations } = useMondayData<Installation[]>("installations");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (error) {
    return (
      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !calendarEvents) {
    return (
      <div className="px-4 py-12 max-w-lg mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading calendar from Monday.com...</p>
      </div>
    );
  }

  const dayEvents = calendarEvents.filter((e) => e.date === selectedDate);

  // Installation status summary — matching Replit's On Track / At Risk / Overdue cards
  const installEvents = calendarEvents.filter((e) => e.type === "installation");
  const onTrack = installEvents.filter((e) => new Date(e.date) >= new Date(today)).length;
  const overdue = installEvents.filter((e) => new Date(e.date) < new Date(today)).length;
  const atRisk = 0; // Could be computed from installations nearing deadline

  // Upcoming installations for the sidebar
  const upcomingInstalls = (installations ?? [])
    .filter((i) => i.jobStatus !== "Totally Complete" && i.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  // Month grid
  const baseDate = new Date(selectedDate + "T12:00:00");
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const shiftMonth = (direction: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setMonth(d.getMonth() + direction);
    d.setDate(1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  function getDateStr(dayNum: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  }

  function eventsOnDay(dayNum: number) {
    return (calendarEvents ?? []).filter((e) => e.date === getDateStr(dayNum));
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Page header */}
      <div className="px-4 pt-3 pb-1">
        <h1 className="text-xl font-bold text-gray-900">Installation Calendar</h1>
        <p className="text-xs text-gray-500 mt-0.5">Schedule and track installation crews</p>
      </div>

      {/* Status summary cards — large colored backgrounds like Replit */}
      <div className="px-4 pt-2 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-600 font-medium">On Track</p>
              <p className="text-2xl font-bold text-emerald-700">{onTrack}</p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-600 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-amber-700">{atRisk}</p>
            </div>
            <AlertTriangle className="w-7 h-7 text-amber-300" />
          </div>
          <div className={`rounded-xl p-3 flex items-center justify-between ${overdue > 0 ? "bg-red-50" : "bg-gray-50"}`}>
            <div>
              <p className={`text-[10px] font-medium ${overdue > 0 ? "text-red-600" : "text-gray-500"}`}>Overdue</p>
              <p className={`text-2xl font-bold ${overdue > 0 ? "text-red-700" : "text-gray-400"}`}>{overdue}</p>
            </div>
            <AlertTriangle className={`w-7 h-7 ${overdue > 0 ? "text-red-300" : "text-gray-300"}`} />
          </div>
        </div>
      </div>

      {/* Calendar View heading */}
      <div className="px-4 pb-1">
        <p className="text-sm font-semibold text-gray-700">Calendar View</p>
        <p className="text-[10px] text-gray-400">Color-coded by deadline status</p>
      </div>

      {/* Month header with navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setSelectedDate(today)}
            className="px-2 py-0.5 text-[10px] font-medium text-brand-blue bg-blue-50 rounded-md"
          >
            Today
          </button>
        </div>
        <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Month Grid */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={i} className="h-11 bg-gray-50" />;
            const dateStr = getDateStr(day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const dayEvts = eventsOnDay(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-11 flex flex-col items-center justify-center bg-white relative transition-all ${
                  isSelected
                    ? "bg-brand-blue text-white z-10 ring-2 ring-brand-blue"
                    : isToday
                    ? "bg-blue-50 text-brand-blue font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs">{day}</span>
                {dayEvts.length > 0 && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvts.some((e) => e.type === "installation") && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                    {dayEvts.some((e) => e.type === "meeting") && <span className="w-1 h-1 rounded-full bg-purple-500" />}
                    {dayEvts.some((e) => e.type === "delivery") && <span className="w-1 h-1 rounded-full bg-amber-500" />}
                  </div>
                )}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 text-[7px] text-brand-blue font-bold">Today</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      <div className="px-4 pt-2 pb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${eventColor(event.type)}`}>
                  {eventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${typeBadge(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-400">{event.time}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400 truncate">{event.location}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-sm text-gray-400">No events scheduled</p>
          </div>
        )}
      </div>

      {/* Upcoming Installations sidebar — like Replit */}
      {upcomingInstalls.length > 0 && (
        <div className="px-4 pt-2 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Upcoming Installations
          </h3>
          <div className="space-y-2">
            {upcomingInstalls.map((install) => {
              const isOverdue = install.date && new Date(install.date) < new Date(today);
              const borderColor = isOverdue ? "border-l-red-500" : install.jobStatus === "Phase Done" ? "border-l-amber-500" : "border-l-emerald-500";

              return (
                <div key={install.id} className={`bg-white rounded-xl p-3 border border-gray-100 shadow-sm border-l-4 ${borderColor}`}>
                  <p className="text-sm font-medium text-gray-900">{install.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {install.date ? new Date(install.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                  </p>
                  {install.projectManager && (
                    <p className="text-xs text-gray-400">{install.projectManager}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      install.jobStatus === "In Progress" ? "bg-blue-50 text-blue-600" :
                      install.jobStatus === "Phase Done" ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>
                      {install.jobStatus}
                    </span>
                    {isOverdue && (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Overdue</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "installation": return "bg-blue-100 text-blue-600";
    case "meeting": return "bg-purple-100 text-purple-600";
    case "delivery": return "bg-amber-100 text-amber-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "installation": return <Users className="w-5 h-5" />;
    case "meeting": return <MessageSquare className="w-5 h-5" />;
    case "delivery": return <Package className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "installation": return "bg-blue-50 text-blue-600";
    case "meeting": return "bg-purple-50 text-purple-600";
    case "delivery": return "bg-amber-50 text-amber-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

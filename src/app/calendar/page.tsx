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
      <div className="px-4 py-16 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Monday.com Not Connected</h2>
        <p className="text-sm text-gray-500">Set the MONDAY_API_KEY environment variable to connect your NSEC workspace.</p>
      </div>
    );
  }

  if (loading || !calendarEvents) {
    return (
      <div className="px-4 py-16 max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto text-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  const dayEvents = calendarEvents.filter((e) => e.date === selectedDate);

  const installEvents = calendarEvents.filter((e) => e.type === "installation");
  const onTrack = installEvents.filter((e) => new Date(e.date) >= new Date(today)).length;
  const overdue = installEvents.filter((e) => new Date(e.date) < new Date(today)).length;
  const atRisk = 0;

  const upcomingInstalls = (installations ?? [])
    .filter((i) => i.jobStatus !== "Totally Complete" && i.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

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
    <div className="max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto">
      {/* Page header */}
      <div className="px-4 lg:px-6 pt-5 pb-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Installation Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Schedule and track installation crews</p>
      </div>

      {/* Status summary cards */}
      <div className="px-4 lg:px-6 pt-2 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-emerald-50 rounded-xl stat-card">
            <div>
              <p className="stat-label text-emerald-600">On Track</p>
              <p className="stat-value text-emerald-700">{onTrack}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="bg-amber-50 rounded-xl stat-card">
            <div>
              <p className="stat-label text-amber-600">At Risk</p>
              <p className="stat-value text-amber-700">{atRisk}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div className={`rounded-xl stat-card ${overdue > 0 ? "bg-red-50" : "bg-gray-50"}`}>
            <div>
              <p className={`stat-label ${overdue > 0 ? "text-red-600" : "text-gray-500"}`}>Overdue</p>
              <p className={`stat-value ${overdue > 0 ? "text-red-700" : "text-gray-400"}`}>{overdue}</p>
            </div>
            <AlertTriangle className={`w-6 h-6 ${overdue > 0 ? "text-red-300" : "text-gray-300"}`} />
          </div>
        </div>
      </div>

      {/* Calendar View heading */}
      <div className="px-4 lg:px-6 pb-1">
        <p className="section-title">Calendar View</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Color-coded by deadline status</p>
      </div>

      {/* Desktop: side-by-side calendar + events */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:px-6">
      <div className="lg:col-span-3">

      {/* Month header */}
      <div className="flex items-center justify-between px-4 lg:px-0 py-3">
        <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Previous month">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-gray-700">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setSelectedDate(today)}
            className="px-2.5 py-1 text-[11px] font-medium text-brand-blue bg-blue-50 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>
        <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Next month">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Month Grid */}
      <div className="px-4 lg:px-0 pb-3">
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={i} className="h-11 bg-gray-50/50" />;
            const dateStr = getDateStr(day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const dayEvts = eventsOnDay(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-11 flex flex-col items-center justify-center bg-white relative transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-blue text-white z-10 ring-2 ring-brand-blue"
                    : isToday
                    ? "bg-blue-50 text-brand-blue font-bold hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
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

      </div>{/* end calendar left column */}
      <div className="lg:col-span-2">

      {/* Selected day events */}
      <div className="px-4 lg:px-0 pt-3 pb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div key={event.id} className="card p-3 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${eventColor(event.type)}`}>
                  {eventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md ${typeBadge(event.type)}`}>
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
          <div className="card p-6 text-center">
            <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No events scheduled</p>
          </div>
        )}
      </div>

      {/* Upcoming Installations */}
      {upcomingInstalls.length > 0 && (
        <div className="px-4 lg:px-0 pt-2 pb-4">
          <h3 className="section-title flex items-center gap-1.5 mb-2.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            Upcoming Installations
          </h3>
          <div className="space-y-2">
            {upcomingInstalls.map((install) => {
              const isOverdue = install.date && new Date(install.date) < new Date(today);
              const borderColor = isOverdue ? "border-l-red-500" : install.jobStatus === "Phase Done" ? "border-l-amber-500" : "border-l-emerald-500";

              return (
                <div key={install.id} className={`card p-3 border-l-[3px] ${borderColor}`}>
                  <p className="text-sm font-medium text-gray-900">{install.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {install.date ? new Date(install.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                  </p>
                  {install.projectManager && (
                    <p className="text-xs text-gray-400">{install.projectManager}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                      install.jobStatus === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-100" :
                      install.jobStatus === "Phase Done" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {install.jobStatus}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">Overdue</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>{/* end right column */}
      </div>{/* end desktop grid */}
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "installation": return "bg-blue-50 text-blue-600";
    case "meeting": return "bg-purple-50 text-purple-600";
    case "delivery": return "bg-amber-50 text-amber-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "installation": return <Users className="w-[18px] h-[18px]" />;
    case "meeting": return <MessageSquare className="w-[18px] h-[18px]" />;
    case "delivery": return <Package className="w-[18px] h-[18px]" />;
    default: return <Calendar className="w-[18px] h-[18px]" />;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "installation": return "bg-blue-50 text-blue-600 border border-blue-100";
    case "meeting": return "bg-purple-50 text-purple-600 border border-purple-100";
    case "delivery": return "bg-amber-50 text-amber-600 border border-amber-100";
    default: return "bg-gray-50 text-gray-600 border border-gray-100";
  }
}

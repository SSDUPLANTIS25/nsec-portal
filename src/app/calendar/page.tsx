"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { calendarEvents } from "@/lib/mock-data";
import { MapPin, ChevronLeft, ChevronRight, Users, MessageSquare, Package, CheckCircle2, Calendar } from "lucide-react";

const typeLabels: Record<string, string> = {
  installation: "Install",
  meeting: "Meeting",
  delivery: "Delivery",
  training: "Training",
};

export default function CalendarPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2026-03-27");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const dayEvents = calendarEvents.filter((e) => e.date === selectedDate);

  // Generate week days around selected date
  const baseDate = new Date(selectedDate + "T12:00:00");
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - baseDate.getDay() + i);
    return {
      date: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: d.toISOString().split("T")[0] === "2026-03-27",
      hasEvents: calendarEvents.some((e) => e.date === d.toISOString().split("T")[0]),
    };
  });

  const shiftWeek = (direction: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + direction * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftWeek(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => setSelectedDate("2026-03-27")}
            className="px-3 py-1 text-xs font-medium text-brand-blue bg-blue-50 rounded-lg"
          >
            Today
          </button>
          <button onClick={() => shiftWeek(1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div className="flex px-2 gap-1 pb-3">
        {weekDays.map((day) => {
          const selected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
                selected
                  ? "bg-brand-blue text-white shadow-md shadow-blue-200"
                  : day.isToday
                  ? "bg-blue-50 text-brand-blue"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="text-[10px] font-medium opacity-70">{day.dayName}</span>
              <span className="text-base font-bold mt-0.5">{day.dayNum}</span>
              {day.hasEvents && !selected && (
                <span className="w-1 h-1 rounded-full bg-brand-blue mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Events for selected day */}
      <div className="px-4 space-y-2 pb-4">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${eventColor(event.type)}`}>
                {eventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${typeBadge(event.type)}`}>
                    {typeLabels[event.type]}
                  </span>
                  <span className="text-xs text-gray-400">{event.time}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                {event.location && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">{event.location}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "installation": return "bg-blue-100 text-blue-600";
    case "meeting": return "bg-purple-100 text-purple-600";
    case "delivery": return "bg-amber-100 text-amber-600";
    case "training": return "bg-green-100 text-green-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "installation": return <Users className="w-5 h-5" />;
    case "meeting": return <MessageSquare className="w-5 h-5" />;
    case "delivery": return <Package className="w-5 h-5" />;
    case "training": return <CheckCircle2 className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "installation": return "bg-blue-50 text-blue-600";
    case "meeting": return "bg-purple-50 text-purple-600";
    case "delivery": return "bg-amber-50 text-amber-600";
    case "training": return "bg-green-50 text-green-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

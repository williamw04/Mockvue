import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar as CalendarIcon, Plus, Expand } from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  description: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const todayEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "User interview with Sarah M.",
    time: "9:00 AM",
    description: "30-minute session about mobile app usage patterns",
    priority: "high",
    completed: false
  },
  {
    id: "2",
    title: "Review interview transcripts",
    time: "11:00 AM",
    description: "Process 3 interview recordings and extract key insights",
    priority: "high",
    completed: true
  },
  {
    id: "3",
    title: "Update research findings",
    time: "2:00 PM",
    description: "Add new themes and patterns from recent interviews",
    priority: "medium",
    completed: false
  },
  {
    id: "4",
    title: "Schedule next week's interviews",
    time: "3:30 PM",
    description: "Reach out to 5 participants for availability",
    priority: "medium",
    completed: false
  },
  {
    id: "5",
    title: "Prepare PM interview questions",
    time: "4:30 PM",
    description: "Draft questions focused on workflow optimization",
    priority: "low",
    completed: false
  }
];

const priorityDots = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500"
} as const;

export function DailyTasks() {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const completedCount = todayEvents.filter(event => event.completed).length;
  const totalEvents = todayEvents.length;

  const handleAddEvent = () => {
    // Handle adding new event
    console.log("Add new event");
  };

  const handleExpandCalendar = () => {
    setShowFullCalendar(!showFullCalendar);
  };

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full bg-surface border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <CalendarIcon className="w-5 h-5" />
            Today's Calendar
            <Badge variant="outline" className="ml-2 text-xs text-gray-900 border-gray-200">
              {completedCount}/{totalEvents}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                  event.completed
                    ? "bg-muted/50 opacity-60"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${priorityDots[event.priority]}`}></div>
                <div className="text-xs min-w-[50px] text-muted-foreground">
                  {event.time}
                </div>
                <div className={`text-sm truncate ${
                  event.completed
                    ? "line-through text-muted-foreground"
                    : "text-gray-900"
                }`}>
                  {event.title}
                </div>
              </div>
            ))}
          </div>

          {todayEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hover controls for entire calendar */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          <button
            className="w-8 h-8 rounded-md border shadow-sm flex items-center justify-center transition-colors bg-background border hover:bg-accent text-gray-900"
            onClick={handleAddEvent}
            title="Add new event"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-md border shadow-sm flex items-center justify-center transition-colors bg-background border hover:bg-accent text-gray-900"
            onClick={handleExpandCalendar}
            title="Expand calendar view"
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

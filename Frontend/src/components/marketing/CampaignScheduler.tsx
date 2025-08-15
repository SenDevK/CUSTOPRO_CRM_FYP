import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CampaignSchedulerProps {
  onSchedule: (scheduledFor: string) => void;
}

export function CampaignScheduler({ onSchedule }: CampaignSchedulerProps) {
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("09:00");

  // Handle schedule selection
  const handleScheduleSelection = () => {
    if (scheduleType === "now") {
      // Schedule for now (5 minutes from now)
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      onSchedule(now.toISOString());
    } else if (date) {
      // Schedule for selected date and time
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);
      onSchedule(scheduledDate.toISOString());
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schedule Campaign</CardTitle>
          <CardDescription>
            Choose when to send your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={scheduleType} 
            onValueChange={(value: "now" | "later") => setScheduleType(value)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="now" id="schedule-now" />
              <div className="grid gap-1.5">
                <Label htmlFor="schedule-now" className="font-medium">
                  Send immediately
                </Label>
                <p className="text-sm text-muted-foreground">
                  The campaign will be sent as soon as you create it
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="later" id="schedule-later" />
              <div className="grid gap-1.5 w-full">
                <Label htmlFor="schedule-later" className="font-medium">
                  Schedule for later
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose a specific date and time to send the campaign
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Label htmlFor="date" className="text-xs mb-1 block">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                          disabled={scheduleType !== "later"}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="time" className="text-xs mb-1 block">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="time"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={scheduleType !== "later"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
          
          <Button 
            className="mt-4 w-full sm:w-auto"
            onClick={handleScheduleSelection}
            disabled={scheduleType === "later" && !date}
          >
            {scheduleType === "now" ? "Send Immediately" : "Schedule Campaign"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

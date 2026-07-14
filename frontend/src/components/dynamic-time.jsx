"use client";

import { useTimeOffset } from "@/hooks/use-time-offset";

export function DynamicTime({ offsetMinutes = 10 }) {
  const timeData = useTimeOffset(offsetMinutes);

  return (
    <span suppressHydrationWarning>
      {timeData.hour}
      <span className="animate-pulse">:</span>
      {timeData.minute}
      {timeData.meridiem}
    </span>
  );
}

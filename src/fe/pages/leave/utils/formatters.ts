export const formatHalfDayLabel = (option?: string): string => {
  if (!option || option === "Full Day") return "Half Day";

  const map: Record<string, string> = {
    "1st Half": "First Half (Morning)",
    "2nd Half": "Second Half (Afternoon)",
    "Start 1st Half": "Start Date: 1st Half (Morning)",
    "Start 2nd Half": "Start Date: 2nd Half (Afternoon)",
    "End 1st Half": "End Date: 1st Half (Morning)",
    "End 2nd Half": "End Date: 2nd Half (Afternoon)",
    "Start 1st Half & End 1st Half": "Start & End: 1st Half (Morning)",
    "Start 1st Half & End 2nd Half": "Start: Morning | End: Afternoon",
    "Start 2nd Half & End 1st Half": "Start: Afternoon | End: Morning",
    "Start 2nd Half & End 2nd Half": "Start & End: 2nd Half (Afternoon)",
  };

  return map[option] || option;
};

export const formatDaysNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  const num = Number(val);
  return (Math.round((num + Number.EPSILON) * 100) / 100).toString();
};

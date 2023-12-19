import { useEffect, useState } from "react";
import {
  generateDatesFromYearBeginning,
  generateDatesFromYearBeginning2,
} from "../utils/generate-dates-from-year-beginning";
import { HabitDay } from "./HabitDay";
import { api } from "../lib/axios";
import dayjs from "dayjs";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

let summaryDates = generateDatesFromYearBeginning2();

const minimumSummaryDatesSize = 18 * 7; // 126 = 18 semanas de colunas com 7
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

type Summary = Array<{
  id: string;
  date: string;
  amount: number;
  completed: number;
}>;

export function SummaryTable() {
  const [summary, setSummary] = useState<Summary>([]);

  useEffect(() => {
    setTimeout(() => {
      api.get("summary").then((response) => {
        setSummary(response.data);
        console.log(response.data);
      });
      summaryDates = generateDatesFromYearBeginning();
    }, 500);
  }, []);
  return (
    <div className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekDays.map((weekDay, index) => {
          return (
            <div
              key={`${weekDay}-${index}`}
              className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
            >
              {weekDay}
            </div>
          );
        })}
      </div>
      <div
        className={`grid grid-rows-7 grid-flow-col gap-3 ${
          summaryDates.length > 133 && "pr-40"
        }`}
      >
        {summaryDates.length > 0 &&
          summaryDates.map((date, index) => {
            const dayInSummary = summary.find((day) => {
              return dayjs(date).isSame(day.date, "day");
            });

            return (
              <HabitDay
                key={`${date}-${index}`}
                date={date}
                amount={dayInSummary?.amount}
                defaultCompleted={dayInSummary?.completed}
              />
            );
          })}
        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, index) => {
            return (
              <div
                key={index}
                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
              />
            );
          })}
      </div>
    </div>
  );
}

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "phosphor-react";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import dayjs from "dayjs";

interface HabitsListProps {
  date: Date;
}

interface HabitsInfo {
  possibleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  completedHabits: string[];
}

export default function HabitsList({ date }: HabitsListProps) {
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>();
  useEffect(() => {
    api
      .get("day", {
        params: {
          date: date.toISOString(),
        },
      })
      .then((response) => {
        console.log(response.data);
        setHabitsInfo(response.data);
      });
  }, [date]);

  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());

  async function handleToggleHabit(habitId: string) {
    await api.patch(
      `/habits/${habitId}/toggle`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const isHabitAlreadyCompleted =
      habitsInfo!.completedHabits.includes(habitId);

    let completedHabits: string[] = [];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        (id) => id !== habitId
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }
    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits: completedHabits,
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {habitsInfo &&
        habitsInfo.possibleHabits.map((habit) => {
          return (
            <Checkbox.Root
              key={habit.id}
              disabled={isDateInPast}
              onCheckedChange={() => handleToggleHabit(habit.id)}
              checked={habitsInfo.completedHabits.includes(habit.id)}
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500">
                <Checkbox.Indicator>
                  <Check size={20} className="text-white" />
                </Checkbox.Indicator>
              </div>
              <span className="font-semibold text-xl leading-tight text-white group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                {habit.title}
              </span>
            </Checkbox.Root>
          );
        })}
    </div>
  );
}

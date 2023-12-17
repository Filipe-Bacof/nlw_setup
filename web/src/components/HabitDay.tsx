import * as Popover from "@radix-ui/react-popover";
import { ProgressBar } from "./ProgressBar";
import clsx from "clsx";
import dayjs from "dayjs";
import HabitsList from "./HabitsList";

interface HabitDayProps {
  date: Date;
  completed?: number;
  amount?: number;
}

export function HabitDay({ completed = 0, amount = 0, date }: HabitDayProps) {
  const completedPercerntage =
    amount > 0 ? Math.round((completed / amount) * 100) : 0;

  const dayAndMonth = dayjs(date).format("DD/MM");

  const dayOfWeek = dayjs(date).format("dddd");

  const today = dayjs().startOf("day").toDate();
  const isCurrentDay = dayjs(date).isSame(today);

  return (
    <Popover.Root>
      <Popover.Trigger
        className={clsx("w-10 h-10 border-2 rounded-lg focus:outline-none", {
          "bg-zinc-900 border-zinc-800": completedPercerntage === 0,
          "bg-violet-900 border-violet-700":
            completedPercerntage > 0 && completedPercerntage < 20,
          "bg-violet-800 border-violet-600":
            completedPercerntage >= 20 && completedPercerntage < 40,
          "bg-violet-700 border-violet-500":
            completedPercerntage >= 40 && completedPercerntage < 60,
          "bg-violet-600 border-violet-500":
            completedPercerntage >= 60 && completedPercerntage < 80,
          "bg-violet-500 border-violet-400": completedPercerntage >= 80,
          "border-white border-4": isCurrentDay,
        })}
      />
      <Popover.Portal>
        <Popover.Content className="min-w-[320px] w-full p-6 rounded-2xl bg-zinc-900 flex flex-col">
          <span className="font-semibold text-zinc-400 capitalize">
            {dayOfWeek}
          </span>
          <span className="mt-1 font-extrabold leading-tight text-3xl">
            {dayAndMonth}
          </span>
          <ProgressBar progress={completedPercerntage} />
          <HabitsList date={date} />
          <Popover.Arrow height={8} width={16} className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

import dayjs from "dayjs";

export function generateDatesFromYearBeginning() {
  const firstDayOfTheYear = dayjs()
    .startOf("year")
    .set("hour", 3)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0);
  const today = dayjs();

  const dates = [];
  let compareDate = firstDayOfTheYear;

  while (compareDate.isBefore(today)) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, "day");
  }
  return dates;
}

export function generateDatesFromYearBeginning2() {
  const firstDayOfTheYear = dayjs().startOf("year");
  const today = dayjs();

  const dates = [];
  let compareDate = firstDayOfTheYear;

  while (compareDate.isBefore(today)) {
    dates.push(compareDate.toDate());
    compareDate = compareDate.add(1, "day");
  }
  return dates;
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const naoBeberAlcoolHabito = prisma.habit.create({
  data: {
    title: "Filipe: Não Beber Álcool",
    created_at: new Date("2023-12-18T03:00:00.000"),
    weekDays: {
      create: [
        { week_day: 0 },
        { week_day: 1 },
        { week_day: 2 },
        { week_day: 3 },
        { week_day: 4 },
        { week_day: 5 },
        { week_day: 6 },
      ],
    },
  },
});

const beberAguaHabito = prisma.habit.create({
  data: {
    title: "Dieli: Beber 3L de água",
    created_at: new Date("2023-12-18T03:00:00.000"),
    weekDays: {
      create: [
        { week_day: 0 },
        { week_day: 1 },
        { week_day: 2 },
        { week_day: 3 },
        { week_day: 4 },
        { week_day: 5 },
        { week_day: 6 },
      ],
    },
  },
});

const acordarCedoHabito = prisma.habit.create({
  data: {
    title: "Filipe: Acordar antes do Sol",
    created_at: new Date("2023-12-18T03:00:00.000"),
    weekDays: {
      create: [
        { week_day: 1 },
        { week_day: 2 },
        { week_day: 3 },
        { week_day: 4 },
        { week_day: 5 },
      ],
    },
  },
});

const retirarOLixoHabito = prisma.habit.create({
  data: {
    title: "Filipe: Retirar o Lixo para fora",
    created_at: new Date("2023-12-18T03:00:00.000"),
    weekDays: {
      create: [{ week_day: 2 }, { week_day: 4 }, { week_day: 6 }],
    },
  },
});

async function run(): Promise<void> {
  await prisma.dayHabit.deleteMany();
  await prisma.habitWeekDays.deleteMany();
  await prisma.day.deleteMany();
  await prisma.habit.deleteMany();

  await Promise.all([
    naoBeberAlcoolHabito,
    beberAguaHabito,
    acordarCedoHabito,
    retirarOLixoHabito,
  ]);
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

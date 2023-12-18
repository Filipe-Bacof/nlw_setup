import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return "Rota teste, aplicação Funcionando";
  });

  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs()
      .set("hour", 3)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0)
      .toDate();

    const result = await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });

    return result;
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date)
      .set("hour", 3)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);
    const weekDay = parsedDate.get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits =
      day?.dayHabits?.map((dayHabit) => {
        return dayHabit.habit_id;
      }) ?? [];

    console.log("Agora é: " + new Date());
    console.log("DAY");
    console.log(day);
    console.log("HABITOS COMPLETOS");
    console.log(completedHabits);

    return {
      possibleHabits,
      completedHabits,
    };
  });

  app.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    // Dá para fazer validação e permitir marcar os habitos de outros dias

    const today = dayjs()
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0)
      .toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  app.get("/summary", async () => {
    // ROCKETSEAT PARE DE USAR SQLITE JÁ!
    // Vou deixar a query SQL usada no vídeo no README do server

    const summary = await prisma.day.findMany({
      select: {
        id: true,
        date: true,
      },
    });

    const summaryUpdated = await Promise.all(
      summary.map(async (day) => {
        const completed = await prisma.dayHabit.count({
          where: {
            day_id: day.id,
          },
        });

        const amount = await prisma.habitWeekDays.count({
          where: {
            week_day: {
              equals: new Date(day.date).getDay(), // ou adapte conforme necessário
            },
            habit: {
              created_at: {
                lte: day.date,
              },
            },
          },
        });

        return {
          ...day,
          completed,
          amount,
        };
      })
    );

    return summaryUpdated;
  });
}

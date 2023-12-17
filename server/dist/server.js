"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));

// src/routes.ts
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/routes.ts
var import_dayjs = __toESM(require("dayjs"));
async function appRoutes(app2) {
  app2.get("/", async () => {
    return "Rota teste, aplica\xE7\xE3o Funcionando";
  });
  app2.post("/habits", async (request) => {
    const createHabitBody = import_zod.z.object({
      title: import_zod.z.string(),
      weekDays: import_zod.z.array(import_zod.z.number().min(0).max(6))
    });
    const { title, weekDays } = createHabitBody.parse(request.body);
    const today = (0, import_dayjs.default)().startOf("day").toDate();
    const result = await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay
            };
          })
        }
      }
    });
    return result;
  });
  app2.get("/day", async (request) => {
    const getDayParams = import_zod.z.object({
      date: import_zod.z.coerce.date()
    });
    const { date } = getDayParams.parse(request.query);
    const parsedDate = (0, import_dayjs.default)(date).startOf("day");
    const weekDay = parsedDate.get("day");
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    });
    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      },
      include: {
        dayHabits: true
      }
    });
    const completedHabits = day?.dayHabits?.map((dayHabit) => {
      return dayHabit.habit_id;
    }) ?? [];
    return {
      possibleHabits,
      completedHabits
    };
  });
  app2.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = import_zod.z.object({
      id: import_zod.z.string().uuid()
    });
    const { id } = toggleHabitParams.parse(request.params);
    const today = (0, import_dayjs.default)().startOf("day").toDate();
    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    });
    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      });
    }
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        }
      }
    });
    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      });
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id
        }
      });
    }
  });
  app2.get("/summary", async () => {
    const summary = await prisma.day.findMany({
      select: {
        id: true,
        date: true
      }
    });
    const summaryUpdated = await Promise.all(
      summary.map(async (day) => {
        const completed = await prisma.dayHabit.count({
          where: {
            day_id: day.id
          }
        });
        const amount = await prisma.habitWeekDays.count({
          where: {
            week_day: {
              equals: new Date(day.date).getDay()
              // ou adapte conforme necessário
            },
            habit: {
              created_at: {
                lte: day.date
              }
            }
          }
        });
        return {
          ...day,
          completed,
          amount
        };
      })
    );
    return summaryUpdated;
  });
}

// src/server.ts
var app = (0, import_fastify.default)();
app.register(import_cors.default, {
  origin: true,
  methods: ["GET", "PATCH", "POST"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization"
  ]
});
app.register(appRoutes);
app.listen({
  port: 3333
}).then(() => {
  console.log("\u{1F525} Server running on port 3333");
});

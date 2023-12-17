"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("./lib/prisma");
const dayjs_1 = __importDefault(require("dayjs"));
async function appRoutes(app) {
    app.get("/", async () => {
        return "Rota teste, aplicação Funcionando";
    });
    app.post("/habits", async (request) => {
        const createHabitBody = zod_1.z.object({
            title: zod_1.z.string(),
            weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6)),
        });
        const { title, weekDays } = createHabitBody.parse(request.body);
        const today = (0, dayjs_1.default)().startOf("day").toDate();
        const result = await prisma_1.prisma.habit.create({
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
        const getDayParams = zod_1.z.object({
            date: zod_1.z.coerce.date(),
        });
        const { date } = getDayParams.parse(request.query);
        const parsedDate = (0, dayjs_1.default)(date).startOf("day");
        const weekDay = parsedDate.get("day");
        const possibleHabits = await prisma_1.prisma.habit.findMany({
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
        const day = await prisma_1.prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            },
        });
        const completedHabits = day?.dayHabits?.map((dayHabit) => {
            return dayHabit.habit_id;
        }) ?? [];
        return {
            possibleHabits,
            completedHabits,
        };
    });
    app.patch("/habits/:id/toggle", async (request) => {
        const toggleHabitParams = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = toggleHabitParams.parse(request.params);
        // Dá para fazer validação e permitir marcar os habitos de outros dias
        const today = (0, dayjs_1.default)().startOf("day").toDate();
        let day = await prisma_1.prisma.day.findUnique({
            where: {
                date: today,
            },
        });
        if (!day) {
            day = await prisma_1.prisma.day.create({
                data: {
                    date: today,
                },
            });
        }
        const dayHabit = await prisma_1.prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                },
            },
        });
        if (dayHabit) {
            await prisma_1.prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                },
            });
        }
        else {
            await prisma_1.prisma.dayHabit.create({
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
        const summary = await prisma_1.prisma.day.findMany({
            select: {
                id: true,
                date: true,
            },
        });
        const summaryUpdated = await Promise.all(summary.map(async (day) => {
            const completed = await prisma_1.prisma.dayHabit.count({
                where: {
                    day_id: day.id,
                },
            });
            const amount = await prisma_1.prisma.habitWeekDays.count({
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
        }));
        return summaryUpdated;
    });
}
exports.appRoutes = appRoutes;

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { zones: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(events);
  } catch (err) {
    console.error("[GET /api/events]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      id: string;
      titleVi: string; titleEn: string; description: string;
      venue: string; startAt: string; endAt: string; policy: string;
      cover: string; cover2: string; badge: string;
      zones: Array<{
        id: string; name: string; type: string; color: string;
        x: number; y: number; w: number; h: number;
        capacity: number; price: number;
        rows?: number; cols?: number; queuePrefix?: string;
      }>;
    };

    const event = await prisma.event.create({
      data: {
        id: body.id,
        titleVi: body.titleVi,
        titleEn: body.titleEn,
        description: body.description,
        venue: body.venue,
        startAt: body.startAt,
        endAt: body.endAt,
        policy: body.policy,
        cover: body.cover,
        cover2: body.cover2,
        badge: body.badge,
        status: "open",
        publishedAt: new Date(),
        zones: {
          create: body.zones.map((z, i) => ({
            id: z.id,
            name: z.name,
            type: z.type,
            color: z.color,
            x: z.x, y: z.y, w: z.w, h: z.h,
            capacity: z.capacity,
            price: z.price,
            rows: z.rows ?? null,
            cols: z.cols ?? null,
            queuePrefix: z.queuePrefix ?? null,
            sortOrder: i,
          })),
        },
      },
      include: { zones: { orderBy: { sortOrder: "asc" } } },
    });

    return Response.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

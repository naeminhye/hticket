import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { event: { select: { titleVi: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    // Flatten event title into a top-level field for the client
    const rows = orders.map((o: typeof orders[number]) => ({
      ...o,
      event_title: o.event?.titleVi ?? null,
      event: undefined,
    }));
    return Response.json(rows);
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      eventId: string;
      buyer: string; email: string; phone?: string;
      areaName: string; qty: number; total: number; items: unknown[];
    };

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          eventId: body.eventId,
          buyer: body.buyer,
          email: body.email,
          phone: body.phone ?? "",
          areaName: body.areaName,
          qty: body.qty,
          total: body.total,
          status: "paid",
          items: body.items as object[],
        },
      }),
      prisma.event.update({
        where: { id: body.eventId },
        data: {
          sold: { increment: body.qty },
          revenue: { increment: body.total },
        },
      }),
    ]);

    return Response.json({ id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

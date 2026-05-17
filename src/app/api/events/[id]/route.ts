import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { zones: { orderBy: { sortOrder: "asc" } } },
    });
    if (!event) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(event);
  } catch (err) {
    console.error("[GET /api/events/:id]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      soldDelta?: number;
      revenueDelta?: number;
      status?: string;
    };

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(body.soldDelta !== undefined && { sold: { increment: body.soldDelta } }),
        ...(body.revenueDelta !== undefined && { revenue: { increment: body.revenueDelta } }),
        ...(body.status && { status: body.status }),
      },
    });
    return Response.json(event);
  } catch (err) {
    console.error("[PATCH /api/events/:id]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

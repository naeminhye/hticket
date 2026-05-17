import { sql, ensureTables } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTables();
    const { id } = await params;
    const [event] = await sql`
      SELECT e.*,
        COALESCE(json_agg(z ORDER BY z.sort_order) FILTER (WHERE z.id IS NOT NULL), '[]') AS zones
      FROM events e LEFT JOIN zones z ON z.event_id = e.id
      WHERE e.id = ${id}
      GROUP BY e.id
    `;
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
    await ensureTables();
    const { id } = await params;
    const body = await request.json() as {
      soldDelta?: number;
      revenueDelta?: number;
      status?: string;
    };

    if (body.soldDelta !== undefined || body.revenueDelta !== undefined) {
      await sql`
        UPDATE events
        SET
          sold    = sold + ${body.soldDelta ?? 0},
          revenue = revenue + ${body.revenueDelta ?? 0}
        WHERE id = ${id}
      `;
    }
    if (body.status) {
      await sql`UPDATE events SET status = ${body.status} WHERE id = ${id}`;
    }

    const [event] = await sql`SELECT * FROM events WHERE id = ${id}`;
    return Response.json(event);
  } catch (err) {
    console.error("[PATCH /api/events/:id]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

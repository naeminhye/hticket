import { sql, ensureTables } from "@/lib/db";

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`
      SELECT
        e.*,
        COALESCE(
          json_agg(z ORDER BY z.sort_order, z.id)
          FILTER (WHERE z.id IS NOT NULL),
          '[]'
        ) AS zones
      FROM events e
      LEFT JOIN zones z ON z.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("[GET /api/events]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
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

    await sql`
      INSERT INTO events
        (id, title_vi, title_en, description, venue, start_at, end_at, policy,
         cover, cover2, badge, status, published_at)
      VALUES
        (${body.id}, ${body.titleVi}, ${body.titleEn}, ${body.description},
         ${body.venue}, ${body.startAt}, ${body.endAt}, ${body.policy},
         ${body.cover}, ${body.cover2}, ${body.badge}, 'open', now())
    `;

    for (let i = 0; i < body.zones.length; i++) {
      const z = body.zones[i];
      await sql`
        INSERT INTO zones
          (id, event_id, name, type, color, x, y, w, h,
           capacity, price, rows, cols, queue_prefix, sort_order)
        VALUES
          (${z.id}, ${body.id}, ${z.name}, ${z.type}, ${z.color},
           ${z.x}, ${z.y}, ${z.w}, ${z.h}, ${z.capacity}, ${z.price},
           ${z.rows ?? null}, ${z.cols ?? null}, ${z.queuePrefix ?? null}, ${i})
      `;
    }

    const [event] = await sql`
      SELECT e.*,
        COALESCE(json_agg(z ORDER BY z.sort_order) FILTER (WHERE z.id IS NOT NULL), '[]') AS zones
      FROM events e LEFT JOIN zones z ON z.event_id = e.id
      WHERE e.id = ${body.id}
      GROUP BY e.id
    `;
    return Response.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

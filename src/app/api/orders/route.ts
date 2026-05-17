import { sql, ensureTables } from "@/lib/db";

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`
      SELECT o.*, e.title_vi AS event_title
      FROM orders o
      LEFT JOIN events e ON e.id = o.event_id
      ORDER BY o.created_at DESC
      LIMIT 200
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json() as {
      eventId: string;
      buyer: string;
      email: string;
      phone?: string;
      areaName: string;
      qty: number;
      total: number;
      items: unknown[];
    };

    const id = `HT-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

    await sql`
      INSERT INTO orders (id, event_id, buyer, email, phone, area_name, qty, total, items)
      VALUES (
        ${id}, ${body.eventId}, ${body.buyer}, ${body.email},
        ${body.phone ?? ""}, ${body.areaName}, ${body.qty}, ${body.total},
        ${JSON.stringify(body.items)}
      )
    `;

    // Update event sold + revenue counters atomically
    await sql`
      UPDATE events
      SET sold = sold + ${body.qty}, revenue = revenue + ${body.total}
      WHERE id = ${body.eventId}
    `;

    return Response.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export type Event = {
  id: string;
  title: string;
  titleVi: string;
  artist: string;
  date: string;
  dateEn: string;
  time: string;
  venue: string;
  venueEn: string;
  city: string;
  cover: string;
  cover2: string;
  badges: string[];
  minPrice: number;
  maxPrice: number;
  soldRatio: number;
  description?: string;
  descriptionEn?: string;
};

export type Area = {
  id: string;
  name: string;
  nameVi: string;
  type: "seating" | "standing" | "wheelchair";
  price: number;
  capacity: number;
  sold: number;
  held: number;
  color: string;
  maxPerOrder: number;
  queuePrefix?: string;
  perks?: string[];
  soldOut?: boolean;
  allowsCompanion?: boolean;
  rows?: number;
  cols?: number;
};

export type Seat = {
  id: string;
  row?: string;
  col?: number;
  status: "available" | "sold" | "held" | "locked";
  price: number;
  type?: "aisle";
};

export type TicketItem = {
  id: string;
  label: string;
  price: number;
  standing?: boolean;
};

export const DEMO_EVENTS: Event[] = [
  {
    id: "starlight-2026",
    title: "Starlight Bloom Festival",
    titleVi: "Đêm nhạc Starlight Bloom",
    artist: "Mây Trắng · Cá Hồi Hoang · Vũ.",
    date: "Thứ 7, 15.08.2026",
    dateEn: "Sat 15 Aug 2026",
    time: "19:00 — 23:00",
    venue: "SVĐ Hoa Lư",
    venueEn: "Hoa Lu Stadium",
    city: "TP. Hồ Chí Minh",
    cover: "#FF8FA8",
    cover2: "#C4B5FB",
    badges: ["concert", "mixed"],
    minPrice: 700000,
    maxPrice: 2500000,
    soldRatio: 0.62,
    description: "Một đêm hè dưới những bóng đèn pastel, nơi bạn được hát to cùng những bản nhạc indie yêu thích nhất.",
    descriptionEn: "A summer night under pastel lights — sing along to your favourite indie tracks.",
  },
  {
    id: "boba-workshop",
    title: "Boba Brewing 101",
    titleVi: "Workshop pha trà sữa",
    artist: "với Chị Bơ Sữa",
    date: "Chủ nhật, 24.08.2026",
    dateEn: "Sun 24 Aug 2026",
    time: "14:00 — 17:00",
    venue: "BoboTeahouse",
    venueEn: "Bobo Teahouse",
    city: "Hà Nội",
    cover: "#9EE6CF",
    cover2: "#FFD56B",
    badges: ["workshop", "seated"],
    minPrice: 350000,
    maxPrice: 550000,
    soldRatio: 0.4,
    description: "Workshop pha chế trà sữa cùng Chị Bơ Sữa nổi tiếng.",
    descriptionEn: "A bubble tea brewing workshop with the famous Chị Bơ Sữa.",
  },
  {
    id: "pixel-fest",
    title: "Pixel & Pop Festival",
    titleVi: "Lễ hội Pixel & Pop",
    artist: "Indie game · K-Pop covers · Art market",
    date: "Thứ 6 — CN, 12—14.09.2026",
    dateEn: "Fri—Sun 12—14 Sep 2026",
    time: "10:00 — 22:00",
    venue: "Công viên Lê Văn Tám",
    venueEn: "Le Van Tam Park",
    city: "TP. Hồ Chí Minh",
    cover: "#C4B5FB",
    cover2: "#B8D9FF",
    badges: ["festival", "standing"],
    minPrice: 450000,
    maxPrice: 1200000,
    soldRatio: 0.85,
    description: "Lễ hội nghệ thuật, game indie và K-Pop covers lớn nhất năm.",
    descriptionEn: "The biggest indie art, game, and K-Pop festival of the year.",
  },
];

export const STARLIGHT_AREAS: Area[] = [
  {
    id: "vip-a",
    name: "VIP Front Stage",
    nameVi: "Khu VIP gần sân khấu",
    type: "seating",
    price: 2500000,
    capacity: 200,
    sold: 142,
    held: 6,
    color: "#FF8FA8",
    maxPerOrder: 2,
    perks: ["Soundcheck party", "Standby tea", "Goodie bag"],
  },
  {
    id: "std-a",
    name: "Standard Seating",
    nameVi: "Ghế tiêu chuẩn",
    type: "seating",
    price: 1500000,
    capacity: 800,
    sold: 420,
    held: 18,
    color: "#C4B5FB",
    maxPerOrder: 4,
    perks: ["Goodie bag"],
  },
  {
    id: "bal-a",
    name: "Balcony",
    nameVi: "Tầng ban công",
    type: "seating",
    price: 950000,
    capacity: 400,
    sold: 280,
    held: 4,
    color: "#B8D9FF",
    maxPerOrder: 4,
    perks: [],
  },
  {
    id: "stand-a",
    name: "Standing Zone A",
    nameVi: "Khu đứng A",
    type: "standing",
    price: 900000,
    capacity: 1000,
    sold: 720,
    held: 12,
    color: "#FFD56B",
    maxPerOrder: 4,
    queuePrefix: "A",
    perks: ["Closer to stage"],
  },
  {
    id: "stand-b",
    name: "Standing Zone B",
    nameVi: "Khu đứng B",
    type: "standing",
    price: 700000,
    capacity: 1500,
    sold: 980,
    held: 24,
    color: "#9EE6CF",
    maxPerOrder: 6,
    queuePrefix: "B",
    perks: [],
  },
  {
    id: "fan-zone",
    name: "Fan Zone",
    nameVi: "Khu fan club",
    type: "standing",
    price: 500000,
    capacity: 600,
    sold: 600,
    held: 0,
    color: "#FFAB91",
    maxPerOrder: 4,
    queuePrefix: "F",
    soldOut: true,
  },
  {
    id: "wc",
    name: "Wheelchair Zone",
    nameVi: "Khu xe lăn",
    type: "wheelchair",
    price: 900000,
    capacity: 20,
    sold: 8,
    held: 1,
    color: "#5A8FD8",
    maxPerOrder: 1,
    allowsCompanion: true,
  },
];

export function getAreasForEvent(eventId: string): Area[] {
  // TODO: GET /events/:id/areas
  return STARLIGHT_AREAS;
}

export function getEventById(eventId: string): Event | undefined {
  return DEMO_EVENTS.find(e => e.id === eventId);
}

export function generateSeats(area: Area) {
  const rows = area.rows ?? (area.id === "vip-a" ? 10 : area.id === "std-a" ? 16 : 10);
  const cols = area.cols ?? 20;
  const rowLabels = "ABCDEFGHIJKLMNOPQRST".split("");
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (r * 31 + c * 7 + (area.id.charCodeAt(0) || 0)) % 100;
      let status: Seat["status"] = "available";
      if (seed < 28) status = "sold";
      else if (seed < 33) status = "held";
      else if (seed < 36) status = "locked";
      if (c === 9 || c === 10) {
        seats.push({ id: `${rowLabels[r]}-aisle-${c}`, type: "aisle", status: "available", price: 0 });
        continue;
      }
      seats.push({
        id: `${rowLabels[r]}${String(c + 1).padStart(2, "0")}`,
        row: rowLabels[r],
        col: c + 1,
        status,
        price: area.price + (r < 2 ? 200000 : (r >= rows - 2 ? -100000 : 0)),
      });
    }
  }
  return { rows, cols: cols + 2, seats };
}

export function fmtVND(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1).replace(/\.0$/, "") + " tr";
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return String(n);
}

export function fmtVNDFull(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

/* Admin data */
export type AdminEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  cover: string;
  cover2: string;
  status: "open" | "draft" | "soldout" | "closed";
  capacity: number;
  sold: number;
  held: number;
  revenue: number;
};

export type AdminOrder = {
  id: string;
  buyer: string;
  email: string;
  event: string;
  area: string;
  qty: number;
  total: number;
  status: "paid" | "held" | "expired" | "failed" | "refunded";
  time: string;
};

export const ADMIN_EVENTS: AdminEvent[] = [
  { id: "starlight-2026", title: "Starlight Bloom Festival", date: "15.08.2026", venue: "SVĐ Hoa Lư · TP.HCM", cover: "#FF8FA8", cover2: "#C4B5FB", status: "open", capacity: 4500, sold: 2832, held: 65, revenue: 4192800000 },
  { id: "boba-workshop", title: "Boba Brewing 101", date: "24.08.2026", venue: "BoboTeahouse · Hà Nội", cover: "#9EE6CF", cover2: "#FFD56B", status: "open", capacity: 80, sold: 32, held: 4, revenue: 14400000 },
  { id: "pixel-fest", title: "Pixel & Pop Festival", date: "12—14.09.2026", venue: "CV Lê Văn Tám · TP.HCM", cover: "#C4B5FB", cover2: "#B8D9FF", status: "open", capacity: 12000, sold: 10250, held: 120, revenue: 8200000000 },
  { id: "indie-night", title: "Indie Night Vol. 4", date: "29.09.2026", venue: "Quán Bồ Câu · TP.HCM", cover: "#FFAB91", cover2: "#FFD56B", status: "draft", capacity: 200, sold: 0, held: 0, revenue: 0 },
  { id: "lullaby-tour", title: "Lullaby Tour: HN", date: "12.07.2026", venue: "Nhà hát Lớn · Hà Nội", cover: "#C4B5FB", cover2: "#FF8FA8", status: "soldout", capacity: 800, sold: 800, held: 0, revenue: 1200000000 },
  { id: "tet-show-2026", title: "Đêm nhạc Tết 2026", date: "02.02.2026", venue: "Nhà hát Hoà Bình", cover: "#FFD56B", cover2: "#FFAB91", status: "closed", capacity: 2000, sold: 1850, held: 0, revenue: 2775000000 },
];

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "HT-2026-008321", buyer: "Nguyễn Hoàng Mây", email: "may@gmail.com", event: "Starlight Bloom Festival", area: "VIP Front Stage", qty: 2, total: 5030000, status: "paid", time: "14:02 hôm nay" },
  { id: "HT-2026-008320", buyer: "Trần Văn Hùng", email: "hung.tran@gmail.com", event: "Starlight Bloom Festival", area: "Standing Zone A", qty: 4, total: 3630000, status: "paid", time: "13:58 hôm nay" },
  { id: "HT-2026-008319", buyer: "Lê Bảo Châu", email: "chaule@yahoo.com", event: "Pixel & Pop Festival", area: "3-Day Pass", qty: 2, total: 2400000, status: "held", time: "13:55 hôm nay" },
  { id: "HT-2026-008318", buyer: "Phạm Anh Thư", email: "anhthu@hticket", event: "Boba Brewing 101", area: "Workshop seat", qty: 1, total: 450000, status: "paid", time: "13:42 hôm nay" },
  { id: "HT-2026-008317", buyer: "Đỗ Nhật Linh", email: "linh@studio", event: "Starlight Bloom Festival", area: "Standard Seating", qty: 4, total: 6030000, status: "paid", time: "12:30 hôm nay" },
  { id: "HT-2026-008316", buyer: "Vũ Hà My", email: "hamyvu@gmail.com", event: "Starlight Bloom Festival", area: "Balcony", qty: 2, total: 1930000, status: "expired", time: "11:18 hôm nay" },
  { id: "HT-2026-008315", buyer: "Bùi Quốc Bảo", email: "qbao@me.com", event: "Indie Night Vol. 4", area: "Standing", qty: 6, total: 1830000, status: "failed", time: "11:02 hôm nay" },
  { id: "HT-2026-008314", buyer: "Nguyễn Minh Đăng", email: "dang.nm@gmail.com", event: "Pixel & Pop Festival", area: "Day 2 Pass", qty: 2, total: 1230000, status: "paid", time: "10:46 hôm nay" },
  { id: "HT-2026-008313", buyer: "Hoàng Thị Lan", email: "lanht@me.com", event: "Starlight Bloom Festival", area: "Wheelchair Zone", qty: 1, total: 930000, status: "refunded", time: "Hôm qua" },
];

// backend/src/lib/notificationService.ts
// Fix: hapus import NotificationCategory dari @prisma/client
//      gunakan string literal type manual — aman sebelum/sesudah generate
// ─────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NotifCategory = "pesanan" | "keuangan" | "sistem" | "pengguna" | "broadcast";

interface CreateNotifInput {
  title: string;
  description: string;
  category: NotifCategory;
  userId?: number | null;
  orderId?: number | null;
}

async function create(input: CreateNotifInput) {
  return prisma.notification.create({
    data: {
      title:       input.title,
      description: input.description,
      category:    input.category,
      userId:      input.userId   ?? null,
      orderId:     input.orderId  ?? null,
    },
  });
}

// ─────────────────────────────────────────────────────────────────
// PESANAN
// ─────────────────────────────────────────────────────────────────

export async function notifyNewOrder(params: {
  orderId: number;
  customerName: string;
  productName: string;
  totalPrice: number;
  userId: number;
}) {
  const rp = formatRp(params.totalPrice);
  await create({
    title:       "Pesanan Baru Masuk",
    description: `${params.customerName} memesan ${params.productName} dengan total belanja ${rp}.`,
    category:    "pesanan",
    orderId:     params.orderId,
  });
  await create({
    title:       "Pesanan Berhasil Dibuat",
    description: `Pesanan #ORD-${pad(params.orderId)} telah kami terima. Silakan lakukan pembayaran untuk melanjutkan proses cetak.`,
    category:    "pesanan",
    userId:      params.userId,
    orderId:     params.orderId,
  });
}

export async function notifyOrderStatusChange(params: {
  orderId: number;
  userId: number;
  customerName: string;
  newStatus: "processing" | "completed" | "cancelled";
  reason?: string;
}) {
  const label = `#ORD-${pad(params.orderId)}`;

  if (params.newStatus === "processing") {
    await create({
      title:       "Pesanan Sedang Diproses",
      description: `Pesanan ${label} Anda sedang dalam proses produksi. Kami akan memberitahu Anda saat selesai.`,
      category:    "pesanan",
      userId:      params.userId,
      orderId:     params.orderId,
    });
  }

  if (params.newStatus === "completed") {
    await create({
      title:       `Pesanan ${label} Selesai`,
      description: `Pesanan milik ${params.customerName} telah selesai dan siap untuk dikirim/diambil.`,
      category:    "pesanan",
      orderId:     params.orderId,
    });
    await create({
      title:       "Pesanan Anda Selesai! 🎉",
      description: `Pesanan ${label} telah selesai diproduksi dan siap untuk dikirim atau diambil.`,
      category:    "pesanan",
      userId:      params.userId,
      orderId:     params.orderId,
    });
  }

  if (params.newStatus === "cancelled") {
    const reasonText = params.reason ? ` Alasan: ${params.reason}.` : "";
    await create({
      title:       `Pesanan ${label} Dibatalkan`,
      description: `Pesanan milik ${params.customerName} dibatalkan.${reasonText}`,
      category:    "pesanan",
      orderId:     params.orderId,
    });
    await create({
      title:       "Pesanan Dibatalkan",
      description: `Pesanan ${label} telah dibatalkan.${reasonText} Hubungi kami jika ada pertanyaan.`,
      category:    "pesanan",
      userId:      params.userId,
      orderId:     params.orderId,
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// PEMBAYARAN
// ─────────────────────────────────────────────────────────────────

export async function notifyPaymentConfirmed(params: {
  orderId: number;
  userId: number;
  totalPrice: number;
  method?: string;
}) {
  const label      = `#ORD-${pad(params.orderId)}`;
  const methodText = params.method ? ` via ${params.method}` : "";
  const rp         = formatRp(params.totalPrice);

  await create({
    title:       "Pembayaran Dikonfirmasi",
    description: `Pembayaran untuk pesanan ${label} sebesar ${rp} telah dikonfirmasi${methodText}.`,
    category:    "keuangan",
    orderId:     params.orderId,
  });
  await create({
    title:       "Pembayaran Berhasil ✅",
    description: `Pembayaran ${rp}${methodText} untuk pesanan ${label} telah kami terima. Pesanan segera diproses.`,
    category:    "keuangan",
    userId:      params.userId,
    orderId:     params.orderId,
  });
}

export async function notifyPaymentRejected(params: {
  orderId: number;
  userId: number;
  reason?: string;
}) {
  const label      = `#ORD-${pad(params.orderId)}`;
  const reasonText = params.reason ? ` (${params.reason})` : "";

  await create({
    title:       "Pembayaran Ditolak",
    description: `Pembayaran untuk pesanan ${label} ditolak${reasonText}. Silakan lakukan pembayaran ulang atau hubungi kami.`,
    category:    "keuangan",
    userId:      params.userId,
    orderId:     params.orderId,
  });
}

// ─────────────────────────────────────────────────────────────────
// SISTEM
// ─────────────────────────────────────────────────────────────────

export async function notifyLowStock(params: {
  materialName: string;
  stock: number;
  unit: string;
}) {
  await create({
    title:       "Stok Bahan Cetak Menipis",
    description: `${params.materialName} tersisa ${params.stock} ${params.unit}. Segera lakukan restock.`,
    category:    "sistem",
  });
}

export async function notifyBackupSuccess(filename: string) {
  await create({
    title:       "Backup Database Sukses",
    description: `Sistem berhasil melakukan backup otomatis: ${filename}.`,
    category:    "sistem",
  });
}

export async function notifyBackupFailed(error: string) {
  await create({
    title:       "Backup Database Gagal",
    description: `Backup otomatis gagal: ${error}. Harap periksa konfigurasi backup.`,
    category:    "sistem",
  });
}

// ─────────────────────────────────────────────────────────────────
// PENGGUNA
// ─────────────────────────────────────────────────────────────────

export async function notifyNewUser(params: { fullName: string; email: string }) {
  await create({
    title:       "Pendaftaran Pengguna Baru",
    description: `Customer baru bernama ${params.fullName} (${params.email}) telah terdaftar.`,
    category:    "pengguna",
  });
}

// ─────────────────────────────────────────────────────────────────
// BROADCAST
// ─────────────────────────────────────────────────────────────────

export async function broadcastToAllCustomers(params: { title: string; description: string }) {
  const customers = await prisma.user.findMany({
    where:  { role: "customer", status: "active" },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: customers.map(c => ({
      title:       params.title,
      description: params.description,
      category:    "broadcast" as NotifCategory,
      userId:      c.id,
    })),
  });
}

export async function broadcastToUser(params: {
  userId: number;
  title: string;
  description: string;
}) {
  await create({
    title:       params.title,
    description: params.description,
    category:    "broadcast",
    userId:      params.userId,
  });
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function pad(id: number) {
  return String(id).padStart(4, "0");
}
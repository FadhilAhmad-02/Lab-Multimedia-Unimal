// prisma/seed-settings.ts
// Jalankan: npx ts-node prisma/seed-settings.ts
// (atau tambahkan ke prisma/seed.ts yang sudah ada)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const defaultSettings = [
        // --- General / Info Toko ---
        { key: "store_name",      value: "Malikussaleh Advertising",                      group: "general" },
        { key: "store_tagline",   value: "Percetakan Premium Universitas Malikussaleh",   group: "general" },
        { key: "store_email",     value: "malikussaleh.adv@unimal.ac.id",                 group: "general" },
        { key: "store_whatsapp",  value: "081234567890",                                  group: "general" },
        { key: "store_address",   value: "Kampus Bukit Indah, Lhokseumawe, Aceh",         group: "general" },
        { key: "store_logo",      value: "",                                               group: "general" },

        // --- System ---
        { key: "maintenance_mode",    value: "false",                                                             group: "system" },
        { key: "maintenance_message", value: "Website sedang dalam pemeliharaan. Kami akan segera kembali.",      group: "system" },
        { key: "last_backup_at",      value: "",                                                                  group: "system" },

        // --- Payment ---
        { key: "midtrans_server_key", value: "", group: "payment" },
        { key: "midtrans_client_key", value: "", group: "payment" },
        { key: "midtrans_is_production", value: "false", group: "payment" },
    ];

    for (const s of defaultSettings) {
        await prisma.setting.upsert({
        where: { key: s.key },
        update: {},         // jangan timpa nilai yang sudah ada
        create: s,
        });
    }

    // Default static pages
    const staticPages = [
        { slug: "tentang-kami",       title: "Tentang Kami",       content: "<p>Isi halaman tentang kami.</p>" },
        { slug: "faq",                title: "FAQ",                 content: "<p>Pertanyaan yang sering ditanyakan.</p>" },
        { slug: "syarat-ketentuan",   title: "Syarat & Ketentuan", content: "<p>Syarat dan ketentuan penggunaan layanan.</p>" },
        { slug: "kebijakan-privasi",  title: "Kebijakan Privasi",  content: "<p>Kebijakan privasi kami.</p>" },
    ];

    for (const p of staticPages) {
        await prisma.staticPage.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
        });
    }

    console.log("✅ Seed pengaturan selesai");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
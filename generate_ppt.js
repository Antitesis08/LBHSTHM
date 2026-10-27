import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs";

// Initialize Presentation
const pres = new pptxgen();

// Layout 16:9 Widescreen (13.333 x 7.5 inches)
pres.defineLayout({ name: "INFOCUS_16_9", width: 13.333, height: 7.5 });
pres.layout = "INFOCUS_16_9";

// High-Contrast Light Color Palette (Optimized for Infokus/Projector)
const C = {
  bgLight: "FFFFFF",      // Pure White background for maximum infokus brightness
  bgCard: "F4F6F3",       // Light tactical gray-green card
  bgCardAlt: "EAEFE9",    // Slightly deeper contrast card
  armyGreen: "1B381E",    // Strong dark military green (Header & titles)
  gold: "B8860B",         // Dark Goldenrod / Military Gold
  goldLight: "D4AF37",    // Bright Gold
  borderDark: "334E35",   // Visible dark green border
  borderLight: "CBD5E1",  // Light border
  textDark: "0F172A",     // Deep dark black-slate for ultimate contrast
  textBody: "1E293B",     // Dark body text
  textMuted: "475569",    // Secondary dark slate text
  textWhite: "FFFFFF",    // Pure white for badges
  tagBg: "1B381E",        // Dark green pill background
  tagGold: "B8860B",      // Gold pill
};

const FONT_MAIN = "Arial";

// Image Paths
const BASE_DIR = "c:/sistem/LBHSTHM";
const IMG = {
  logo: `${BASE_DIR}/public/img/logo_LKBH-removebg-preview.png`,
  landing: `${BASE_DIR}/public/ss an/landing page.png`,
  portal: `${BASE_DIR}/public/ss an/portal LBH.png`,
  register: `${BASE_DIR}/public/ss an/register.png`,
  customer: `${BASE_DIR}/public/ss an/role customer.png`,
  konsultan: `${BASE_DIR}/public/ss an/role konsultan.png`,
  admin: `${BASE_DIR}/public/ss an/role admin.png`,
  paralegal: `${BASE_DIR}/public/ss an/role paralegal.png`,
  pengawas: `${BASE_DIR}/public/ss an/role pengawas.png`,
  sekertaris: `${BASE_DIR}/public/ss an/role sekertaris.png`,
  bendahara: `${BASE_DIR}/public/ss an/role bendahara.png`,
};

// Helper: Header for Standard Slide (High-contrast, Large Font)
function addSlideHeader(slide, title) {
  slide.background = { color: C.bgLight };

  // Top Military Green Band
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 1.15,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 }
  });

  // Gold accent bar below header
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 1.15,
    w: 13.333,
    h: 0.1,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 }
  });

  // Main Slide Title (Large, Bold, High Visibility on Infokus)
  slide.addText(title, {
    x: 0.8,
    y: 0.15,
    w: 10.5,
    h: 0.85,
    fontSize: 26,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  // Logo in Header (Top Right)
  if (fs.existsSync(IMG.logo)) {
    slide.addImage({
      path: IMG.logo,
      x: 12.0,
      y: 0.12,
      w: 0.95,
      h: 0.95
    });
  }

  // Footer bar
  slide.addShape(pres.ShapeType.line, {
    x: 0.8,
    y: 7.0,
    w: 11.733,
    h: 0,
    line: { color: C.borderDark, width: 1.5 }
  });

  slide.addText("LKBH STHM DITKUMAD • Platform Bantuan Hukum Digital Nasional", {
    x: 0.8,
    y: 7.05,
    w: 8.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN
  });
}

console.log("Generating LKBH STHM Infokus-Optimized Slides...");

// ==========================================
// SLIDE 1: COVER SLIDE
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  // Top & Bottom Military Bands
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 }
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0.3,
    w: 13.333,
    h: 0.1,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 }
  });

  // Large Logo
  if (fs.existsSync(IMG.logo)) {
    s.addImage({
      path: IMG.logo,
      x: 5.666,
      y: 0.8,
      w: 2.0,
      h: 2.0
    });
  }

  // Institution Banner (Official LKBH STHM)
  s.addShape(pres.ShapeType.roundRect, {
    x: 2.4,
    y: 2.95,
    w: 8.533,
    h: 0.55,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 },
    rectRadius: 0.1
  });
  s.addText("LEMBAGA KONSULTASI DAN BANTUAN HUKUM STHM (LKBH STHM)", {
    x: 2.4,
    y: 2.95,
    w: 8.533,
    h: 0.55,
    fontSize: 14.5,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Main Title (Extra Large for Infokus)
  s.addText("DIGITALISASI LAYANAN LKBH STHM", {
    x: 0.8,
    y: 3.65,
    w: 11.733,
    h: 0.9,
    fontSize: 34,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Subtitle
  s.addText("Transformasi Layanan Bantuan Hukum Terpadu Menjangkau Seluruh Wilayah Indonesia", {
    x: 1.0,
    y: 4.55,
    w: 11.333,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });

  // Team Box (High-Contrast, Big Text)
  s.addShape(pres.ShapeType.roundRect, {
    x: 1.2,
    y: 5.25,
    w: 10.933,
    h: 1.6,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  s.addText("TIM PENGEMBANG:", {
    x: 1.2,
    y: 5.35,
    w: 10.933,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center"
  });

  const team = [
    { name: "Sayyid Ashhabussunan", role: "Project Manager" },
    { name: "Sulthan Dhiyaul Barts H.", role: "Business Analyst" },
    { name: "Aditya Maulana Ardiansyah", role: "Backend Developer" },
    { name: "Muhammad Roihan", role: "UI/UX Designer" }
  ];

  const colW = 10.933 / 4;
  team.forEach((m, idx) => {
    s.addText([
      { text: m.name + "\n", options: { bold: true, fontSize: 13, color: C.textDark } },
      { text: m.role, options: { bold: true, fontSize: 11, color: C.gold } }
    ], {
      x: 1.2 + idx * colW,
      y: 5.75,
      w: colW,
      h: 0.95,
      align: "center",
      valign: "middle"
    });
  });
}

// ==========================================
// SLIDE 2: PROFIL TIM PENGEMBANG
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "TIM PENGEMBANG SISTEM");

  const teamMembers = [
    {
      name: "Sayyid Ashhabussunan",
      role: "Project Manager",
      tasks: [
        "Memimpin koordinasi dan perencanaan proyek",
        "Pengawasan timeline, target, dan rilis sistem",
        "Penghubung utama pengembang dengan pihak STHM"
      ]
    },
    {
      name: "Sulthan Dhiyaul Barts H.",
      role: "Business Analyst",
      tasks: [
        "Analisis proses bisnis bantuan hukum STHM",
        "Perumusan kebutuhan fitur dan alur 7 role pengguna",
        "Menyusun spesifikasi fungsional sistem"
      ]
    },
    {
      name: "Aditya Maulana Ardiansyah",
      role: "Backend Developer",
      tasks: [
        "Membangun arsitektur server, REST API, dan database",
        "Implementasi PostgreSQL, Prisma ORM, & Custom JWT",
        "Proteksi keamanan dan hak akses 3 lapis"
      ]
    },
    {
      name: "Muhammad Roihan",
      role: "UI/UX Designer",
      tasks: [
        "Perancangan antarmuka bertema hukum militer",
        "Desain navigasi responsif (Top Navbar)",
        "Prototyping tampilan dashboard untuk seluruh role"
      ]
    }
  ];

  // 4 Big Column Cards
  const cardW = 2.75;
  const startX = 0.8;
  const gap = 0.24;

  teamMembers.forEach((m, i) => {
    const curX = startX + i * (cardW + gap);
    const curY = 1.6;

    // Card background
    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: curY,
      w: cardW,
      h: 5.1,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.1
    });

    // Role Header Bar inside Card
    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.15,
      y: curY + 0.2,
      w: cardW - 0.3,
      h: 0.5,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.08
    });
    s.addText(m.role.toUpperCase(), {
      x: curX + 0.15,
      y: curY + 0.2,
      w: cardW - 0.3,
      h: 0.5,
      fontSize: 12,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Name
    s.addText(m.name, {
      x: curX + 0.1,
      y: curY + 0.8,
      w: cardW - 0.2,
      h: 0.75,
      fontSize: 14,
      bold: true,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Divider
    s.addShape(pres.ShapeType.line, {
      x: curX + 0.2,
      y: curY + 1.65,
      w: cardW - 0.4,
      h: 0,
      line: { color: C.gold, width: 2 }
    });

    // Tasks (Large, high visibility text)
    const taskText = m.tasks.map(t => `• ${t}`).join("\n\n");
    s.addText(taskText, {
      x: curX + 0.15,
      y: curY + 1.85,
      w: cardW - 0.3,
      h: 3.0,
      fontSize: 11.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });
}

// ==========================================
// SLIDE 3: MENGAPA DIGITALISASI PENTING? (DILENGKAPI PERADILAN MILITER)
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "URGENSI DIGITALISASI LKBH STHM");

  // Big Highlight Callout: LKBH STHM Hanya 1 di Indonesia
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 11.733,
    h: 1.45,
    fill: { color: "FFF5F5" },
    line: { color: "C53030", width: 2.5 },
    rectRadius: 0.1
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 1.65,
    w: 2.2,
    h: 0.4,
    fill: { color: "C53030" },
    line: { color: "C53030", width: 0 },
    rectRadius: 0.08
  });
  s.addText("FAKTA UTAMA", {
    x: 1.1,
    y: 1.65,
    w: 2.2,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText("LKBH STHM HANYA ADA 1 DI INDONESIA (BERKEDUDUKAN DI JAKARTA)", {
    x: 3.5,
    y: 1.65,
    w: 8.7,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: "9B2C2C",
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  s.addText("Sementara prajurit TNI, purnawirawan, keluarga besar TNI, dan masyarakat pencari keadilan tersebar di 38 provinsi di seluruh Indonesia.", {
    x: 1.1,
    y: 2.15,
    w: 11.1,
    h: 0.6,
    fontSize: 13.5,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN
  });

  // 3 Wide Cards (Very Large Text, High Contrast)
  const urgencyPoints = [
    {
      title: "Jangkauan Seluruh Indonesia",
      desc: "Menghapus kendala jarak fisik. Prajurit di pos perbatasan, daerah operasi, dan pulau terluar kini bisa berkonsultasi hukum langsung secara online tanpa harus datang ke Jakarta."
    },
    {
      title: "Pelayanan 4 Lingkup Peradilan",
      desc: "Kekhususan hukum militer: melayani perkara di Peradilan Militer (Pidana & Tata Usaha Militer), Peradilan Umum (Pidana/Perdata), PTUN, dan Peradilan Agama."
    },
    {
      title: "Bantuan Pro Bono & Berkas Dossier",
      desc: "Verifikasi syarat digital (KTP & SKTM) secara transparan. Seluruh berkas perkara tersimpan aman dalam arsip digital (Dossier) yang terenkripsi dan terlindungi."
    }
  ];

  const colW = 3.75;
  const gap = 0.24;

  urgencyPoints.forEach((p, idx) => {
    const curX = 0.8 + idx * (colW + gap);
    const curY = 3.15;

    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: curY,
      w: colW,
      h: 3.65,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.1
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.2,
      y: curY + 0.22,
      w: colW - 0.4,
      h: 0.65,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.08
    });

    s.addText(p.title, {
      x: curX + 0.2,
      y: curY + 0.22,
      w: colW - 0.4,
      h: 0.65,
      fontSize: 12.5,
      bold: true,
      color: C.textWhite,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    s.addText(p.desc, {
      x: curX + 0.25,
      y: curY + 1.05,
      w: colW - 0.5,
      h: 2.3,
      fontSize: 12.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });
}

// ==========================================
// SLIDE 4: DIAGRAM ALUR PROSES KASUS (7 TAHAPAN LENGKAP DENGAN LPPM & 4 PERADILAN)
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "ALUR PROSES PENANGANAN KASUS (7 TAHAPAN)");

  const stepsRow1 = [
    {
      num: "01",
      actor: "KLIEN",
      title: "Pengajuan Kasus",
      desc: "Klien mengisi form online dan mengunggah dokumen bukti perkara / SKTM."
    },
    {
      num: "02",
      actor: "SEKRETARIS",
      title: "Verifikasi Berkas",
      desc: "Pemeriksaan keabsahan dokumen dan registrasi berkas di buku induk."
    },
    {
      num: "03",
      actor: "TIM LKBH",
      title: "Gelar Kasus",
      desc: "Bedah perkara, analisis yuridis, dan perumusan pokok permasalahan."
    },
    {
      num: "04",
      actor: "KETUA STHM",
      title: "Penerbitan Legal Opinion",
      desc: "Pengkajian pimpinan dan penerbitan Legal Opinion resmi STHM."
    }
  ];

  const stepsRow2 = [
    {
      num: "05",
      actor: "KEPALA LKBH",
      title: "Penugasan Tim",
      desc: "Penerbitan Surat Perintah Tugas dan Surat Kuasa Khusus advokat."
    },
    {
      num: "06",
      actor: "LITIGASI & NON-LITIGASI",
      title: "Penanganan Hukum",
      desc: "Litigasi (Peradilan Militer, Umum, PTUN, Agama) & Non-Litigasi (Mediasi/LO)."
    },
    {
      num: "07",
      actor: "LKBH & LPPM",
      title: "Penyelesaian & Arsip LPPM",
      desc: "Penyerahan hasil advokasi, pengarsipan dossier inkracht, & sinkronisasi LPPM."
    }
  ];

  // ROW 1: 4 Cards
  const r1W = 2.75;
  const r1Gap = 0.24;
  const r1Y = 1.48;
  const r1H = 2.35;

  stepsRow1.forEach((st, idx) => {
    const curX = 0.8 + idx * (r1W + r1Gap);

    // Card Box
    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: r1Y,
      w: r1W,
      h: r1H,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    // Top Header: Number Box (Left) + Role Box (Right) Side-by-Side (No Wasted Space)
    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.12,
      y: r1Y + 0.12,
      w: 0.5,
      h: 0.38,
      fill: { color: C.gold },
      line: { color: C.gold, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.num, {
      x: curX + 0.12,
      y: r1Y + 0.12,
      w: 0.5,
      h: 0.38,
      fontSize: 12.5,
      bold: true,
      color: C.textWhite,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.67,
      y: r1Y + 0.12,
      w: r1W - 0.79,
      h: 0.38,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.actor, {
      x: curX + 0.67,
      y: r1Y + 0.12,
      w: r1W - 0.79,
      h: 0.38,
      fontSize: 9.5,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Title
    s.addText(st.title, {
      x: curX + 0.1,
      y: r1Y + 0.55,
      w: r1W - 0.2,
      h: 0.5,
      fontSize: 12.5,
      bold: true,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Divider
    s.addShape(pres.ShapeType.line, {
      x: curX + 0.2,
      y: r1Y + 1.1,
      w: r1W - 0.4,
      h: 0,
      line: { color: C.borderLight, width: 1.5 }
    });

    // Description
    s.addText(st.desc, {
      x: curX + 0.15,
      y: r1Y + 1.18,
      w: r1W - 0.3,
      h: 1.05,
      fontSize: 10.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "top"
    });

    // Right Arrow
    if (idx < stepsRow1.length - 1) {
      s.addText("▶", {
        x: curX + r1W,
        y: r1Y + 0.85,
        w: r1Gap,
        h: 0.5,
        fontSize: 14,
        color: C.armyGreen,
        fontFace: FONT_MAIN,
        align: "center",
        valign: "middle"
      });
    }
  });

  // Down Arrow from Step 4 to Step 5
  s.addText("▼", {
    x: 12.0,
    y: 3.82,
    w: 0.5,
    h: 0.25,
    fontSize: 12,
    color: C.gold,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // ROW 2: 3 Cards
  const r2W = 3.75;
  const r2Gap = 0.24;
  const r2Y = 4.05;
  const r2H = 2.35;

  stepsRow2.forEach((st, idx) => {
    const curX = 0.8 + idx * (r2W + r2Gap);

    // Card Box
    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: r2Y,
      w: r2W,
      h: r2H,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    // Top Header: Number Box (Left) + Role Box (Right) Side-by-Side
    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.15,
      y: r2Y + 0.12,
      w: 0.55,
      h: 0.38,
      fill: { color: C.gold },
      line: { color: C.gold, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.num, {
      x: curX + 0.15,
      y: r2Y + 0.12,
      w: 0.55,
      h: 0.38,
      fontSize: 13,
      bold: true,
      color: C.textWhite,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.75,
      y: r2Y + 0.12,
      w: r2W - 0.9,
      h: 0.38,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.actor, {
      x: curX + 0.75,
      y: r2Y + 0.12,
      w: r2W - 0.9,
      h: 0.38,
      fontSize: 10,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Title
    s.addText(st.title, {
      x: curX + 0.15,
      y: r2Y + 0.55,
      w: r2W - 0.3,
      h: 0.5,
      fontSize: 13,
      bold: true,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Divider
    s.addShape(pres.ShapeType.line, {
      x: curX + 0.25,
      y: r2Y + 1.1,
      w: r2W - 0.5,
      h: 0,
      line: { color: C.borderLight, width: 1.5 }
    });

    // Description
    s.addText(st.desc, {
      x: curX + 0.2,
      y: r2Y + 1.18,
      w: r2W - 0.4,
      h: 1.05,
      fontSize: 10.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "top"
    });

    // Right Arrow
    if (idx < stepsRow2.length - 1) {
      s.addText("▶", {
        x: curX + r2W,
        y: r2Y + 0.85,
        w: r2Gap,
        h: 0.5,
        fontSize: 14,
        color: C.armyGreen,
        fontFace: FONT_MAIN,
        align: "center",
        valign: "middle"
      });
    }
  });

  // Bottom Status Stepper Reference
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 6.55,
    w: 11.733,
    h: 0.45,
    fill: { color: C.bgCardAlt },
    line: { color: C.armyGreen, width: 1.5 },
    rectRadius: 0.06
  });

  s.addText("PENGAJUAN  ➔  VERIFIKASI  ➔  GELAR KASUS  ➔  LEGAL OPINION  ➔  PENUGASAN  ➔  PENANGANAN  ➔  SELESAI & LPPM", {
    x: 0.8,
    y: 6.55,
    w: 11.733,
    h: 0.45,
    fontSize: 11,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });
}

// ==========================================
// SLIDE 5: TEKNOLOGI YANG DIGUNAKAN
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "TEKNOLOGI YANG DIGUNAKAN");

  const techs = [
    { name: "Node.js & Next.js", desc: "Framework aplikasi web utama dan runtime server performa tinggi." },
    { name: "React.js", desc: "Pembangunan antarmuka pengguna interaktif dan responsif." },
    { name: "Kotlin", desc: "Pengembangan native aplikasi Android untuk kemudahan akses mobile." },
    { name: "PostgreSQL & Prisma", desc: "Database relasional yang aman untuk menyimpan seluruh data perkara." },
    { name: "REST API", desc: "Standar komunikasi data yang menghubungkan web, mobile, dan server." },
    { name: "Laragon", desc: "Lingkungan pengembangan lokal yang stabil dan cepat." },
    { name: "Docker & NGINX", desc: "Kontainerisasi aplikasi dan reverse proxy untuk performa server." },
    { name: "Cloudflare & MFA", desc: "Keamanan jaringan anti-DDoS dan proteksi login ganda (MFA)." }
  ];

  // 2 Columns x 4 Rows of Big Clear Cards
  const tW = 5.74;
  const tH = 1.15;
  const gapX = 0.25;
  const gapY = 0.15;

  techs.forEach((t, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);

    const curX = 0.8 + col * (tW + gapX);
    const curY = 1.6 + row * (tH + gapY);

    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: curY,
      w: tW,
      h: tH,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    // Tech Name Pill
    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.2,
      y: curY + 0.2,
      w: 2.2,
      h: 0.45,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(t.name, {
      x: curX + 0.2,
      y: curY + 0.2,
      w: 2.2,
      h: 0.45,
      fontSize: 11,
      bold: true,
      color: C.textWhite,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Description (Big & clear)
    s.addText(t.desc, {
      x: curX + 2.55,
      y: curY + 0.15,
      w: tW - 2.75,
      h: 0.85,
      fontSize: 12.5,
      bold: true,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "middle"
    });
  });
}

// ==========================================
// SLIDE 6: MOCKUP: LANDING PAGE & PORTAL LKBH
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: LANDING PAGE & PORTAL LKBH STHM");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  // Left Box Header
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("LANDING PAGE RESMI LKBH STHM", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Left Image Frame
  s.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.landing)) {
    s.addImage({
      path: IMG.landing,
      x: leftX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Right Box Header
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("PORTAL LAYANAN BANTUAN HUKUM LKBH", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Right Image Frame
  s.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.portal)) {
    s.addImage({
      path: IMG.portal,
      x: rightX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Bottom Short Note
  s.addText("Keterangan: Tampilan halaman depan informasi resmi LKBH STHM dan portal akses menu konsultasi.", {
    x: 0.8,
    y: 6.4,
    w: 11.733,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// ==========================================
// SLIDE 7: MOCKUP: REGISTRASI & ROLE CUSTOMER
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: REGISTRASI & ROLE CUSTOMER (KLIEN)");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  // Left Title
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("HALAMAN PENDAFTARAN / REGISTRASI KLIEN", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.register)) {
    s.addImage({
      path: IMG.register,
      x: leftX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Right Title
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD KLIEN (TRACKING STATUS KASUS)", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.customer)) {
    s.addImage({
      path: IMG.customer,
      x: rightX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  s.addText("Keterangan: Formulir pendaftaran akun pencari keadilan dan dashboard pemantauan kasus secara real-time.", {
    x: 0.8,
    y: 6.4,
    w: 11.733,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// ==========================================
// SLIDE 8: MOCKUP: ROLE ADMIN & ROLE KONSULTAN
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE ADMIN & ROLE KONSULTAN HUKUM");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  // Left Title
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE ADMINISTRATOR", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.admin)) {
    s.addImage({
      path: IMG.admin,
      x: leftX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Right Title
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE KONSULTAN (ADVOKAT)", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.konsultan)) {
    s.addImage({
      path: IMG.konsultan,
      x: rightX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  s.addText("Keterangan: Admin mengelola verifikasi perkara dan penugasan; Konsultan/Advokat menangani perkara yang ditugaskan.", {
    x: 0.8,
    y: 6.4,
    w: 11.733,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// ==========================================
// SLIDE 9: MOCKUP: ROLE PARALEGAL & ROLE PENGAWAS
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE PARALEGAL & ROLE PENGAWAS");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  // Left Title
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE PARALEGAL", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.paralegal)) {
    s.addImage({
      path: IMG.paralegal,
      x: leftX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Right Title
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE PENGAWAS", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.pengawas)) {
    s.addImage({
      path: IMG.pengawas,
      x: rightX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  s.addText("Keterangan: Paralegal membantu verifikasi berkas permohonan; Pengawas memonitor transparansi dan kepatuhan SOP.", {
    x: 0.8,
    y: 6.4,
    w: 11.733,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// ==========================================
// SLIDE 10: MOCKUP: ROLE SEKRETARIS & ROLE BENDAHARA
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE SEKRETARIS & ROLE BENDAHARA");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  // Left Title
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE SEKRETARIS", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.sekertaris)) {
    s.addImage({
      path: IMG.sekertaris,
      x: leftX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  // Right Title
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE BENDAHARA", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.42,
    fontSize: 13,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: imgY,
    w: imgW,
    h: imgH,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 }
  });

  if (fs.existsSync(IMG.bendahara)) {
    s.addImage({
      path: IMG.bendahara,
      x: rightX + 0.05,
      y: imgY + 0.05,
      w: imgW - 0.1,
      h: imgH - 0.1
    });
  }

  s.addText("Keterangan: Sekretaris mengelola administrasi surat & naskah dinas; Bendahara mencatat kas dan anggaran operasional.", {
    x: 0.8,
    y: 6.4,
    w: 11.733,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// ==========================================
// SLIDE 11: PENUTUP & Q&A (DENGAN SEMBOYAN RESMI VIYATA WIRA CASANA)
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  // Top Bands
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 }
  });
  s.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0.3,
    w: 13.333,
    h: 0.1,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 }
  });

  // Large Logo
  if (fs.existsSync(IMG.logo)) {
    s.addImage({
      path: IMG.logo,
      x: 5.666,
      y: 0.9,
      w: 2.0,
      h: 2.0
    });
  }

  // Motto STHM Resmi: VIYATA WIRA CASANA (Pasal 17 AD)
  s.addShape(pres.ShapeType.roundRect, {
    x: 3.166,
    y: 3.05,
    w: 7.0,
    h: 0.52,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 },
    rectRadius: 0.1
  });
  s.addText("\"VIYATA WIRA CASANA\"", {
    x: 3.166,
    y: 3.05,
    w: 7.0,
    h: 0.52,
    fontSize: 17,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText("Menegakkan Hukum dan Keadilan Secara Bijaksana, Profesional, serta Tanpa Pamrih", {
    x: 1.0,
    y: 3.65,
    w: 11.333,
    h: 0.35,
    fontSize: 12,
    italic: true,
    bold: true,
    color: C.textMuted,
    fontFace: FONT_MAIN,
    align: "center"
  });

  // Main Thank You Title (Huge for Infokus)
  s.addText("TERIMA KASIH", {
    x: 0.8,
    y: 4.05,
    w: 11.733,
    h: 0.9,
    fontSize: 42,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Subtitle Q&A
  s.addText("SESI TANYA JAWAB (Q & A)", {
    x: 0.8,
    y: 5.0,
    w: 11.733,
    h: 0.45,
    fontSize: 20,
    bold: true,
    color: C.gold,
    fontFace: FONT_MAIN,
    align: "center"
  });

  s.addText("Lembaga Konsultasi dan Bantuan Hukum Sekolah Tinggi Hukum Militer (LKBH STHM)\nDirektorat Hukum Angkatan Darat (Ditkumad) • Jakarta", {
    x: 1.0,
    y: 5.55,
    w: 11.333,
    h: 0.65,
    fontSize: 14,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });
}

// Generate Presentation to all target paths
const targets = [
  path.join(BASE_DIR, "LKBH_STHM_Digitalisasi_Presentasi.pptx"),
  path.join(BASE_DIR, "LBH_STHM_Digitalisasi_Presentasi.pptx"),
  path.join(BASE_DIR, "public", "img", "LKBH_STHM_Digitalisasi_Presentasi.pptx"),
  path.join(BASE_DIR, "public", "img", "LBH_STHM_Digitalisasi_Presentasi.pptx"),
];

async function saveAll() {
  for (const t of targets) {
    console.log(`Writing presentation to: ${t}...`);
    await pres.writeFile({ fileName: t });
  }
  console.log("SUCCESS: All presentations generated and synchronized successfully!");
}

saveAll().catch(err => {
  console.error("ERROR generating presentation:", err);
  process.exit(1);
});

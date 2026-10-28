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
  bgLight: "FFFFFF",      // Pure White background
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

// Dynamic Base Directory
const BASE_DIR = process.cwd();
const IMG = {
  logo: path.join(BASE_DIR, "public/img/logo_LKBH-removebg-preview.png"),
  struktur: path.join(BASE_DIR, "public/img/struktur_organisasi.png"),
  landing: path.join(BASE_DIR, "public/ss an/landing page.png"),
  portal: path.join(BASE_DIR, "public/ss an/portal LBH.png"),
  register: path.join(BASE_DIR, "public/ss an/register.png"),
  customer: path.join(BASE_DIR, "public/ss an/role customer.png"),
  konsultan: path.join(BASE_DIR, "public/ss an/role konsultan.png"),
  admin: path.join(BASE_DIR, "public/ss an/role admin.png"),
  paralegal: path.join(BASE_DIR, "public/ss an/role paralegal.png"),
  pengawas: path.join(BASE_DIR, "public/ss an/role pengawas.png"),
  sekertaris: path.join(BASE_DIR, "public/ss an/role sekertaris.png"),
  bendahara: path.join(BASE_DIR, "public/ss an/role bendahara.png"),
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

  // Main Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.15,
    w: 10.5,
    h: 0.85,
    fontSize: 24,
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

console.log("Generating LKBH STHM Infokus-Optimized Slides (14 Slides Total)...");

// ==========================================
// SLIDE 1: COVER SLIDE
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

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

  if (fs.existsSync(IMG.logo)) {
    s.addImage({
      path: IMG.logo,
      x: 5.666,
      y: 0.8,
      w: 2.0,
      h: 2.0
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: 2.4,
    y: 2.95,
    w: 8.533,
    h: 0.55,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 },
    rectRadius: 0.1
  });
  s.addText("LKBH STHM - SEKOLAH TINGGI HUKUM MILITER", {
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

  s.addText("SISTEM INFORMASI PELAYANAN BANTUAN HUKUM TERINTEGRASI", {
    x: 0.8,
    y: 3.65,
    w: 11.733,
    h: 0.9,
    fontSize: 32,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText("TUGAS AKHIR - FAKULTAS SAINS DAN INFORMATIKA\nUNIVERSITAS JENDERAL ACHMAD YANI", {
    x: 1.0,
    y: 4.65,
    w: 11.333,
    h: 0.7,
    fontSize: 16,
    bold: true,
    color: C.textDark,
    fontFace: FONT_MAIN,
    align: "center"
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 1.2,
    y: 5.5,
    w: 10.933,
    h: 1.35,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  const team = [
    { name: "Sulthan Dhiyaul Barts H.", role: "Business Analyst" },
    { name: "Aditya Maulana Ardiansyah", role: "Backend Developer" },
    { name: "Muhammad Roihan", role: "UI/UX Designer" },
    { name: "Sayyid Ashhabussunan", role: "Scrum Master" }
  ];

  const colW = 10.933 / 4;
  team.forEach((m, idx) => {
    s.addText([
      { text: m.name + "\n", options: { bold: true, fontSize: 12.5, color: C.textDark } },
      { text: m.role, options: { bold: true, fontSize: 11, color: C.gold } }
    ], {
      x: 1.2 + idx * colW,
      y: 5.65,
      w: colW,
      h: 1.05,
      align: "center",
      valign: "middle"
    });
  });
}

// ==========================================
// SLIDE 2: PROFIL TIM PENGEMBANG SISTEM
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "TIM PENGEMBANG SISTEM");

  const teamMembers = [
    {
      initials: "SH",
      name: "Sulthan Dhiyaul Barts Hasibuan",
      role: "Business Analyst",
      desc: "Menggali kebutuhan dan merumuskan alur bisnis serta SOP"
    },
    {
      initials: "AA",
      name: "Aditya Maulana Ardiansyah",
      role: "Backend Developer",
      desc: "Membangun API, basis data, dan keamanan sistem"
    },
    {
      initials: "MR",
      name: "Muhammad Roihan",
      role: "UI/UX Designer",
      desc: "Merancang antarmuka dan pengalaman pengguna"
    },
    {
      initials: "SA",
      name: "Sayyid Ashhabussunan",
      role: "Scrum Master",
      desc: "Mengatur sprint dan kolaborasi tim"
    }
  ];

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

    // Avatar Circle Badge with initials
    s.addShape(pres.ShapeType.ellipse, {
      x: curX + (cardW - 1.25) / 2,
      y: curY + 0.3,
      w: 1.25,
      h: 1.25,
      fill: { color: C.armyGreen },
      line: { color: C.gold, width: 2.5 }
    });
    s.addText(m.initials, {
      x: curX + (cardW - 1.25) / 2,
      y: curY + 0.3,
      w: 1.25,
      h: 1.25,
      fontSize: 22,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Name
    s.addText(m.name, {
      x: curX + 0.1,
      y: curY + 1.7,
      w: cardW - 0.2,
      h: 0.9,
      fontSize: 14.5,
      bold: true,
      color: C.textDark,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Role
    s.addText(m.role, {
      x: curX + 0.1,
      y: curY + 2.65,
      w: cardW - 0.2,
      h: 0.4,
      fontSize: 12.5,
      bold: true,
      color: C.gold,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Divider
    s.addShape(pres.ShapeType.line, {
      x: curX + 0.3,
      y: curY + 3.15,
      w: cardW - 0.6,
      h: 0,
      line: { color: C.gold, width: 1.5 }
    });

    // Description
    s.addText(m.desc, {
      x: curX + 0.15,
      y: curY + 3.35,
      w: cardW - 0.3,
      h: 1.4,
      fontSize: 12,
      color: C.textBody,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "top"
    });
  });
}

// ==========================================
// SLIDE 3: CV SULTHAN DHIYAUL BARTS HASIBUAN
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "CURRICULUM VITAE — SULTHAN DHIYAUL BARTS HASIBUAN");

  // Left Column: Identity & Profile Card
  const leftX = 0.8;
  const leftW = 4.1;

  // Identity Card
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: leftW,
    h: 3.4,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  // Avatar Circle
  s.addShape(pres.ShapeType.ellipse, {
    x: leftX + 0.2,
    y: 1.62,
    w: 0.95,
    h: 0.95,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 }
  });
  s.addText("SH", {
    x: leftX + 0.2,
    y: 1.62,
    w: 0.95,
    h: 0.95,
    fontSize: 20,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Name & Role Pill
  s.addText("Sulthan Dhiyaul Barts Hasibuan", {
    x: leftX + 1.25,
    y: 1.6,
    w: leftW - 1.35,
    h: 0.5,
    fontSize: 13,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX + 1.25,
    y: 2.15,
    w: 1.85,
    h: 0.32,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
    rectRadius: 0.08
  });
  s.addText("BUSINESS ANALYST", {
    x: leftX + 1.25,
    y: 2.15,
    w: 1.85,
    h: 0.32,
    fontSize: 9.5,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Divider
  s.addShape(pres.ShapeType.line, {
    x: leftX + 0.2,
    y: 2.7,
    w: leftW - 0.4,
    h: 0,
    line: { color: C.gold, width: 1.5 }
  });

  // Bio Info Bullets
  const bioInfo = [
    { label: "Pendidikan", val: "S1 Teknik Informatika (Semester 6) • IPK 3.44" },
    { label: "Institusi", val: "Universitas Jenderal Achmad Yani (UNJANI)" },
    { label: "Domisili", val: "Kab. Bandung Barat, Jawa Barat" },
    { label: "Kontak", val: "0812-8392-0912 | dhiyaulbarts@gmail.com" },
    { label: "Tautan", val: "GitHub: Antitesis08 | LinkedIn: Sulthan D. B. H." },
    { label: "Kemahiran Bahasa", val: "Bahasa Indonesia (Native) | English (Mahir)" }
  ];

  const bioFormatted = bioInfo.map(b => [
    { text: b.label + ": ", options: { bold: true, fontSize: 10, color: C.armyGreen } },
    { text: b.val + "\n", options: { fontSize: 10, color: C.textDark } }
  ]).flat();

  s.addText(bioFormatted, {
    x: leftX + 0.2,
    y: 2.8,
    w: leftW - 0.4,
    h: 1.95,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Summary & Focus Card
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 4.98,
    w: leftW,
    h: 1.88,
    fill: { color: C.bgCardAlt },
    line: { color: C.gold, width: 1.8 },
    rectRadius: 0.1
  });

  s.addText("PROFIL & FOKUS KEAHLIAN", {
    x: leftX + 0.2,
    y: 5.08,
    w: leftW - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN
  });

  s.addText("Mahasiswa Teknik Informatika berdedikasi dengan keahlian utama dalam menganalisis proses bisnis bantuan hukum, perumusan spesifikasi sistem & SOP 7 role pengguna, analisis data statistik, serta integrasi Artificial Intelligence (AI).", {
    x: leftX + 0.2,
    y: 5.38,
    w: leftW - 0.4,
    h: 0.95,
    fontSize: 9.8,
    color: C.textBody,
    fontFace: FONT_MAIN
  });

  s.addText([
    { text: "Fokus: ", options: { bold: true, color: C.armyGreen, fontSize: 9.5 } },
    { text: "Analisis Data • Proses Bisnis & SOP • Solusi AI", options: { bold: true, color: C.gold, fontSize: 9.5 } }
  ], {
    x: leftX + 0.2,
    y: 6.4,
    w: leftW - 0.4,
    h: 0.35,
    fontFace: FONT_MAIN
  });

  // Right Column: Organization, Projects, Skills
  const rightX = 5.1;
  const rightW = 7.433;

  // Card 1: Pengalaman Organisasi
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: rightW,
    h: 1.62,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 1.55,
    w: 4.0,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("PENGALAMAN ORGANISASI & KEPEMIMPINAN", {
    x: rightX + 0.15,
    y: 1.55,
    w: 4.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  const orgs = [
    {
      inst: "BEM KM UNJANI (2025 - 2026)",
      pos: "Staff Kementerian Sosial dan Politik",
      desc: "Menangani koordinasi advokasi, relasi eksternal, dan aksi sosial kemahasiswaan."
    },
    {
      inst: "BEM KM FSI UNJANI (2025 - 2026)",
      pos: "Kepala Departemen Kastrat & Advokasi",
      desc: "Memimpin kajian isu strategis fakultas dan perumusan rekomendasi kebijakan."
    },
    {
      inst: "OSIS SMAN 4 Pematangsiantar (2021 - 2022)",
      pos: "Ketua OSIS",
      desc: "Memimpin organisasi kesiswaan tingkat sekolah & meraih sertifikat kepemimpinan."
    }
  ];

  const orgColW = (rightW - 0.4) / 3;
  orgs.forEach((o, idx) => {
    s.addText([
      { text: o.inst + "\n", options: { bold: true, fontSize: 10, color: C.armyGreen } },
      { text: o.pos + "\n", options: { bold: true, fontSize: 9.5, color: C.gold } },
      { text: o.desc, options: { fontSize: 8.8, color: C.textMuted } }
    ], {
      x: rightX + 0.15 + idx * orgColW,
      y: 1.92,
      w: orgColW - 0.1,
      h: 1.08,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });

  // Card 2: Pengalaman Proyek
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 3.18,
    w: rightW,
    h: 2.1,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 3.28,
    w: 3.8,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("PENGALAMAN PEMBUATAN PROYEK (PORTOFOLIO)", {
    x: rightX + 0.15,
    y: 3.28,
    w: 3.8,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  const projects = [
    {
      title: "Sistem Digitalisasi LKBH STHM (2026)",
      desc: "Business Analyst: Menganalisis SOP-01 s/d SOP-06 AD/ART LKBH STHM, merumuskan alur 7 role pengguna, matriks hak akses, serta menyusun spesifikasi fungsional sistem bantuan hukum."
    },
    {
      title: "AI Decision Support System (DSS)",
      desc: "Sistem rekomendasi AI menganalisis sentimen media sosial investor (web scraping & NLP) untuk mendukung pengambilan keputusan bisnis strategis berbasis data."
    },
    {
      title: "PahamUang — Platform Konsultasi Finansial",
      desc: "Aplikasi web penjadwalan konsultasi keuangan terintegrasi 3 role (admin, konsultan, pelanggan) berbasis framework Laravel & Vue dengan database relasional."
    },
    {
      title: "SIMPEG — Sistem Informasi Kepegawaian",
      desc: "Aplikasi manajemen SDM instansi pemerintah; implementasi arsitektur MVC Laravel, perancangan database terintegrasi, dan pengelolaan arsip pegawai."
    }
  ];

  const projW = (rightW - 0.45) / 2;
  projects.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    s.addText([
      { text: "• " + p.title + "\n", options: { bold: true, fontSize: 10, color: C.armyGreen } },
      { text: p.desc, options: { fontSize: 8.8, color: C.textBody } }
    ], {
      x: rightX + 0.15 + col * (projW + 0.15),
      y: 3.65 + row * 0.78,
      w: projW,
      h: 0.75,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });

  // Card 3: Kemahiran & Sertifikasi
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 5.38,
    w: rightW,
    h: 1.48,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  // Sub-col 1: Kemahiran
  s.addText([
    { text: "KEMAHIRAN TEKNIS & NON-TEKNIS\n", options: { bold: true, fontSize: 10.5, color: C.armyGreen } },
    { text: "• Teknis: ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Python, SQL, Excel, Power BI, Docker, Laravel, PHP, MySQL, Git/GitHub, Langflow.\n", options: { fontSize: 9.2, color: C.textDark } },
    { text: "• Non-Teknis: ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Analisis Bisnis, Public Speaking, Kepemimpinan, Problem Solving, AI Prompting.", options: { fontSize: 9.2, color: C.textDark } }
  ], {
    x: rightX + 0.15,
    y: 5.48,
    w: 3.55,
    h: 1.3,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Divider between sub-cols
  s.addShape(pres.ShapeType.line, {
    x: rightX + 3.8,
    y: 5.5,
    w: 0,
    h: 1.25,
    line: { color: C.gold, width: 1.5 }
  });

  // Sub-col 2: Sertifikasi
  s.addText([
    { text: "SERTIFIKASI & PELATIHAN RESMI\n", options: { bold: true, fontSize: 10.5, color: C.armyGreen } },
    { text: "• IBM SkillsBuild (2026): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "AI Agents, IBM Granite, Data Science Landscape, Getting Started with Data.\n", options: { fontSize: 9.2, color: C.textDark } },
    { text: "• Rocket Tutor ID (2026): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Full Stack Data Analyst • ", options: { fontSize: 9.2, color: C.textDark } },
    { text: "Ousean (2025): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Data Analyst Camp B1.", options: { fontSize: 9.2, color: C.textDark } }
  ], {
    x: rightX + 3.95,
    y: 5.48,
    w: 3.35,
    h: 1.3,
    fontFace: FONT_MAIN,
    valign: "top"
  });
}

// ==========================================
// SLIDE 4: CV ADITYA MAULANA ARDIANSYAH
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "CURRICULUM VITAE — ADITYA MAULANA ARDIANSYAH");

  // Left Column: Identity & Profile Card
  const leftX = 0.8;
  const leftW = 4.1;

  // Identity Card
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: leftW,
    h: 3.4,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  // Avatar Circle
  s.addShape(pres.ShapeType.ellipse, {
    x: leftX + 0.2,
    y: 1.62,
    w: 0.95,
    h: 0.95,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 }
  });
  s.addText("AA", {
    x: leftX + 0.2,
    y: 1.62,
    w: 0.95,
    h: 0.95,
    fontSize: 20,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Name & Role Pill
  s.addText("Aditya Maulana Ardiansyah", {
    x: leftX + 1.25,
    y: 1.6,
    w: leftW - 1.35,
    h: 0.5,
    fontSize: 13,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX + 1.25,
    y: 2.15,
    w: 1.95,
    h: 0.32,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
    rectRadius: 0.08
  });
  s.addText("BACKEND DEVELOPER", {
    x: leftX + 1.25,
    y: 2.15,
    w: 1.95,
    h: 0.32,
    fontSize: 9.5,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Divider
  s.addShape(pres.ShapeType.line, {
    x: leftX + 0.2,
    y: 2.7,
    w: leftW - 0.4,
    h: 0,
    line: { color: C.gold, width: 1.5 }
  });

  // Bio Info Bullets
  const bioInfo = [
    { label: "Pendidikan", val: "S1 Teknik Informatika (Semester 7) • IPK 3.19" },
    { label: "Institusi", val: "Universitas Jenderal Achmad Yani (UNJANI)" },
    { label: "Domisili", val: "Kab. Bandung Barat, Jawa Barat" },
    { label: "Kontak", val: "0821-2724-4922 | adityamaulardi11@gmail.com" },
    { label: "Tautan", val: "GitHub: Hoshino-115 | LinkedIn: Aditya Maulana A." },
    { label: "Kemahiran Bahasa", val: "Bahasa Indonesia (Native) | English (Mahir)" }
  ];

  const bioFormatted = bioInfo.map(b => [
    { text: b.label + ": ", options: { bold: true, fontSize: 10, color: C.armyGreen } },
    { text: b.val + "\n", options: { fontSize: 10, color: C.textDark } }
  ]).flat();

  s.addText(bioFormatted, {
    x: leftX + 0.2,
    y: 2.8,
    w: leftW - 0.4,
    h: 1.95,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Summary & Focus Card
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 4.98,
    w: leftW,
    h: 1.88,
    fill: { color: C.bgCardAlt },
    line: { color: C.gold, width: 1.8 },
    rectRadius: 0.1
  });

  s.addText("PROFIL & FOKUS KEAHLIAN", {
    x: leftX + 0.2,
    y: 5.08,
    w: leftW - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN
  });

  s.addText("Mahasiswa Teknik Informatika dengan spesialisasi rekayasa backend, perancangan REST API, database relasional PostgreSQL & Prisma ORM, arsitektur keamanan multi-lapis, maintenance hardware komputer, serta implementasi kecerdasan buatan (AI).", {
    x: leftX + 0.2,
    y: 5.38,
    w: leftW - 0.4,
    h: 0.95,
    fontSize: 9.8,
    color: C.textBody,
    fontFace: FONT_MAIN
  });

  s.addText([
    { text: "Fokus: ", options: { bold: true, color: C.armyGreen, fontSize: 9.5 } },
    { text: "Rekayasa Backend • PostgreSQL & Prisma • Keamanan Sistem", options: { bold: true, color: C.gold, fontSize: 9.5 } }
  ], {
    x: leftX + 0.2,
    y: 6.4,
    w: leftW - 0.4,
    h: 0.35,
    fontFace: FONT_MAIN
  });

  // Right Column: Experience, Projects, Skills
  const rightX = 5.1;
  const rightW = 7.433;

  // Card 1: Pengalaman Kerja & Magang
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: rightW,
    h: 1.62,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 1.55,
    w: 4.2,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("PENGALAMAN KERJA, MAGANG & ORGANISASI", {
    x: rightX + 0.15,
    y: 1.55,
    w: 4.2,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  const expItems = [
    {
      inst: "PT Pertamina Patra Niaga (2026)",
      pos: "Magang — ETL Data Engineer",
      desc: "Membangun sistem extract, transform, & load (ETL) otomatis untuk pengolahan data Excel."
    },
    {
      inst: "Alnis Notebook (2022)",
      pos: "PKL — Hardware & Network Maintenance",
      desc: "Pemeliharaan perangkat keras komputer, instalasi OS & software, serta troubleshooting."
    },
    {
      inst: "HM KM Informatika UNJANI (2026 - 2027)",
      pos: "Staff Dept. Kajian Strategi & Advokasi",
      desc: "Pengkajian kebijakan strategis akademik dan fasilitasi aspirasi mahasiswa informatika."
    }
  ];

  const expColW = (rightW - 0.4) / 3;
  expItems.forEach((e, idx) => {
    s.addText([
      { text: e.inst + "\n", options: { bold: true, fontSize: 10, color: C.armyGreen } },
      { text: e.pos + "\n", options: { bold: true, fontSize: 9.5, color: C.gold } },
      { text: e.desc, options: { fontSize: 8.8, color: C.textMuted } }
    ], {
      x: rightX + 0.15 + idx * expColW,
      y: 1.92,
      w: expColW - 0.1,
      h: 1.08,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });

  // Card 2: Pengalaman Proyek
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 3.18,
    w: rightW,
    h: 2.1,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 3.28,
    w: 3.8,
    h: 0.3,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("PENGALAMAN PEMBUATAN PROYEK (PORTOFOLIO)", {
    x: rightX + 0.15,
    y: 3.28,
    w: 3.8,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  const aditProjects = [
    {
      title: "Sistem Digitalisasi LKBH STHM (2026)",
      desc: "Backend Developer: Arsitektur REST API Next.js, skema relasional Prisma ORM, PostgreSQL, autentikasi Custom JWT 3 lapis, generator PDF surat dinas resmi, & presigned upload S3."
    },
    {
      title: "AI Customer Review System",
      desc: "Pengembangan agen AI cerdas untuk klasifikasi ulasan pelanggan dan analisis sentimen otomatis berbasis machine learning/LLM."
    },
    {
      title: "J-Stok — Sistem Gudang Terintegrasi",
      desc: "Aplikasi web inventaris logistik pergudangan terintegrasi database (Admin & Pegawai) dengan Full Stack Laravel dan pola desain MVC."
    },
    {
      title: "FinanceKu & Data Transform Importer",
      desc: "Sistem keuangan pribadi (Laravel & React) serta aplikasi utility ETL otomatis untuk manipulasi dan impor dataset Excel skala besar."
    }
  ];

  const projW = (rightW - 0.45) / 2;
  aditProjects.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    s.addText([
      { text: "• " + p.title + "\n", options: { bold: true, fontSize: 10, color: C.armyGreen } },
      { text: p.desc, options: { fontSize: 8.8, color: C.textBody } }
    ], {
      x: rightX + 0.15 + col * (projW + 0.15),
      y: 3.65 + row * 0.78,
      w: projW,
      h: 0.75,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });

  // Card 3: Kemahiran & Sertifikasi
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 5.38,
    w: rightW,
    h: 1.48,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.1
  });

  // Sub-col 1: Kemahiran
  s.addText([
    { text: "KEMAHIRAN TEKNIS & NON-TEKNIS\n", options: { bold: true, fontSize: 10.5, color: C.armyGreen } },
    { text: "• Teknis: ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Node.js, Next.js, PostgreSQL, Prisma, Python, SQL, Docker, Java, JS, Laravel, Git.\n", options: { fontSize: 9.2, color: C.textDark } },
    { text: "• Non-Teknis: ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Rekayasa Basis Data, Problem Solving, Keamanan Sistem, Adaptif, Hardware Maintenance.", options: { fontSize: 9.2, color: C.textDark } }
  ], {
    x: rightX + 0.15,
    y: 5.48,
    w: 3.55,
    h: 1.3,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Divider between sub-cols
  s.addShape(pres.ShapeType.line, {
    x: rightX + 3.8,
    y: 5.5,
    w: 0,
    h: 1.25,
    line: { color: C.gold, width: 1.5 }
  });

  // Sub-col 2: Sertifikasi
  s.addText([
    { text: "SERTIFIKASI & PELATIHAN RESMI\n", options: { bold: true, fontSize: 10.5, color: C.armyGreen } },
    { text: "• IBM SkillsBuild (2026): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Unleashing the Power of AI Agents\n", options: { fontSize: 9.2, color: C.textDark } },
    { text: "• IBM SkillsBuild (2026): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Classifying Data Using IBM Granite\n", options: { fontSize: 9.2, color: C.textDark } },
    { text: "• IBM SkillsBuild (2026): ", options: { bold: true, fontSize: 9.2, color: C.gold } },
    { text: "Data Science Landscape & Getting Started With Data", options: { fontSize: 9.2, color: C.textDark } }
  ], {
    x: rightX + 3.95,
    y: 5.48,
    w: 3.35,
    h: 1.3,
    fontFace: FONT_MAIN,
    valign: "top"
  });
}

// ==========================================
// SLIDE 5: PENDAHULUAN: STRUKTUR ORGANISASI LKBH STHM
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "STRUKTUR ORGANISASI LKBH STHM");

  // Left Container: Official Structural Chart Image
  const leftX = 0.8;
  const leftW = 5.2;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: leftW,
    h: 5.4,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  // Banner inside Image Card
  s.addShape(pres.ShapeType.roundRect, {
    x: leftX + 0.15,
    y: 1.55,
    w: leftW - 0.3,
    h: 0.35,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("LAMPIRAN A RESMI: BAGAN STRUKTUR ORGANISASI", {
    x: leftX + 0.15,
    y: 1.55,
    w: leftW - 0.3,
    h: 0.35,
    fontSize: 10.5,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  // Official Structure Image
  if (fs.existsSync(IMG.struktur)) {
    s.addImage({
      path: IMG.struktur,
      x: leftX + 0.25,
      y: 2.0,
      w: leftW - 0.5,
      h: 4.4,
      sizing: { type: "contain", w: leftW - 0.5, h: 4.4 }
    });
  }

  s.addText("Ditetapkan di Jakarta • Disahkan oleh Ketua Pembina Brigjen TNI R. Deltanto Sarwi Diatmiko, S.H., M.H.", {
    x: leftX + 0.1,
    y: 6.5,
    w: leftW - 0.2,
    h: 0.25,
    fontSize: 8,
    bold: true,
    italic: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center"
  });

  // Right Container: Hierarchical Structure Breakdown
  const rightX = 6.2;
  const rightW = 6.333;

  // Banner Callout
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: rightW,
    h: 0.72,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.8 },
    rectRadius: 0.08
  });
  s.addText([
    { text: "PENDAHULUAN: STRUKTUR ORGANISASI SEBAGAI DASAR ARSITEKTUR SISTEM\n", options: { bold: true, fontSize: 11, color: C.goldLight } },
    { text: "Bagan organisasi LKBH STHM menjadi landasan perancangan 7 role pengguna dan pembagian kewenangan alur perkara SOP-01 s/d SOP-06.", options: { fontSize: 9.2, color: C.textWhite } }
  ], {
    x: rightX + 0.2,
    y: 1.48,
    w: rightW - 0.4,
    h: 0.65,
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  // Level 1: Pembina & Pimpinan
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 2.26,
    w: rightW,
    h: 1.42,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.08
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 2.34,
    w: 3.2,
    h: 0.28,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
    rectRadius: 0.06
  });
  s.addText("1. TINGKAT PEMBINA & PIMPINAN", {
    x: rightX + 0.15,
    y: 2.34,
    w: 3.2,
    h: 0.28,
    fontSize: 9.5,
    bold: true,
    color: C.textWhite,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText([
    { text: "• Ketua Pembina (Ketua STHM): ", options: { bold: true, fontSize: 9.5, color: C.armyGreen } },
    { text: "Penentu arah kebijakan umum lembaga & pengesah Legal Opinion resmi.\n", options: { fontSize: 9.5, color: C.textDark } },
    { text: "• Penasehat & Pengawas: ", options: { bold: true, fontSize: 9.5, color: C.armyGreen } },
    { text: "Mengawasi kode etik, kepatuhan SOP perkara, serta akuntabilitas operasional.\n", options: { fontSize: 9.5, color: C.textDark } },
    { text: "• Kepala LKBH STHM: ", options: { bold: true, fontSize: 9.5, color: C.armyGreen } },
    { text: "Penanggung jawab operasional, memimpin gelar perkara & menerbitkan Surat Tugas advokat.", options: { fontSize: 9.5, color: C.textDark } }
  ], {
    x: rightX + 0.2,
    y: 2.66,
    w: rightW - 0.4,
    h: 0.98,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Level 2: Administrasi & Keuangan
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 3.76,
    w: rightW,
    h: 1.35,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.08
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 3.84,
    w: 3.4,
    h: 0.28,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("2. TINGKAT ADMINISTRASI & KEUANGAN", {
    x: rightX + 0.15,
    y: 3.84,
    w: 3.4,
    h: 0.28,
    fontSize: 9.5,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText([
    { text: "• Sekretaris: ", options: { bold: true, fontSize: 9.5, color: C.armyGreen } },
    { text: "Mengelola tata naskah dinas, verifikasi kelengkapan berkas perkara, & register induk.\n", options: { fontSize: 9.5, color: C.textDark } },
    { text: "• Bendahara: ", options: { bold: true, fontSize: 9.5, color: C.armyGreen } },
    { text: "Pengelolaan kas operasional bantuan hukum, audit keuangan perkara, & alokasi pro bono.", options: { fontSize: 9.5, color: C.textDark } }
  ], {
    x: rightX + 0.2,
    y: 4.16,
    w: rightW - 0.4,
    h: 0.88,
    fontFace: FONT_MAIN,
    valign: "top"
  });

  // Level 3: Pelaksana Teknis & Advokasi
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 5.2,
    w: rightW,
    h: 1.65,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 1.8 },
    rectRadius: 0.08
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: rightX + 0.15,
    y: 5.28,
    w: 3.6,
    h: 0.28,
    fill: { color: C.armyGreen },
    line: { color: C.armyGreen, width: 0 },
    rectRadius: 0.06
  });
  s.addText("3. TINGKAT PELAKSANA TEKNIS & ADVOKASI", {
    x: rightX + 0.15,
    y: 5.28,
    w: 3.6,
    h: 0.28,
    fontSize: 9.5,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText([
    { text: "• Divisi Litigasi & Konsultan (Advokat): ", options: { bold: true, fontSize: 9.3, color: C.armyGreen } },
    { text: "Pendampingan sidang di 4 peradilan (Militer, Umum, PTUN, Agama).\n", options: { fontSize: 9.3, color: C.textDark } },
    { text: "• Divisi Non Litigasi: ", options: { bold: true, fontSize: 9.3, color: C.armyGreen } },
    { text: "Konsultasi hukum, mediasi/negosiasi sengketa, legal opinion, serta pendaftaran HKI.\n", options: { fontSize: 9.3, color: C.textDark } },
    { text: "• UPKH & Kelompok Fungsional: ", options: { bold: true, fontSize: 9.3, color: C.armyGreen } },
    { text: "Laboratorium klinik hukum perwira mahasiswa STHM & tridharma LPPM.\n", options: { fontSize: 9.3, color: C.textDark } },
    { text: "• Paralegal: ", options: { bold: true, fontSize: 9.3, color: C.armyGreen } },
    { text: "Asistensi penyiapan berkas awal, cek bukti lapangan, & pendampingan klien.", options: { fontSize: 9.3, color: C.textDark } }
  ], {
    x: rightX + 0.2,
    y: 5.6,
    w: rightW - 0.4,
    h: 1.2,
    fontFace: FONT_MAIN,
    valign: "top"
  });
}

// ==========================================
// SLIDE 6: MENGAPA DIGITALISASI PENTING
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MENGAPA DIGITALISASI PENTING");

  // Big Highlight Callout: LKBH STHM Hanya 1 di Indonesia
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 11.733,
    h: 1.25,
    fill: { color: C.bgCard },
    line: { color: C.armyGreen, width: 2 },
    rectRadius: 0.1
  });

  // Stat Circle Badge
  s.addShape(pres.ShapeType.ellipse, {
    x: 1.05,
    y: 1.58,
    w: 1.0,
    h: 1.0,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2.5 }
  });
  s.addText("1", {
    x: 1.05,
    y: 1.58,
    w: 1.0,
    h: 1.0,
    fontSize: 28,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addText("SATU-SATUNYA LKBH STHM DI INDONESIA • WILAYAH LAYANAN SELURUH INDONESIA", {
    x: 2.3,
    y: 1.6,
    w: 10.0,
    h: 0.38,
    fontSize: 14,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    valign: "middle"
  });

  s.addText("Prajurit TNI, purnawirawan, keluarga besar TNI, dan masyarakat pencari keadilan tersebar di 38 provinsi di seluruh Nusantara.", {
    x: 2.3,
    y: 2.05,
    w: 10.0,
    h: 0.45,
    fontSize: 12,
    color: C.textDark,
    fontFace: FONT_MAIN
  });

  // 4 Urgency Cards
  const cards = [
    {
      num: "01",
      title: "Jangkauan Nasional",
      desc: "Pencari keadilan dari Aceh hingga Papua dapat mengajukan permohonan bantuan hukum secara online tanpa harus datang langsung ke Jakarta Timur."
    },
    {
      num: "02",
      title: "Proses Baku & Akuntabel",
      desc: "SOP-01 s/d SOP-06 berjalan seragam, terdata secara digital, serta terdistribusi secara transparan ke seluruh penanggung jawab perkara."
    },
    {
      num: "03",
      title: "Arsip Aman & Rahasia",
      desc: "Dossier perkara tersimpan digital dengan enkripsi dan hak akses ketat sesuai dengan ketentuan SOP dan kode etik yang berlaku."
    },
    {
      num: "04",
      title: "Transparan & Terukur",
      desc: "Klien pencari keadilan memantau status perkembangan kasus secara mandiri dan real-time dari registrasi hingga putusan inkracht."
    }
  ];

  const cW = 2.75;
  const cGap = 0.24;
  const cY = 2.88;
  const cH = 3.1;

  cards.forEach((c, idx) => {
    const curX = 0.8 + idx * (cW + cGap);

    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: cY,
      w: cW,
      h: cH,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    // Number Pill
    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.2,
      y: cY + 0.2,
      w: 0.7,
      h: 0.4,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(c.num, {
      x: curX + 0.2,
      y: cY + 0.2,
      w: 0.7,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    // Title
    s.addText(c.title, {
      x: curX + 1.05,
      y: cY + 0.15,
      w: cW - 1.25,
      h: 0.5,
      fontSize: 12.5,
      bold: true,
      color: C.armyGreen,
      fontFace: FONT_MAIN,
      valign: "middle"
    });

    // Divider
    s.addShape(pres.ShapeType.line, {
      x: curX + 0.2,
      y: cY + 0.75,
      w: cW - 0.4,
      h: 0,
      line: { color: C.gold, width: 1.5 }
    });

    // Desc
    s.addText(c.desc, {
      x: curX + 0.2,
      y: cY + 0.9,
      w: cW - 0.4,
      h: 2.0,
      fontSize: 11.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "top"
    });
  });

  // Legal basis bottom bar
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 6.18,
    w: 11.733,
    h: 0.65,
    fill: { color: C.bgCardAlt },
    line: { color: C.gold, width: 1.8 },
    rectRadius: 0.08
  });
  s.addText("Landasan Yuridis: ART Pasal 7 LKBH STHM membolehkan pendaftaran melalui kanal elektronik resmi, dan ART Pasal 2 mewajibkan pengarsipan dossier secara tertib dan digital.", {
    x: 1.0,
    y: 6.22,
    w: 11.333,
    h: 0.55,
    fontSize: 11.5,
    bold: true,
    color: C.armyGreen,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });
}

// ==========================================
// SLIDE 7: ALUR PROSES PENANGANAN KASUS (7 TAHAPAN)
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

    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: r1Y,
      w: r1W,
      h: r1H,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.15,
      y: r1Y + 0.15,
      w: 0.65,
      h: 0.4,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.num, {
      x: curX + 0.15,
      y: r1Y + 0.15,
      w: 0.65,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    s.addText(st.actor, {
      x: curX + 0.9,
      y: r1Y + 0.15,
      w: r1W - 1.05,
      h: 0.4,
      fontSize: 11,
      bold: true,
      color: C.gold,
      fontFace: FONT_MAIN,
      valign: "middle"
    });

    s.addText(st.title, {
      x: curX + 0.15,
      y: r1Y + 0.62,
      w: r1W - 0.3,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: C.armyGreen,
      fontFace: FONT_MAIN
    });

    s.addShape(pres.ShapeType.line, {
      x: curX + 0.15,
      y: r1Y + 1.05,
      w: r1W - 0.3,
      h: 0,
      line: { color: C.gold, width: 1.5 }
    });

    s.addText(st.desc, {
      x: curX + 0.15,
      y: r1Y + 1.15,
      w: r1W - 0.3,
      h: 1.1,
      fontSize: 11,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "top"
    });

    if (idx < 3) {
      s.addText("➔", {
        x: curX + r1W + 0.02,
        y: r1Y + 0.9,
        w: r1Gap - 0.04,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: C.gold,
        fontFace: FONT_MAIN,
        align: "center",
        valign: "middle"
      });
    }
  });

  // ROW 2: 3 Wide Cards
  const r2W = 3.75;
  const r2Gap = 0.24;
  const r2Y = 4.0;
  const r2H = 2.15;

  stepsRow2.forEach((st, idx) => {
    const curX = 0.8 + idx * (r2W + r2Gap);

    s.addShape(pres.ShapeType.roundRect, {
      x: curX,
      y: r2Y,
      w: r2W,
      h: r2H,
      fill: { color: C.bgCard },
      line: { color: C.armyGreen, width: 2 },
      rectRadius: 0.08
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: curX + 0.2,
      y: r2Y + 0.15,
      w: 0.75,
      h: 0.4,
      fill: { color: C.armyGreen },
      line: { color: C.armyGreen, width: 0 },
      rectRadius: 0.06
    });
    s.addText(st.num, {
      x: curX + 0.2,
      y: r2Y + 0.15,
      w: 0.75,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: C.goldLight,
      fontFace: FONT_MAIN,
      align: "center",
      valign: "middle"
    });

    s.addText(st.actor, {
      x: curX + 1.05,
      y: r2Y + 0.15,
      w: r2W - 1.25,
      h: 0.4,
      fontSize: 11.5,
      bold: true,
      color: C.gold,
      fontFace: FONT_MAIN,
      valign: "middle"
    });

    s.addText(st.title, {
      x: curX + 0.2,
      y: r2Y + 0.62,
      w: r2W - 0.4,
      h: 0.4,
      fontSize: 13.5,
      bold: true,
      color: C.armyGreen,
      fontFace: FONT_MAIN
    });

    s.addShape(pres.ShapeType.line, {
      x: curX + 0.2,
      y: r2Y + 1.05,
      w: r2W - 0.4,
      h: 0,
      line: { color: C.gold, width: 1.5 }
    });

    s.addText(st.desc, {
      x: curX + 0.2,
      y: r2Y + 1.15,
      w: r2W - 0.4,
      h: 0.9,
      fontSize: 11.5,
      color: C.textDark,
      fontFace: FONT_MAIN,
      valign: "top"
    });

    if (idx < 2) {
      s.addText("➔", {
        x: curX + r2W + 0.02,
        y: r2Y + 0.85,
        w: r2Gap - 0.04,
        h: 0.5,
        fontSize: 20,
        bold: true,
        color: C.gold,
        fontFace: FONT_MAIN,
        align: "center",
        valign: "middle"
      });
    }
  });

  // Bottom Summary Process Flow Pill
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 6.3,
    w: 11.733,
    h: 0.55,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 2 },
    rectRadius: 0.08
  });
  s.addText("PENGAJUAN  ➔  VERIFIKASI  ➔  GELAR KASUS  ➔  LEGAL OPINION  ➔  PENUGASAN  ➔  PENANGANAN  ➔  SELESAI & LPPM", {
    x: 0.8,
    y: 6.3,
    w: 11.733,
    h: 0.55,
    fontSize: 12,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });
}

// ==========================================
// SLIDE 8: TEKNOLOGI YANG DIGUNAKAN
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
// SLIDE 9: MOCKUP: LANDING PAGE & PORTAL LKBH
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: LANDING PAGE & PORTAL LKBH STHM");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("LANDING PAGE RESMI LKBH STHM", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.landing)) {
    s.addImage({
      path: IMG.landing,
      x: leftX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("PORTAL LAYANAN BANTUAN HUKUM LKBH", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.portal)) {
    s.addImage({
      path: IMG.portal,
      x: rightX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

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
// SLIDE 10: MOCKUP: REGISTRASI & ROLE CUSTOMER
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: REGISTRASI & ROLE CUSTOMER (KLIEN)");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("HALAMAN PENDAFTARAN / REGISTRASI KLIEN", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.register)) {
    s.addImage({
      path: IMG.register,
      x: leftX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD KLIEN (TRACKING STATUS KASUS)", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.customer)) {
    s.addImage({
      path: IMG.customer,
      x: rightX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
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
// SLIDE 11: MOCKUP: ROLE ADMIN & ROLE KONSULTAN
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE ADMIN & ROLE KONSULTAN HUKUM");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE ADMINISTRATOR", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.admin)) {
    s.addImage({
      path: IMG.admin,
      x: leftX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE KONSULTAN (ADVOKAT)", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.konsultan)) {
    s.addImage({
      path: IMG.konsultan,
      x: rightX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
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
// SLIDE 12: MOCKUP: ROLE PARALEGAL & ROLE PENGAWAS
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE PARALEGAL & ROLE PENGAWAS");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE PARALEGAL", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.paralegal)) {
    s.addImage({
      path: IMG.paralegal,
      x: leftX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE PENGAWAS", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.pengawas)) {
    s.addImage({
      path: IMG.pengawas,
      x: rightX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
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
// SLIDE 13: MOCKUP: ROLE SEKRETARIS & ROLE BENDAHARA
// ==========================================
{
  const s = pres.addSlide();
  addSlideHeader(s, "MOCKUP: ROLE SEKRETARIS & ROLE BENDAHARA");

  const imgW = 5.74;
  const imgH = 4.3;
  const leftX = 0.8;
  const rightX = 6.79;
  const imgY = 1.95;

  s.addShape(pres.ShapeType.roundRect, {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE SEKRETARIS", {
    x: leftX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: leftX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.sekertaris)) {
    s.addImage({
      path: IMG.sekertaris,
      x: leftX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
    });
  }

  s.addShape(pres.ShapeType.roundRect, {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fill: { color: C.armyGreen },
    line: { color: C.gold, width: 1.5 },
    rectRadius: 0.06
  });
  s.addText("DASHBOARD ROLE BENDAHARA", {
    x: rightX,
    y: 1.45,
    w: imgW,
    h: 0.45,
    fontSize: 13,
    bold: true,
    color: C.goldLight,
    fontFace: FONT_MAIN,
    align: "center",
    valign: "middle"
  });

  s.addShape(pres.ShapeType.rect, {
    x: rightX - 0.05,
    y: imgY - 0.05,
    w: imgW + 0.1,
    h: imgH + 0.1,
    fill: { color: "F1F5F9" },
    line: { color: C.armyGreen, width: 2 }
  });
  if (fs.existsSync(IMG.bendahara)) {
    s.addImage({
      path: IMG.bendahara,
      x: rightX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH }
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
// SLIDE 14: PENUTUP & Q&A (DENGAN SEMBOYAN RESMI VIYATA WIRA CASANA)
// ==========================================
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

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
  path.join(BASE_DIR, "public", "ss", "LKBH_STHM_Digitalisasi_PresentasiFix.pptx"),
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

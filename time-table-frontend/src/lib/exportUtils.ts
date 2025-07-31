import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable, { CellHookData } from "jspdf-autotable";
import { DoctorWithHours } from "@/app/docTeach/docTeach.type";
import {
  ScheduledSession,
  UnscheduledSession,
} from "@/app/generateTable/generateTable.type";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
      [key: string]: any;
    };
    autoTable: (options: any) => void;
  }
}

// Arabic translations
const DAYS_ARABIC: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

const SESSION_TYPES_ARABIC: Record<string, string> = {
  theoretical: "نظري",
  practical: "عملي",
  tutorial: "تمارين",
};

// Time conversion function
export function tConvert(time: string | number): string {
  const timeString = time.toString();
  const timeMatch = timeString.match(
    /^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/
  ) || [timeString];

  if (timeMatch.length > 1) {
    const timeParts = timeMatch.slice(1);
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[2];
    const ampm = hours < 12 ? "AM" : "PM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${ampm}`;
  }

  return timeString;
}

// Helper function to format time slot
function formatTimeSlot(timeSlot: string): string {
  if (timeSlot.includes("-") || timeSlot.includes("–")) {
    const separator = timeSlot.includes("-") ? "-" : "–";
    const [startTime, endTime] = timeSlot.split(separator).map((t) => t.trim());
    if (startTime && endTime) {
      return `${tConvert(startTime)} - ${tConvert(endTime)}`;
    }
  }
  return tConvert(timeSlot);
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to get localized string
function getLocalizedString(obj: any): string {
  if (typeof obj === "string") return obj;
  if (obj && typeof obj === "object") {
    return obj.ar || obj.en || String(obj);
  }
  return String(obj);
}

export const exportToExcel = (
  timetableData: { data: { scheduled_sessions: ScheduledSession[] } },
  roomLookup: Map<string, string>,
  teacherLookup: Map<string, string>,
  filename = "timetable.xlsx",
  teachersNames?: DoctorWithHours[]
) => {
  if (!timetableData?.data?.scheduled_sessions) return;

  const assignments = timetableData.data.scheduled_sessions.map((session) => ({
    "اسم المادة": getLocalizedString(session.module_name),
    اليوم: DAYS_ARABIC[session.day] || session.day,
    الوقت: formatTimeSlot(session.time),
    القاعة:
      roomLookup.get(session.room_id) || session.room_name || session.room_id,
    النوع: SESSION_TYPES_ARABIC[session.session_type] || session.session_type,
    المدرس:
      session.session_type === "theoretical"
        ? session.doctor_name
        : session.teacher_name,
    "عدد الطلاب": session.enrollment || 0,
    حرجة: session.is_graduation_critical ? "نعم" : "لا",
  }));

  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(assignments);
  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
    { wch: 12 },
    { wch: 10 },
  ];

  utils.book_append_sheet(workbook, worksheet, "الجدول");
  writeFile(workbook, filename);
};

export const exportToPDF = async (
  timetableData: {
    data: {
      scheduled_sessions: ScheduledSession[];
      unscheduled_sessions?: UnscheduledSession[];
    };
  },
  roomLookup: Map<string, string>,
  teacherLookup: Map<string, string>,
  filename = "timetable.pdf",
  teachersNames: DoctorWithHours[]
) => {
  if (!timetableData?.data?.scheduled_sessions) {
    console.error("No timetable data available for PDF export.");
    return;
  }

  // Initialize PDF with better settings
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    floatPrecision: 16,
  }) as any;

  let fontLoaded = false;
  let arabicFontName = "NotoKufiArabic";

  try {
    // Load Arabic font
    const fontPath = "/fonts/NotoKufiArabic-Regular.ttf";
    const response = await fetch(fontPath);
    if (!response.ok)
      throw new Error(
        `Failed to fetch font: ${response.status} ${response.statusText}`
      );

    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontBuffer);
    doc.addFileToVFS("NotoKufiArabic-Regular.ttf", fontBase64);
    doc.addFont("NotoKufiArabic-Regular.ttf", arabicFontName, "normal");
    doc.addFont("NotoKufiArabic-Regular.ttf", arabicFontName, "bold");
    doc.setFont(arabicFontName, "normal");
    fontLoaded = true;
  } catch (error) {
    console.error("Error loading Arabic font:", error);
    arabicFontName = "helvetica";
    doc.setFont("helvetica");
  }

  // Start content directly without header
  let currentY = 20; // Start content 20mm from top

  // Enhanced Table Design
  const createEnhancedTable = (startY: number) => {
    const headers = [
      "اسم المادة",
      "اليوم",
      "الوقت",
      "القاعة",
      "النوع",
      "المدرس",
      "الطلاب",
      "حرجة",
    ];

    const data = timetableData.data.scheduled_sessions.map((session) => [
      getLocalizedString(session.module_name),
      DAYS_ARABIC[session.day] || session.day,
      formatTimeSlot(session.time),
      roomLookup.get(session.room_id) || session.room_name || session.room_id,
      SESSION_TYPES_ARABIC[session.session_type] || session.session_type,
      session.session_type === "theoretical"
        ? session.doctor_name
        : session.teacher_name,
      session.enrollment || 0,
      session.is_graduation_critical ? "نعم" : "لا",
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: startY,
      styles: {
        font: arabicFontName,
        fontSize: 9,
        halign: "right",
        fontStyle: "normal",
        cellPadding: 3,
        lineColor: [233, 236, 239],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        font: arabicFontName,
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "center" },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 35, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
        7: { cellWidth: 18, halign: "center" },
      },
      margin: { left: 15, right: 15 },
      theme: "grid",
      didParseCell: function (data: CellHookData) {
        const cellText = Array.isArray(data.cell.text)
          ? data.cell.text.join(" ")
          : String(data.cell.text);

        // Time column styling
        if (
          data.column.index === 2 &&
          (cellText.includes("AM") || cellText.includes("PM"))
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [0, 123, 255];
          data.cell.styles.fillColor = [232, 244, 255];
        }

        // Critical session styling
        if (data.column.index === 7 && cellText === "نعم") {
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 53, 69];
        }

        // Session type styling
        if (data.column.index === 4) {
          if (cellText.includes("نظري")) {
            data.cell.styles.fillColor = [232, 244, 255];
            data.cell.styles.textColor = [0, 123, 255];
          } else if (cellText.includes("عملي")) {
            data.cell.styles.fillColor = [255, 248, 225];
            data.cell.styles.textColor = [255, 193, 7];
          }
        }
      },
    });

    return (doc as any).lastAutoTable?.finalY + 15;
  };

  // Enhanced Unscheduled Sessions
  const createUnscheduledSessions = (startY: number) => {
    if (!timetableData.data.unscheduled_sessions?.length) return startY;

    // Always start unscheduled sessions on a new page
    doc.addPage();
    startY = 20;

    // Warning banner
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(15, startY, 267, 25, 3, 3, "F");
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(1);
    doc.roundedRect(15, startY, 267, 25, 3, 3, "D");

    // Warning icon (triangle)
    doc.setFillColor(255, 193, 7);
    doc.triangle(25, startY + 8, 30, startY + 15, 25, startY + 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(arabicFontName, "bold");
    doc.text("!", 27.5, startY + 16, { align: "center" });

    // Warning text
    doc.setTextColor(133, 77, 14);
    doc.setFontSize(16);
    doc.setFont(arabicFontName, "bold");
    doc.text(
      `الجلسات غير المجدولة (${timetableData.data.unscheduled_sessions.length})`,
      148.5,
      startY + 16,
      { align: "center" }
    );

    startY += 35;

    const unscheduledData = timetableData.data.unscheduled_sessions.map(
      (session) => [
        getLocalizedString(session.module_name),
        SESSION_TYPES_ARABIC[session.session_type] || session.session_type,
        session.is_graduation_critical ? "نعم" : "لا",
        session.enrollment || 0,
        getLocalizedString(session.teacher_name),
      ]
    );

    autoTable(doc, {
      head: [["اسم المادة", "النوع", "حرجة", "الطلاب", "المدرس"]],
      body: unscheduledData,
      startY: startY,
      styles: {
        font: arabicFontName,
        fontSize: 9,
        halign: "right",
        fillColor: [255, 252, 242],
        cellPadding: 3,
        lineColor: [255, 193, 7],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: [133, 77, 14],
        font: arabicFontName,
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "center" },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 35, halign: "center" },
      },
      margin: { left: 15, right: 15 },
      theme: "grid",
      didParseCell: function (data: CellHookData) {
        const cellText = Array.isArray(data.cell.text)
          ? data.cell.text.join(" ")
          : String(data.cell.text);

        if (data.column.index === 2 && cellText === "نعم") {
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 53, 69];
        }
      },
    });

    return (doc as any).lastAutoTable?.finalY + 15;
  };

  // Single Recommendations Table
  const createRecommendations = (startY: number) => {
    if (!timetableData.data.unscheduled_sessions?.length) return startY;

    // Collect all recommendations from all unscheduled sessions
    const allRecommendations: any[] = [];

    timetableData.data.unscheduled_sessions.forEach((session) => {
      if (session.recommendations?.length) {
        session.recommendations.forEach((rec) => {
          allRecommendations.push({
            moduleName: getLocalizedString(session.module_name),
            action: getLocalizedString(rec.action),
            details: getLocalizedString(rec.details),
            priority: rec.priority,
            type: rec.type,
          });
        });
      }
    });

    if (allRecommendations.length === 0) return startY;

    // Always start recommendations on a new page
    doc.addPage();
    startY = 20;

    // Recommendations section header
    doc.setFillColor(108, 117, 125);
    doc.roundedRect(15, startY, 267, 20, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(arabicFontName, "bold");
    doc.text(`التوصيات (${allRecommendations.length})`, 148.5, startY + 13, {
      align: "center",
    });

    startY += 25;

    // Prepare recommendations data
    const recData = allRecommendations.map((rec) => [
      rec.moduleName,
      rec.action,
      rec.details,
      rec.priority,
      rec.type,
    ]);

    autoTable(doc, {
      head: [["اسم المادة", "الإجراء", "التفاصيل", "الأولوية", "النوع"]],
      body: recData,
      startY,
      styles: {
        font: arabicFontName,
        fontSize: 7,
        halign: "right",
        fillColor: [255, 255, 255],
        cellPadding: 3,
        lineColor: [206, 212, 218],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [108, 117, 125],
        textColor: [255, 255, 255],
        font: arabicFontName,
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 45, halign: "right" },
        1: { cellWidth: 50, halign: "right" },
        2: { cellWidth: 90, halign: "right" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 35, halign: "center" },
      },
      margin: { left: 15, right: 15 },
      theme: "grid",
      didParseCell: function (data: CellHookData) {
        if (data.column.index === 3) {
          data.cell.styles.fontStyle = "bold";
          const priority = Number(data.cell.text);
          if (priority < 3) {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [220, 53, 69];
          } else if (priority < 5) {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [255, 193, 7];
          } else {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fillColor = [40, 167, 69];
          }
        }
      },
    });

    return (doc as any).lastAutoTable?.finalY + 15;
  };

  // Simple Footer with just page numbers
  const addSimpleFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(108, 117, 125);
      doc.setFontSize(8);
      doc.setFont(arabicFontName, "normal");
      doc.text(`${i}`, 148.5, 200, { align: "center" });
    }
  };

  // Generate PDF
  currentY = createEnhancedTable(currentY);
  currentY = createUnscheduledSessions(currentY);
  currentY = createRecommendations(currentY);

  // Add footer to all pages
  addSimpleFooter();

  // Save PDF
  doc.save(filename);
};
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${tConvert(startTime)} - ${tConvert(endTime)}`;
};

export const getFormattedTimeSlots = (
  timetableData: { data: { scheduled_sessions: ScheduledSession[] } },
  day: string
): Array<{ original: string; formatted: string }> => {
  if (!timetableData?.data?.scheduled_sessions) return [];

  const daySessions = timetableData.data.scheduled_sessions.filter(
    (session) => session.day === day
  );

  const uniqueTimes = [...new Set(daySessions.map((session) => session.time))];

  return uniqueTimes.map((time) => ({
    original: time,
    formatted: formatTimeSlot(time),
  }));
};

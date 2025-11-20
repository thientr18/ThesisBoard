import XLSX from "xlsx";
import { z } from "zod";
import { StudentSemester } from "../models/StudentSemester";
import { sequelize } from "../models/db";
import { UniqueConstraintError } from "sequelize";

// 1. Zod validation schema
export const studentSemesterSchema = z.object({
  studentId: z.number().int().min(1),
  semesterId: z.number().int().min(1),
  gpa: z.number().min(0).max(4).nullable().optional(),
  credits: z.number().int().min(0).nullable().optional(),
  type: z.enum(["pre-thesis", "thesis", "not-registered"]),
  status: z.enum(["enrolled", "suspended", "completed"]),
});

// 2. Parse Excel file
export async function parseExcelFile(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Parse as array of objects
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
  return rows;
}

// 3. Validate rows
export function validateRows(rows: any[]) {
  const validRows: any[] = [];
  const errors: { row: number; issues: string[] }[] = [];

  rows.forEach((row, idx) => {
    // Convert string numbers if needed
    const parsedRow = {
      studentId: Number(row.studentId),
      semesterId: Number(row.semesterId),
      gpa: row.gpa !== null && row.gpa !== undefined ? Number(row.gpa) : null,
      credits: row.credits !== null && row.credits !== undefined ? Number(row.credits) : null,
      type: row.type,
      status: row.status,
    };

    const result = studentSemesterSchema.safeParse(parsedRow);
    if (result.success) {
      validRows.push(parsedRow);
    } else {
      errors.push({
        row: idx + 2, // Excel rows start at 2 (header is row 1)
        issues: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`),
      });
    }
  });

  return { validRows, errors };
}

// 4. Import to DB with transaction
export async function importStudentSemesters(rows: any[]) {
  let inserted = 0;
  let skipped = 0;
  const skippedRows: { row: number; reason: string }[] = [];

  return await sequelize.transaction(async (t) => {
    // Try bulkCreate with ignoreDuplicates
    try {
      const result = await StudentSemester.bulkCreate(rows, {
        transaction: t,
        ignoreDuplicates: true, // Only works in MySQL, MariaDB, SQLite, and PostgreSQL >= 9.5
      });
      inserted = result.length;
      skipped = rows.length - result.length;
    } catch (err: any) {
      // If ignoreDuplicates not supported, fallback to manual check
      if (err instanceof UniqueConstraintError) {
        // Fallback: insert one by one
        inserted = 0;
        skipped = 0;
        for (let i = 0; i < rows.length; i++) {
          try {
            await StudentSemester.create(rows[i], { transaction: t });
            inserted++;
          } catch (e: any) {
            if (e instanceof UniqueConstraintError) {
              skipped++;
              skippedRows.push({ row: i + 2, reason: "Duplicate studentId/semesterId" });
            } else {
              skipped++;
              skippedRows.push({ row: i + 2, reason: e.message });
            }
          }
        }
      } else {
        throw err;
      }
    }

    return {
      message: "Import completed",
      inserted,
      skipped,
      skippedRows,
      total: rows.length,
    };
  });
}
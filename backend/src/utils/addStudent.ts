import dotenv from 'dotenv';
import { sequelize } from '../models/db';
import { Student } from '../models/Student';

dotenv.config();

/**
 * Chạy ví dụ:
 * npx ts-node src/utils/addStudent.ts --userId 10 --studentId SV0010 --cohortYear 2025 --className "KTPM2025" --phone "0987654321" --dob 2005-09-15 --gender male --status active
 */

interface Args {
  [k: string]: string | undefined;
}

function parseArgs(): Args {
  const raw = process.argv.slice(2);
  const result: Args = {};
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].startsWith('--')) {
      const key = raw[i].substring(2);
      const value = raw[i + 1] && !raw[i + 1].startsWith('--') ? raw[i + 1] : 'true';
      result[key] = value;
      if (value !== 'true') i++;
    }
  }
  return result;
}

async function addStudent() {
  const args = parseArgs();

  const required = ['userId', 'studentId'];
  for (const r of required) {
    if (!args[r]) {
      console.error(`Thiếu tham số bắt buộc: --${r}`);
      process.exit(1);
    }
  }

  await sequelize.authenticate();

  const payload = {
    userId: Number(args.userId),
    studentId: String(args.studentId),
    cohortYear: args.cohortYear ? Number(args.cohortYear) : null,
    className: args.className ?? null,
    phone: args.phone ?? null,
    dob: args.dob ? new Date(args.dob) : null,
    gender: (args.gender as 'male' | 'female' | 'other') ?? null,
    status: (args.status as 'active' | 'inactive' | 'graduated') ?? 'active'
  };

  try {
    const created = await Student.create(payload);
    console.log('Student created ID:', created.id);
  } catch (e) {
    console.error('Lỗi tạo student:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  addStudent();
}

export { addStudent };
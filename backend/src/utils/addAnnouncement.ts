import dotenv from 'dotenv';
import { sequelize } from '../models/db';
import { Announcement } from '../models/Announcement';

dotenv.config();

// npx ts-node src/utils/addAnnouncement.ts --title "Thông báo chung" --content "Hệ thống sẽ bảo trì lúc 22:00 hôm nay." --pinned true --publishedByUserId 1

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

async function addAnnouncement() {
  const args = parseArgs();

  const required = ['title', 'content', 'pinned', 'publishedByUserId'];
  for (const r of required) {
    if (!args[r]) {
      console.error(`Thiếu tham số bắt buộc: --${r}`);
      process.exit(1);
    }
  }

  await sequelize.authenticate();

  let audienceFilter: object | null = null;
  if (args.audienceFilter) {
    try {
      audienceFilter = JSON.parse(args.audienceFilter);
    } catch {
      console.error('audienceFilter phải là JSON hợp lệ');
      process.exit(1);
    }
  }

  const payload = {
    title: String(args.title),
    content: String(args.content),
    audience: 'all' as const,
    pinned: args.pinned === 'true',
    audienceFilter,
    publishedByUserId: Number(args.publishedByUserId),
    visibleUntil: args.visibleUntil ? new Date(args.visibleUntil) : null
  };

  try {
    const created = await Announcement.create(payload);
    console.log('Announcement created ID:', created.id);
  } catch (e) {
    console.error('Lỗi tạo announcement:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  addAnnouncement();
}

export { addAnnouncement };
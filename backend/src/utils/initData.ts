import { setupAdmin } from './setupAdmin';
import { Semester } from '../models/Semester';

// npx ts-node src/utils/initData.ts

async function initData() {
  // Create initial semester if not exists
  const initialSemester = {
    code: '20251',
    name: 'Semester 1 - 2025',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-12-31'),
    isActive: true,
    isCurrent: true,
  };

  const [semester, created] = await Semester.findOrCreate({
    where: { code: initialSemester.code },
    defaults: initialSemester,
  });

  if (created) {
    console.log('Initial semester created.');
  } else {
    console.log('Initial semester already exists.');
  }
  
  // Setup admin user and role
  await setupAdmin();
}

if (require.main === module) {
  (async () => {
    try {
      await initData();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

export { initData };
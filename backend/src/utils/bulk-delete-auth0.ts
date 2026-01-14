import { Auth0Service } from '../services/auth0.service';

// npx ts-node src/utils/bulk-delete-auth0.ts

async function bulkDeleteAllUsers() {
  const auth0Service = new Auth0Service();
  try {
    let page = 0;
    const perPage = 100;
    let totalDeleted = 0;
    while (true) {
      const { users } = await auth0Service.getUsers(undefined, page, perPage);
      if (!users.length) break;
      for (const user of users) {
        try {
          await auth0Service.deleteUser(user.user_id);
          totalDeleted++;
          console.log(`Deleted user: ${user.user_id}`);
        } catch (err) {
          console.error(`Failed to delete user ${user.user_id}:`, err);
        }
        await new Promise(res => setTimeout(res, 200));
      }
      page++;
    }
    console.log(`Bulk delete completed. Total users deleted: ${totalDeleted}`);
  } catch (err) {
    console.error('Bulk delete failed:', err);
  }
}

if (require.main === module) {
  bulkDeleteAllUsers().then(() => process.exit(0));
}
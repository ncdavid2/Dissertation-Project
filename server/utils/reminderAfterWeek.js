import cron from 'node-cron';
import User from '../models/Users.js';
import { sendLoginReminderEmail } from '../server.js';

cron.schedule('0 9 * * *', async () => {
  console.log("Checking for inactive users...");

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const inactiveUsers = await User.find({
    lastLogin: {
      $lte: oneWeekAgo
    }
  });

  for (const user of inactiveUsers) {
    await sendLoginReminderEmail(user.email, user.username, "your course");
    console.log(`Reminder sent to ${user.email}`);
  }
});

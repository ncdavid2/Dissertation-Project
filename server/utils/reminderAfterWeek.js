import cron from 'node-cron';
import User from '../models/Users.js';
import { sendLoginReminderEmail } from '../api/graphql.js';

// '0 9 * * *' => '* * * * *' Makthe OneMinuteAgo work
cron.schedule('0 9 * * *', async () => {
  console.log("Checking for inactive users...");

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  //This is to test if the email comes after 1 Minutes
  //const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute ago

  //change the oneWeekAgo to oneMinuteAgo for testing purposes
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

const { pool } = require("../config/db");

let schedulerHandle = null;

async function processMedicationReminders() {
  const now = new Date();
  const currentTime = now.toISOString().slice(11, 16);

  const result = await pool.query(
    `
      SELECT id, user_id, medication_name, dosage, instructions, schedule_time, last_sent_at
      FROM medication_reminders
      WHERE active = TRUE
        AND to_char(schedule_time, 'HH24:MI') = $1
    `,
    [currentTime]
  );

  for (const reminder of result.rows) {
    const lastSentAt = reminder.last_sent_at ? new Date(reminder.last_sent_at) : null;
    if (lastSentAt && lastSentAt.toDateString() === now.toDateString()) {
      continue;
    }

    const dueAt = new Date(now);
    const message = `Time for ${reminder.medication_name} (${reminder.dosage}). ${reminder.instructions || "Open CarePath to review your medication plan."}`;

    await pool.query(
      `
        INSERT INTO reminder_notifications (reminder_id, user_id, title, message, due_at, sent_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'sent')
      `,
      [reminder.id, reminder.user_id, "Medication reminder", message, dueAt, dueAt]
    );

    await pool.query("UPDATE medication_reminders SET last_sent_at = $1 WHERE id = $2", [dueAt, reminder.id]);
  }
}

function startReminderScheduler() {
  if (schedulerHandle) {
    return;
  }

  schedulerHandle = setInterval(() => {
    processMedicationReminders().catch((error) => {
      console.error("Reminder scheduler failed", error);
    });
  }, 60 * 1000);
}

module.exports = {
  processMedicationReminders,
  startReminderScheduler,
};

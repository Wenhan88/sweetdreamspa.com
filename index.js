const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

// ------------------------------
// 读取配置（你用 firebase functions:config:set 设置的）
// ------------------------------
const twilioSid = functions.config().twilio.sid;
const twilioToken = functions.config().twilio.token;
const twilioPhone = functions.config().twilio.phone;

const adminEmail = functions.config().admin.email;
const adminPhone = functions.config().admin.phone;

const gmailUser = functions.config().gmail.user;
const gmailPass = functions.config().gmail.pass;

// Twilio 客户端
const smsClient = twilio(twilioSid, twilioToken);

// Gmail 邮件发送器
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

// -------------------------------------------
// 工具函数：把 date + time 转成 JS 日期对象
// -------------------------------------------
function buildDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));

  let [tp, ampm] = timeStr.split(" ");
  let [h, min] = tp.split(":").map((n) => parseInt(n, 10));

  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  return new Date(y, m - 1, d, h, min || 0, 0);
}

// ======================================================
// (1) 预约取消 → 给店主发短信 + 邮件
// ======================================================
exports.onAppointmentCancelled = functions.firestore
  .document("appointments/{id}")
  .onDelete(async (snap, context) => {
    const data = snap.data() || {};
    const name = data.name || "";
    const phone = data.phone || "";
    const date = data.date || "";
    const time = data.time || "";
    const service = data.service || "";
    const notes = data.notes || "";

    const smsText = `[SweetDream] CANCELED: ${date} ${time} (${name}) Service: ${service}`;
    const emailSubject = "Appointment Canceled - Sweet Dream Massage";
    const emailBody = `
An appointment has been canceled:

Name: ${name}
Phone: ${phone}
Service: ${service}
Date: ${date}
Time: ${time}
Notes: ${notes}
    `;

    const tasks = [];

    // 发短信给店主
    if (twilioSid && twilioToken && twilioPhone && adminPhone) {
      tasks.push(
        smsClient.messages.create({
          to: adminPhone,
          from: twilioPhone,
          body: smsText,
        })
      );
    }

    // 发 Email 给店主
    if (gmailUser && gmailPass && adminEmail) {
      tasks.push(
        transporter.sendMail({
          from: gmailUser,
          to: adminEmail,
          subject: emailSubject,
          text: emailBody,
        })
      );
    }

    return Promise.all(tasks);
  });

// ======================================================
// (2) 提前 1 小时自动短信提醒顾客
// ======================================================
exports.appointmentReminders = functions.pubsub
  .schedule("every 5 minutes")
  .timeZone("America/Los_Angeles")
  .onRun(async () => {
    const now = new Date();

    // 提醒窗口：55～65 分钟后
    const soonMin = new Date(now.getTime() + 55 * 60000);
    const soonMax = new Date(now.getTime() + 65 * 60000);

    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 86400000)
      .toISOString()
      .split("T")[0];

    const [snap1, snap2] = await Promise.all([
      db.collection("appointments").where("date", "==", today).get(),
      db.collection("appointments").where("date", "==", tomorrow).get(),
    ]);

    const docs = snap1.docs.concat(snap2.docs);

    const tasks = [];

    for (const doc of docs) {
      const data = doc.data();
      if (!data.phone) continue;

      const dt = buildDateTime(data.date, data.time);
      if (!dt) continue;

      // 是否在提醒窗口内
      if (dt >= soonMin && dt <= soonMax) {
        const msg = `[SweetDream] Reminder: Your massage appointment is at ${data.time} on ${data.date}.`;

        tasks.push(
          smsClient.messages.create({
            from: twilioPhone,
            to: data.phone,
            body: msg,
          })
        );
      }
    }

    return tasks.length ? Promise.all(tasks) : null;
  });

// ======================================================
// (3) 每日自动备份 Firestore → Cloud Storage
// ======================================================
exports.dailyBackup = functions.pubsub
  .schedule("0 3 * * *") // 每天凌晨 3:00
  .timeZone("America/Los_Angeles")
  .onRun(async () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    const fileName = `backups/${y}-${m}-${d}.json`;

    const [appointmentsSnap, reviewsSnap] = await Promise.all([
      db.collection("appointments").get(),
      db.collection("reviews").get(),
    ]);

    const appointments = appointmentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const reviews = reviewsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const jsonData = {
      createdAt: now.toISOString(),
      appointments,
      reviews,
    };

    const bucket = storage.bucket(); // 默认 bucket
    const file = bucket.file(fileName);

    await file.save(JSON.stringify(jsonData, null, 2), {
      contentType: "application/json",
    });

    return null;
  });

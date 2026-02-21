import express from "express";
import { createServer as createViteServer } from "vite";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
// In a real app, you'd use a service account key. 
// For this environment, we'll assume the environment has credentials or we use the project ID.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // 1. Admin Approval for Recharge
  app.post("/api/admin/approve-recharge", async (req, res) => {
    const { transactionId, adminUid } = req.body;
    try {
      const adminUser = await db.collection("users").doc(adminUid).get();
      if (!adminUser.exists || !adminUser.data()?.isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const txRef = db.collection("transactions").doc(transactionId);
      const txDoc = await txRef.get();
      
      if (!txDoc.exists || txDoc.data()?.status !== 'pending') {
        return res.status(400).json({ error: "Invalid transaction" });
      }

      const txData = txDoc.data();
      const userRef = db.collection("users").doc(txData?.userId);

      await db.runTransaction(async (t) => {
        t.update(txRef, { status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() });
        t.update(userRef, { 
          rechargeWallet: admin.firestore.FieldValue.increment(txData?.amount) 
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Admin Approval for Withdraw
  app.post("/api/admin/approve-withdraw", async (req, res) => {
    const { transactionId, adminUid } = req.body;
    try {
      const adminUser = await db.collection("users").doc(adminUid).get();
      if (!adminUser.exists || !adminUser.data()?.isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const txRef = db.collection("transactions").doc(transactionId);
      const txDoc = await txRef.get();
      
      if (!txDoc.exists || txDoc.data()?.status !== 'pending') {
        return res.status(400).json({ error: "Invalid transaction" });
      }

      const txData = txDoc.data();
      const userRef = db.collection("users").doc(txData?.userId);

      await db.runTransaction(async (t) => {
        t.update(txRef, { status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() });
        t.update(userRef, { 
          totalWithdraw: admin.firestore.FieldValue.increment(txData?.amount) 
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Daily Profit Distribution (Triggered by client or scheduled)
  // In a real app, this would be a Cloud Function or Cron.
  // Here we'll expose an endpoint that can be called to "sync" profits.
  app.post("/api/sync-profits", async (req, res) => {
    try {
      const activeInvestments = await db.collection("investments")
        .where("status", "==", "active")
        .get();

      const now = new Date();
      const batch = db.batch();

      for (const doc of activeInvestments.docs) {
        const inv = doc.data();
        const lastClaim = inv.lastProfitClaim.toDate();
        const diffDays = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {
          const profitToAdd = inv.dailyProfit * diffDays;
          const userRef = db.collection("users").doc(inv.userId);
          
          batch.update(doc.ref, {
            lastProfitClaim: admin.firestore.FieldValue.serverTimestamp(),
            totalEarned: admin.firestore.FieldValue.increment(profitToAdd)
          });

          batch.update(userRef, {
            mainBalance: admin.firestore.FieldValue.increment(profitToAdd)
          });

          // Check if investment is completed
          const endDate = inv.endDate.toDate();
          if (now >= endDate) {
            batch.update(doc.ref, { status: 'completed' });
          }

          // Referral Commission (5% of profit)
          const userDoc = await userRef.get();
          const userData = userDoc.data();
          if (userData?.referredBy) {
            const referrerRef = db.collection("users").where("referralCode", "==", userData.referredBy).limit(1);
            const referrerDocs = await referrerRef.get();
            if (!referrerDocs.empty) {
              const referrerDoc = referrerDocs.docs[0];
              const commission = profitToAdd * 0.05;
              batch.update(referrerDoc.ref, {
                mainBalance: admin.firestore.FieldValue.increment(commission)
              });
              
              const commTxRef = db.collection("transactions").doc();
              batch.set(commTxRef, {
                userId: referrerDoc.id,
                type: 'referral',
                amount: commission,
                status: 'approved',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                fromUser: userData.phone
              });
            }
          }
        }
      }

      await batch.commit();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

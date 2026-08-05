import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import ScheduledAudit from "./models/ScheduledAudit.js";

dotenv.config();

await connectDB();

const audits = await ScheduledAudit.find();

console.table(
  audits.map((a) => ({
    iqaNumber: a.iqaNumber,
    domain: a.domain,
    location: a.location,
    startDate: a.startDate,
    endDate: a.endDate,
  }))
);

process.exit();

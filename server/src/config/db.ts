import mongoose from "mongoose";
import dns from "node:dns";

// Forces Node.js to use Google DNS for SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connect_DB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(` ✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection Failed:", error);
    process.exit(1);
  }
};

export default connect_DB;
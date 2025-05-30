import mongoose from "mongoose";

const connection = {}

async function dbConnect() {
    if(connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    console.log(process.env.MONGODB_URI)

    try {
       const db = await mongoose.connect(process.env.MONGODB_URI || "",{})

       connection.isConnected = db.connections[0].readyState

       console.log("DB Connected Successfully")

    } catch (error) {
        console.log("Database connection failed", error);
        process.exit();
    }
}

export default dbConnect
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Reading from "@/models/Reading";

const RAMADAN_START = new Date(process.env.NEXT_PUBLIC_RAMADAN_START);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, para } = body;

    const paraNumber = Number(para);

    if (!name || paraNumber < 0.5 || paraNumber > 5) {
      return NextResponse.json(
        { message: "Invalid input. Please provide valid name and para (0.5-5)" },
        { status: 400 }
      );
    }

    // Calculate Ramadan day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(RAMADAN_START);
    startDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - startDate;
    let ramadanDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Ensure day is between 1-30
    if (ramadanDay < 1 || ramadanDay > 30) {
      ramadanDay = ((ramadanDay - 1) % 30) + 1;
    }

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ name: name.trim() });

    if (!user) {
      user = await User.create({ name: name.trim() });
    }

    // Check if already submitted today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingReading = await Reading.findOne({
      user: user._id,
      date: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    if (existingReading) {
      return NextResponse.json(
        { message: "You have already submitted for today" },
        { status: 400 }
      );
    }

    // Create reading record
    await Reading.create({
      user: user._id,
      para: paraNumber,
      ramadanDay,
    });

    // Update totalPara
    user.totalPara += paraNumber;
    await user.save();

    return NextResponse.json(
      { 
        message: "Reading saved successfully 🌙",
        data: {
          name: user.name,
          para: paraNumber,
          totalPara: user.totalPara,
          ramadanDay
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
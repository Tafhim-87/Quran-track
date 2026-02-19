import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Reading from "@/models/Reading";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');
    const name = searchParams.get('name');

    // Build query
    let query = {};
    
    if (day) {
      query.ramadanDay = parseInt(day);
    }

    // Get readings with user data
    const readings = await Reading.find(query)
      .populate('user', 'name totalPara')
      .sort({ date: -1 });

    // Filter by name if provided
    let filteredReadings = readings;
    if (name) {
      filteredReadings = readings.filter(reading => 
        reading.user.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Format the data
    const formattedData = filteredReadings.map(reading => ({
      _id: reading._id,
      name: reading.user?.name || 'Unknown',
      para: reading.para,
      totalPara: reading.user?.totalPara || 0,
      ramadanDay: reading.ramadanDay,
      date: reading.date,
      createdAt: reading.createdAt
    }));

    // Calculate summary statistics
    const summary = {
      totalParticipants: formattedData.length,
      totalParaRead: formattedData.reduce((sum, item) => sum + item.para, 0),
      uniqueParticipants: [...new Set(formattedData.map(item => item.name))].length,
      averageParaPerDay: formattedData.length > 0 
        ? (formattedData.reduce((sum, item) => sum + item.para, 0) / formattedData.length).toFixed(2)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      summary,
      count: formattedData.length
    });
  } catch (error) {
    console.error("Participants API error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || "Failed to fetch participants data" 
      },
      { status: 500 }
    );
  }
}

// Optional: GET single reading by ID
export async function GET_BY_ID(req, { params }) {
  try {
    await connectDB();
    
    const reading = await Reading.findById(params.id)
      .populate('user', 'name totalPara');

    if (!reading) {
      return NextResponse.json(
        { success: false, message: "Reading not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: reading._id,
        name: reading.user.name,
        para: reading.para,
        totalPara: reading.user.totalPara,
        ramadanDay: reading.ramadanDay,
        date: reading.date
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
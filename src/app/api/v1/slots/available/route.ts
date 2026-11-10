import { NextResponse } from "next/server";
import { getAvailableSlotsForPincode } from "@/modules/fulfillment/slots";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get("pincode") || "560038";
  const dateParam = searchParams.get("date");

  const targetDate = dateParam ? new Date(dateParam) : new Date();

  const result = await getAvailableSlotsForPincode(pincode, targetDate);

  return NextResponse.json({
    success: true,
    data: result,
  });
}


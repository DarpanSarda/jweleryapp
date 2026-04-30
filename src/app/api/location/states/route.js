import { NextResponse } from "next/server";
import { getAllStates } from "india-states-districts";

// GET all states
export async function GET() {
  try {
    const states = getAllStates();
    const statesWithCodes = states.map((state, index) => ({
      code: `ST${index}`,
      name: state
    })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(statesWithCodes);
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    );
  }
}

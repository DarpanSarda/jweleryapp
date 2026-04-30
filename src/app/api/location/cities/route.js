import { NextResponse } from "next/server";
import { getDistrictsByState } from "india-states-districts";

// GET cities by state
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter is required' },
        { status: 400 }
      );
    }

    const districts = getDistrictsByState(state);
    const sortedDistricts = districts.sort();

    return NextResponse.json(sortedDistricts);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

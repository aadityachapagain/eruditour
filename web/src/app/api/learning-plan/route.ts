import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export default async function GET(req: NextRequest) {
  try {
    const response = await axios.get('http://localhost:8000/generate-plan/');
    return Response.json(response.data);
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch learning plan' }),
      {
        status: 500
      }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post('http://localhost:8000/login/', body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Login Failed: Internal Server Error' },
      { status: 500 }
    );
  }
}
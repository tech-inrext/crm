import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Forward request to your backend API
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/v0/property?search=${search}&page=${page}&limit=${limit}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Properties API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/v0/property`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Properties API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create property' },
      { status: 500 }
    );
  }
}

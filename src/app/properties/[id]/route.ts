// app/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/v0/property/${params.id}`, {
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
    console.error('Property API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/v0/property/${params.id}`, {
      method: 'PATCH',
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
    console.error('Property API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/v0/property/${params.id}`, {
      method: 'DELETE',
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
    console.error('Property API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete property' },
      { status: 500 }
    );
  }
}



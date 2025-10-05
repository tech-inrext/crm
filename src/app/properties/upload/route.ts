import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const fileName = `property_${timestamp}_${uniqueId}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    await writeFile(filePath, buffer);

    // File URL (accessible from frontend)
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: originalName,
        fileType: file.type,
        fileSize: file.size
      },
      message: 'File uploaded successfully'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'File upload failed', error: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const expectedToken = process.env.API_BEARER_TOKEN;

        if (!expectedToken || token !== expectedToken) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.passport_number) {
            return NextResponse.json({ error: 'Passport number is required' }, { status: 400 });
        }

        const newStudent = {
            name: body.name,
            last_name: body.last_name || null,
            languages: body.languages || ['English'],
            passport_number: body.passport_number,
            country: body.country || 'N/A',
            phone: body.phone,
            size: body.size || 'N/A',
            desc: body.desc || null,
        };

        console.log('newStudent:', newStudent);

        return NextResponse.json({ success: true, data: newStudent });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Error creating student' }, { status: 500 });
    }
}

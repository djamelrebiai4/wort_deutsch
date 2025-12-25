import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_GENERATE_TEXT_WEBHOOK;

    if (!webhookUrl) {
        return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `N8N error: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to generate text from N8N' }, { status: 500 });
    }
}

// functions/submit.js
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const formData = await request.formData();
        
        // Validate inputs
        const number = formData.get('number');
        const token = formData.get('cf-turnstile-response');
        
        if (!number || !token) {
            return new Response(JSON.stringify({
                result: "FAIL",
                reason: "Missing required fields"
            }), { status: 400 });
        }

        // Verify Turnstile token
        const verifyData = new URLSearchParams();
        verifyData.append('secret', env.TURNSTILE_SECRET);
        verifyData.append('response', token);
        verifyData.append('remoteip', request.headers.get('CF-Connecting-IP'));

        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                body: verifyData
            }
        );

        const { success } = await verifyResponse.json();

        return new Response(JSON.stringify({
            result: success ? "OK" : "FAIL",
            number: parseInt(number)
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            result: "FAIL",
            reason: "Server error"
        }), { status: 500 });
    }
}

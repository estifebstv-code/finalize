export default {
    async fetch(request) {
        const url = new URL(request.url);
        const channel = url.searchParams.get("channel");

        if (!channel) {
            return new Response("Missing channel", { status: 400 });
        }

        const telegramURL = `https://t.me/s/${channel}`;

        const res = await fetch(telegramURL, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html"
            }
        });

        const html = await res.text();

        return new Response(html, {
            headers: {
                "Content-Type": "text/html",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
};

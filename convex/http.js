import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/getFile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("id");
    const name = url.searchParams.get("name") || "download";

    if (!storageId) {
      return new Response("Missing id parameter", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId);
    if (!blob) {
      return new Response("File not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", blob.type || "application/zip");
    headers.set("Content-Disposition", `attachment; filename="${name}.zip"`);
    
    // We add cache control so the browser doesn't aggressively cache old names if the name changes
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

    return new Response(blob, {
      status: 200,
      headers,
    });
  }),
});

export default http;

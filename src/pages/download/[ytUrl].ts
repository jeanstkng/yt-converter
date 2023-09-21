export const prerender = false;
import ytdl from "ytdl-core";
import type { APIRoute } from "astro";
import streamToBlob from "stream-to-blob";

export const GET: APIRoute = async ({ params }) => {
  const ytUrl: string = params.ytUrl || "";

  const responseYt: any = ytdl(ytUrl, {
    filter: "audioonly",
  });

  const blob: Blob = await streamToBlob(responseYt);

  return new Response(blob, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
};

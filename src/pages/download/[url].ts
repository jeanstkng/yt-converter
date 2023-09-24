export const prerender = false;
import type { APIRoute } from "astro";
import streamToBlob from "stream-to-blob";
import ytdl from "ytdl-core";

export const GET: APIRoute = async ({ params }) => {
  const url: string = params.url || "";

  try {
    const responseYt: any = ytdl(url, {
      filter: "audioonly",
    });

    const blob: Blob = await streamToBlob(responseYt);

    return new Response(blob, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        isError: true,
        error,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

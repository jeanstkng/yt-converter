export const prerender = false;
import type { APIRoute } from "astro";
import streamToBlob from "stream-to-blob";
import ytdl, { type Filter } from "@distube/ytdl-core";

interface ContentType {
  contentType: string;
  filter: Filter;
}

const contentType: Record<string, ContentType> = {
  audio: {
    contentType: "audio/mpeg",
    filter: "audioonly",
  },
  video: {
    contentType: "video/mp4",
    filter: "videoandaudio",
  },
};

export const GET: APIRoute = async ({ url }) => {
  const reqUrl: string = url.searchParams.get("url") || "";
  const type: string = url.searchParams.get("type") || "audio";

  try {
    const responseYt: any = ytdl(reqUrl, {
      filter: contentType[type].filter,
    });

    const blob: Blob = await streamToBlob(responseYt);

    return new Response(blob, {
      headers: {
        "Content-Type": contentType[type].contentType,
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

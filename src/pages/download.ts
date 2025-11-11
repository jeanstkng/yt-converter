export const prerender = false;
import type { APIRoute } from "astro";
import { Innertube, UniversalCache, Utils } from "youtubei.js";

interface ContentType {
  contentType: string;
  downloadType: 'audio' | 'video+audio';
  format: string;
  quality: string;
  client: string;
}

const contentType: Record<string, ContentType> = {
  audio: {
    contentType: "audio/mpeg",
    downloadType: "audio",
    format: "mp4",
    quality: "best",
    client: "ANDROID"
  },
  video: {
    contentType: "video/mp4",
    downloadType: "video+audio",
    format: "mp4",
    quality: "best",
    client: "ANDROID"
  },
};

export const GET: APIRoute = async ({ url }) => {
  const reqUrl: string = url.searchParams.get("url") || "";
  const type: string = url.searchParams.get("type") || "audio";

  if (!reqUrl) {
    return new Response(
      JSON.stringify({
        isError: true,
        error: "No URL provided",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400
      }
    );
  }

  try {
    // Create YouTube client with proper caching configuration
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });

    // First get video info to check if it's available
    const videoInfo = await yt.getInfo(reqUrl);
    
    if (!videoInfo.streaming_data) {
      return new Response(
        JSON.stringify({
          isError: true,
          error: "Video is not available for download",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400
        }
      );
    }

    // Download using the example pattern
    const stream = await yt.download(reqUrl, {
      type: contentType[type].downloadType,
      quality: contentType[type].quality,
      format: contentType[type].format,
      client: contentType[type].client as any
    });

    // Create a ReadableStream from the AsyncIterable
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of Utils.streamToIterable(stream)) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": contentType[type].contentType,
        "Content-Disposition": `attachment; filename="${videoInfo.basic_info.title || (type === 'audio' ? 'Audio' : 'Video')}.${contentType[type].format}"`
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    
    // More detailed error handling
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Check if it's a specific YouTube error
    if (error?.info?.error?.status === "FAILED_PRECONDITION") {
      errorMessage = "Video cannot be accessed due to YouTube restrictions. This may be due to age restrictions, region blocking, or other limitations.";
    } else if (error?.message?.includes("Could not find video")) {
      errorMessage = "Video not found. Please check the URL and try again.";
    } else if (error?.message?.includes("Sign in to confirm")) {
      errorMessage = "This video requires authentication. Please try a different video.";
    }
    
    return new Response(
      JSON.stringify({
        isError: true,
        error: errorMessage,
        details: error?.info || null,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500
      }
    );
  }
};

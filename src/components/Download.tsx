import { h } from "preact";
import { useState } from "preact/hooks";

const Download = () => {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isInvalidUrlId, setIsInvalidUrlId] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUrlInputChange = (event: Event) => {
    setIsInvalidUrlId(false);
    const { target } = event;
    if (target) {
      setUrlInput((target as HTMLInputElement).value);
    }
  };

  const downloadFromUrl = async () => {
    if (urlInput.length < 10) {
      setIsInvalidUrlId(true);
    }
    // Regular expression to extract the video ID
    const regex = /[?&]v=([^&]+)/;
    const match = urlInput.match(regex);

    if (match) {
      setIsLoading(true);
      const response: any = await fetch(`download/${match[1]}`);
      if (response.isError) {
        setIsInvalidUrlId(true);
        console.error(response.error);
        return;
      }
      const blobby = await response.blob();
      const urlAudio = URL.createObjectURL(blobby);

      const audioElement: HTMLAudioElement = document.createElement("audio");
      audioElement.src = urlAudio;
      audioElement.controls = true;
      audioElement.classList.add("mx-auto");
      audioElement.classList.add("mt-4");
      document.body.appendChild(audioElement);

      const downloadLink: HTMLAnchorElement = document.createElement("a");
      downloadLink.href = urlAudio;
      downloadLink.download = "YourVideo.mp3"; // Set the desired filename here
      setIsLoading(false);

      downloadLink.click();
    } else {
      setIsInvalidUrlId(true);
    }
  };

  return (
    <section class="text-center text-black grid mt-4">
      <input
        id="yt-url"
        class="rounded-md w-1/2 h-8 p-2 mx-auto text-gray-800 text-xl grid-cols-12 border-green-950 border-2"
        onChange={handleUrlInputChange}
      />
      <button
        id="download-btn"
        class="hover:bg-green-500 align-middle rounded-md w-1/4 h-14 mx-auto mt-3 mb-4 text-black font-semibold text-xl max-sm:text-sm bg-green-300 grid-cols-6 border-2 border-black"
        onClick={downloadFromUrl}
        disabled={isLoading}
      >
        <span class={`inline-block align-middle ${isLoading ? "mb-12" : "mb-2"} text-center`}>Convert</span>
        {isLoading && <div class="loader ml-4"></div>}
      </button>
      {isInvalidUrlId && (
        <div class="rounded-md bg-red-400 w-1/5 md:h-12 mx-auto sm:h-24 my-4">
          <div class="text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] md:text-lg xs:text-sm mt-2">
            The url you submitted is invalid
          </div>
        </div>
      )}
    </section>
  );
};

export default Download;

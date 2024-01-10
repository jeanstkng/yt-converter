import { h, type Ref } from "preact";
import { useRef, useState } from "preact/hooks";

const Download = () => {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isInvalidUrlId, setIsInvalidUrlId] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef: Ref<HTMLDivElement> = useRef(null);

  const handleUrlInputChange = (event: Event) => {
    setIsInvalidUrlId(false);
    const { target } = event;
    if (target) {
      setUrlInput((target as HTMLInputElement).value);
    }
  };

  const downloadFromUrl = async (isVideo: boolean) => {
    if (urlInput.length < 10) {
      setIsInvalidUrlId(true);
    }
    // Regular expression to extract the video ID
    const regex = /[?&]v=([^&]+)/;
    const match = urlInput.match(regex);

    if (match) {
      toggleDropdown();
      setIsLoading(true);
      const response: any = await fetch(
        `download?url=${match[1]}&type=${isVideo ? "video" : "audio"}`
      );
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
      downloadLink.download = isVideo ? "Video.mp4" : "Audio.mp3";
      setIsLoading(false);

      downloadLink.click();
    } else {
      setIsInvalidUrlId(true);
    }
  };

  const toggleDropdown = () => {
    if (dropdownRef.current) {
      setIsDropdownOpen(!isDropdownOpen);
      if (!isDropdownOpen) {
        dropdownRef.current["classList"].remove("hidden");
      } else {
        dropdownRef.current["classList"].add("hidden");
      }
    }
  };

  return (
    <section class="text-center text-black grid mt-4">
      <input
        id="yt-url"
        class="rounded-md w-3/4 md:w-1/2 h-8 p-2 mx-auto text-gray-800 text-xl grid-cols-12 border-green-950 border-2"
        onChange={handleUrlInputChange}
      />
      <button
        id="download-btn"
        class={`${
          !isLoading && "hover:bg-green-500"
        } align-middle rounded-md w-2/3 md:w-1/4 h-14 mx-auto mt-3 mb-1 text-black font-semibold text-xl max-sm:text-sm bg-green-300 grid-cols-6 border-2 border-black`}
        disabled={isLoading}
        onClick={toggleDropdown}
      >
        <span class={`inline-block align-middle mb-2 text-center`}>
          Convert
        </span>
        {isLoading && <div class="loader ml-4"></div>}
      </button>

      <div
        ref={dropdownRef}
        id="dropdown-menu"
        class="hidden align-middle mx-auto w-48 rounded-md shadow-lg bg-green-300 ring-1 ring-black ring-opacity-5"
        disabled={isLoading}
      >
        <div
          class="py-2 p-2"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-button"
        >
          <a
            class="flex rounded-md px-4 py-2 text-sm text-black hover:bg-green-500 active:bg-blue-100 cursor-pointer"
            role="menuitem"
            onClick={() => downloadFromUrl(false)}
          >
            MP3 - Audio
          </a>
          <a
            class="flex rounded-md px-4 py-2 text-sm text-black hover:bg-green-500 active:bg-blue-100 cursor-pointer"
            role="menuitem"
            onClick={() => downloadFromUrl(true)}
          >
            MP4 - Video
          </a>
        </div>
      </div>

      {isInvalidUrlId && (
        <div class="rounded-md bg-red-400 w-1/5 max-sm:w-1/2 max-md:h-12 mx-auto max-sm:h-24 my-4">
          <div class="text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] max-md:text-lg max-xs:text-sm my-2 px-1">
            The url you submitted is invalid
          </div>
        </div>
      )}
    </section>
  );
};

export default Download;

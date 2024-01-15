import { useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { WavesurferPlayer } from "./components/WavesurferPlayer";

const formatUrl = (url: string) => {
  return url.split("/").slice(-1)[0]; // Get the last part of the URL
};

export const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stemUrls, setSetmUrls] = useState<string[]>([]);
  const [activeStem, setActiveStem] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying((prev) => !prev);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    setActiveStem(undefined);
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/separate", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          const stemUrls: string[] = data.stems;
          setSetmUrls(stemUrls);
          setActiveStem(stemUrls[0]);
          console.log(data);
        } else {
          console.error(
            "Server responded with non-OK status:",
            response.status
          );
        }
        console.log(response);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
        {stemUrls.length > 0 && (
          <select onChange={(e) => setActiveStem(e.target.value)}>
            {stemUrls.map((url) => (
              <option key={url} value={url}>
                {formatUrl(url)}
              </option>
            ))}
          </select>
        )}
      </form>
      {activeStem && (
        <div>
          <WavesurferPlayer
            height={100}
            url={`http://127.0.0.1:8000${activeStem}`}
            onReady={onReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            dragToSeek={true}
          />
          <button onClick={onPlayPause}>{isPlaying ? "Pause" : "Play"}</button>
        </div>
      )}
    </>
  );
};

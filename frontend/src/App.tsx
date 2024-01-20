import { useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { WavesurferPlayer } from "./components/WavesurferPlayer";
import { audioToMidiAxiosInstance, separationAxiosInstance } from "./lib/axios";

const formatUrl = (url: string) => {
  return url.split("/").slice(-1)[0]; // Get the last part of the URL
};

export const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stemUrls, setSetmUrls] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [activeStem, setActiveStem] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleConvertToMidi = async () => {
    const data = {
      id: currentId,
      name: activeStem,
    };
    const response = await fetch(`http://127.0.0.1:9090/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error("Server responded with non-OK status:", response.status);
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
    setIsLoading(true);
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await separationAxiosInstance.post<{ id: string }>(
          "/separate",
          formData
        );
        setIsLoading(false);
        setCurrentId(response.data.id);
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
          <select
            onChange={(e) => setActiveStem(e.target.value)}
            value={activeStem}
          >
            {stemUrls.map((url) => (
              <option key={url} value={url}>
                {formatUrl(url)}
              </option>
            ))}
          </select>
        )}
      </form>
      {isLoading && <div>Loading...</div>}
      {activeStem && !isLoading && (
        <div>
          <WavesurferPlayer
            height={100}
            url={`http://127.0.0.1:8000/stems/${currentId}/${activeStem}`}
            onReady={onReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            dragToSeek={true}
          />
          <button onClick={onPlayPause}>{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={handleConvertToMidi}>Convert to Midi</button>
        </div>
      )}
      {currentId && (
        <button
          onClick={async () => {
            const response = await audioToMidiAxiosInstance.get<{
              files: string[];
            }>(`/files/${currentId}`);
            const { files } = response.data;
            const fullTrack = files.find((file) => file.includes("full"));

            setActiveStem(fullTrack);
            setSetmUrls(files);
          }}
        >
          Get Files
        </button>
      )}
    </>
  );
};

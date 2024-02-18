// App.tsx

import { Box, CircularProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { FileList } from "./components/FileList";
import { FileSelection } from "./components/FileSelection";
import { FileUploadForm } from "./components/FileUploadForm";
import { MenuBar } from "./components/MenuBar";
import { useRegisterSSEListener } from "./hooks/useRegisterSSEListener";
import { axiosInstance, rawAxiosInstance } from "./lib";
import { queryClient } from "./main";
import { AudioFileResponse, MidiFileResponse } from "./shared/types";

const listFilesAPI = async (): Promise<AudioFileResponse[]> => {
  const response = await axiosInstance.get<AudioFileResponse[]>("/files");
  return response.data;
};

export const App = () => {
  const [selectedFile, setSelectedFile] = useState<AudioFileResponse | null>(
    null
  );
  const [openStems, setOpenStems] = useState<{ [key: string]: boolean }>({});
  const [separationInProgress, setSeparationInProgress] =
    useState<boolean>(false);
  const [midiConversionInProgress, setMidiConversionInProgress] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery<AudioFileResponse[], Error>({
    queryKey: ["files"],
    queryFn: listFilesAPI,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const selectableFiles = useMemo(
    () => files?.filter((file) => !file.parentId && !file.stems?.length) || [],
    [files]
  );

  const handleFileSeparation = async () => {
    if (!selectedFile) return;
    setSeparationInProgress(true);
    await axiosInstance.post("/separate", { data: selectedFile.id });
  };

  const toggleMidiConversion = (fileId: string) => {
    setMidiConversionInProgress((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const handleToMidiConversion = async (fileId: string) => {
    if (midiConversionInProgress[fileId]) return;
    toggleMidiConversion(fileId);
    await axiosInstance.post("/audio-to-midi", { data: fileId });
    toggleMidiConversion(fileId);
    refetch();
  };

  const handleDownloadMidi = async (midiFile: MidiFileResponse | undefined) => {
    if (!midiFile) return;
    const response = await axiosInstance.get("signed/" + midiFile.filePath);
    const minioUrl = response.data.url;
    const minioResponse = await rawAxiosInstance.get(minioUrl, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([minioResponse.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", midiFile.name);
    document.body.appendChild(link);
    link.click();
  };

  const handleTranscribe = async (audioFile: AudioFileResponse | undefined) => {
    if (!audioFile) return;
    await axiosInstance.post("/transcribe", { data: audioFile.id });
    refetch();
  };

  const toggleStems = useCallback((fileId: string) => {
    setOpenStems((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  }, []);

  const separationHandler = useCallback(() => {
    setSeparationInProgress(false);
    queryClient.invalidateQueries({ queryKey: ["files"] });
  }, []);

  useRegisterSSEListener([
    {
      type: "separate",
      status: "done",
      callback: separationHandler,
    },
  ]);

  return (
    <Stack direction="column" sx={{ padding: 0 }}>
      <MenuBar />
      <Box p={1}>
        <FileUploadForm
          onFileUpload={() =>
            queryClient.invalidateQueries({ queryKey: ["files"] })
          }
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <FileSelection
            selectedFile={selectedFile}
            onSelectFile={(fileId: string) => {
              const file = files?.find((f) => f.id === fileId) || null;
              setSelectedFile(file);
            }}
            selectableFiles={selectableFiles}
            handleFileSeparation={handleFileSeparation}
            separationInProgress={separationInProgress}
          />
        </Stack>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <FileList
            files={files || []}
            openStems={openStems}
            toggleStems={toggleStems}
            midiConversionInProgress={midiConversionInProgress}
            handleToMidiConversion={handleToMidiConversion}
            handleDownloadMidi={handleDownloadMidi}
            handleTranscribe={handleTranscribe}
          />
        )}
      </Box>
    </Stack>
  );
};

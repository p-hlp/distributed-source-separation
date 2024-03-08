import { axiosInstance } from "../../lib";
import { TranscriptionResponse } from "../../types";

export const getTranscription = async (fileId: string) => {
  const response = await axiosInstance.get<TranscriptionResponse>(
    `/files/${fileId}/transcription`
  );
  return response.data;
};

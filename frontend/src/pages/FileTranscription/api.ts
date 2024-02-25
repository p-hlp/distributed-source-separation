import { axiosInstance } from "../../lib";
import { TranscriptionResponse } from "../../types";

export const getTranscription = async (fileId: string) => {
  const response = await axiosInstance.get<TranscriptionResponse>(
    `/file/${fileId}/transcription`
  );
  return response.data;
};

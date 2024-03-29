import { axiosInstance, rawAxiosInstance } from "../../lib";
import { AudioFileResponse, MidiFileResponse } from "../../types";
import { sanitizeFileName } from "./utils";

export const getAudioFile = async (audioFileId: string) => {
  const response = await axiosInstance.get<AudioFileResponse>(
    `/files/${audioFileId}`
  );
  return response.data;
};

export const getMidiFile = async (audioFileId: string) => {
  const response = await axiosInstance.get<MidiFileResponse>(
    `/files/${audioFileId}/midi`
  );
  return response.data;
};

export const getSignedUrl = async (filePath: string) => {
  const response = await axiosInstance.get<{ url: string }>(
    `/signed/${filePath}`
  );
  return response.data.url;
};

/**
 * Downloads a file from minio
 * @param filePath - Direct filename to the object to download
 * @param fileName - Whatever the file is named when downloading
 * @param isPresigned - Whether the fileUrl is presigned or not
 */
export const downloadFileMinio = async (
  fileUrl: string,
  fileName: string,
  isPresigned = true
) => {
  let preSignedUrl = fileUrl;
  if (!isPresigned) {
    preSignedUrl = await getSignedUrl(fileUrl);
  }

  const response = await rawAxiosInstance.get(preSignedUrl, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", sanitizeFileName(fileName));
  document.body.appendChild(link);
  link.click();
};

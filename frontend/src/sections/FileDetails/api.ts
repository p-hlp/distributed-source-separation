import { axiosInstance } from "../../lib";
import { FileInfoResponse } from "../../types";

export const getFileInfo = async (audioFileId: string) => {
  const response = await axiosInstance.get<FileInfoResponse>(
    `/files/${audioFileId}/info`
  );
  return response.data;
};

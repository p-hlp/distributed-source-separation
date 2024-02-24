import { axiosInstance } from "../../lib";
import { AudioFileResponse } from "../../types";

export const filesApi = (libraryId: string) => {
  return {
    GET_ALL: async () => {
      console.log("Fetching files for libraryId: ", libraryId);
      const res = await axiosInstance.get<AudioFileResponse[]>(
        `/api/libraries/${libraryId}/files`
      );
      return res.data;
    },
    GET: async (fileId: string) => {
      const res = await axiosInstance.get<AudioFileResponse>(
        `/api/libraries/${libraryId}/files/${fileId}`
      );
      return res.data;
    },
  };
};

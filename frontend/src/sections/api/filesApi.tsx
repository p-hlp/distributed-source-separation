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
    POST: async (formData: FormData) => {
      const res = await axiosInstance.post<AudioFileResponse>(
        `/api/libraries/${libraryId}/files`,
        formData
      );
      return res.data;
    },
    POST_CHILD: async (parentFileId: string, formData: FormData) => {
      const res = await axiosInstance.post<AudioFileResponse>(
        `/api/libraries/${libraryId}/files/${parentFileId}/children`,
        formData
      );
      return res.data;
    },
    GET_CHILDREN: async (fileId: string) => {
      const res = await axiosInstance.get<AudioFileResponse[]>(
        `/api/libraries/${libraryId}/files/${fileId}/children`
      );
      return res.data;
    },
  };
};

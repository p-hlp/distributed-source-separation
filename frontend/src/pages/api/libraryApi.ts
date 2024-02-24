import { axiosInstance } from "../../lib";
import { Library, LibraryResponse } from "../../types";

interface PostParams {
  name: string;
  description: string;
}

export const libraryApi = () => {
  return {
    GET_ALL: async () => {
      const res = await axiosInstance.get<LibraryResponse>("/api/libraries");
      return res.data;
    },
    GET: async (libraryId: string) => {
      const res = await axiosInstance.get<Library>(
        `/api/libraries/${libraryId}`
      );
      return res.data;
    },
    POST: async (params: PostParams) => {
      const res = await axiosInstance.post<Library>(`/api/libraries`, params);
      return res.data;
    },
    PUT: async (libraryId: string, params: PostParams) => {
      const res = await axiosInstance.put<Library>(
        `/api/libraries/${libraryId}`,
        params
      );
      return res.data;
    },
    DELETE: async (libraryId: string) => {
      const res = await axiosInstance.delete<Library>(
        `/api/libraries/${libraryId}`
      );
      return res.data;
    },
  };
};

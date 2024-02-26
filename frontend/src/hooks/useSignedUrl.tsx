import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib";

export const useSignedUrl = (filePath: string) => {
  const { data } = useQuery({
    queryKey: ["signedFileUrl", filePath],
    queryFn: async () => {
      const response = await axiosInstance.get<{ url: string }>(
        "signed/" + filePath
      );
      return response.data.url;
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
  return data;
};

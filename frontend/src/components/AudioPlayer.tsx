import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib";

const signedFileUrlAPI = async (filePath: string) => {
  const response = await axiosInstance.get<{ url: string }>(
    "/signed/" + filePath
  );
  return response.data.url;
};

interface Props {
  filePath: string;
}
export const AudioPlayer = ({ filePath }: Props) => {
  const { data: url, isPending } = useQuery({
    queryKey: ["signedFileUrl", filePath],
    queryFn: () => signedFileUrlAPI(filePath),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
  if (isPending) return <CircularProgress />;
  if (!url) return null;
  return <audio src={url} controls />;
};

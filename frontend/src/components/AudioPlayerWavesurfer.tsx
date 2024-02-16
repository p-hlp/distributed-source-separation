import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib";
import { WavesurferPlayer, WavesurferProps } from "./WavesurferPlayer";

const signedFileUrlAPI = async (filePath: string) => {
  const response = await axiosInstance.get<{ url: string }>(
    "/signed/" + filePath
  );
  return response.data.url;
};

interface PlayerProps {
  filePath: string;
  peaks: (Float32Array | number[])[];
  duration: number;
}

type Props = PlayerProps & WavesurferProps;

export const AudioPlayerWavesurfer = ({
  filePath,
  peaks,
  duration,
  ...rest
}: Props) => {
  const { data: url, isPending } = useQuery({
    queryKey: ["signedFileUrl", filePath],
    queryFn: () => signedFileUrlAPI(filePath),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
  if (!url) return null;
  return (
    <WavesurferPlayer
      url={url}
      peaks={peaks}
      normalize={true}
      interact={true}
      dragToSeek={true}
      fillParent
      duration={duration}
      mediaControls
      {...rest}
    />
  );
};

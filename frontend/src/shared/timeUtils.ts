export const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const milliseconds = Math.floor((durationInSeconds % 1) * 1000);
  const timeFormat = `${minutes > 0 ? minutes + ":" : ""}${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
  return minutes > 0 ? `${timeFormat}min` : `${timeFormat}s`;
};

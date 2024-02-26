export const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Number((durationInSeconds % 60).toFixed(0));
  return `${minutes}:${seconds.toString().padStart(2, "0")}min`;
};

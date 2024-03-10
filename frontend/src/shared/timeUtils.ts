export const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const milliseconds = Math.floor((durationInSeconds % 1) * 1000);

  if (minutes > 0)
    return `${minutes}:${seconds.toString().padStart(2, "0")} min`;
  return `${seconds}:${milliseconds.toString().padStart(3, "0")} s`;
};

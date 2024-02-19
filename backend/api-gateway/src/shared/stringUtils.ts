export const removeFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};

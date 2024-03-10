export const sanitizeFileName = (fileName: string) => {
  //   return name.replace(/[/\\:*?"<>|.']/g, "").replace(/_+/g, "_");
  // return name.replace(/\./g, "");
  const hasExtension = fileName.lastIndexOf(".") > 0;
  let namePart, extensionPart;

  if (hasExtension) {
    extensionPart = fileName.slice(fileName.lastIndexOf("."));
    namePart = fileName.slice(0, fileName.lastIndexOf("."));
  } else {
    namePart = fileName;
    extensionPart = ""; // No extension
  }

  namePart = namePart.replace(/\./g, "");
  return namePart + extensionPart;
};

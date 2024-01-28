export const sanitize = (fileName: string) => {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[/\\?%*:|"<>]/g, '_'); // Replace problematic filesystem characters with underscore
  };
import { useMemo } from "react";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

export const useSelectedFileId = () => {
  const fileId = useActiveFileStore.use.fileId();
  const childFileId = useActiveFileStore.use.childFileId();
  const libraryId = useActiveLibraryStore.use.libraryId();

  const selectedFileId = useMemo(() => {
    return childFileId ?? fileId;
  }, [fileId, childFileId, libraryId]);

  return { mainFileId: fileId, childFileId, selectedFileId };
};

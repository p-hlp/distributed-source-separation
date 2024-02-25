import { useMemo } from "react";
import { useActiveFileStore } from "../store/activeFileStore";

export const useSelectedFileId = () => {
  const fileId = useActiveFileStore.use.fileId();
  const childFileId = useActiveFileStore.use.childFileId();

  const selectedFileId = useMemo(() => {
    return childFileId ?? fileId;
  }, [fileId, childFileId]);

  return { mainFileId: fileId, childFileId, selectedFileId };
};

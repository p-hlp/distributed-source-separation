import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

export const ErrorComponent = () => {
  const navigate = useNavigate();
  const resetLibrary = useActiveLibraryStore.use.resetLibrary();
  const resetFile = useActiveFileStore.use.resetFile();
  const resetChildFile = useActiveFileStore.use.resetChildFile();

  useEffect(() => {
    resetLibrary();
    resetFile();
    resetChildFile();
    navigate({ to: "/" });
  }, [navigate, resetLibrary, resetFile, resetChildFile]);

  return null;
};

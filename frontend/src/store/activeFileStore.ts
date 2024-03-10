import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./utils";

interface ActiveFileState {
  fileId: string | undefined;
  childFileId: string | undefined;
  setFile: (id: string | undefined) => void;
  resetFile: () => void;
  setChildFile: (id: string) => void;
  resetChildFile: () => void;
}

const useActiveFileStoreBase = create<ActiveFileState>()(
  devtools(
    persist(
      (set) => ({
        fileId: undefined as string | undefined,
        childFileId: undefined as string | undefined,
        setFile: (id) => set({ fileId: id }),
        setChildFile: (id) => set({ childFileId: id }),
        resetFile: () => set({ fileId: undefined }),
        resetChildFile: () => set({ childFileId: undefined }),
      }),
      { name: "file-storage" }
    )
  )
);

export const useActiveFileStore = createSelectors(useActiveFileStoreBase);

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./utils";

interface ActiveFileState {
  fileId: string | undefined;
  setFile: (id: string) => void;
  resetFile: () => void;
}

const useActiveFileStoreBase = create<ActiveFileState>()(
  devtools(
    persist(
      (set) => ({
        fileId: undefined as string | undefined,
        setFile: (id) => set({ fileId: id }),
        resetFile: () => set({ fileId: undefined }),
      }),
      { name: "file-storage" }
    )
  )
);

export const useActiveFileStore = createSelectors(useActiveFileStoreBase);

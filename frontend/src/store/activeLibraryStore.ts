import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./utils";

interface ActiveLibraryState {
  libraryId: string | undefined;
  setLibrary: (id: string) => void;
  resetLibrary: () => void;
}

const useActiveLibraryStoreBase = create<ActiveLibraryState>()(
  devtools(
    persist(
      (set) => ({
        libraryId: undefined as string | undefined,
        setLibrary: (id) => set({ libraryId: id }),
        resetLibrary: () => set({ libraryId: undefined }),
      }),
      {
        name: "library-storage",
      }
    )
  )
);

export const useActiveLibraryStore = createSelectors(useActiveLibraryStoreBase);

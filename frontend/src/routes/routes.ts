import { createRootRoute, createRoute } from "@tanstack/react-router";
import { IndexComponent } from "./IndexComponent";
import { LibraryComponent, LibraryErrorComponent } from "./LibraryComponent";
import { RootComponent, RootErrorComponent } from "./RootComponent";

export const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

export const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$libraryId",
  component: LibraryComponent,
  errorComponent: LibraryErrorComponent,
});

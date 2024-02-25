import { createRootRoute, createRoute } from "@tanstack/react-router";
import { ErrorComponent } from "./ErrorComponent";
import { IndexComponent } from "./IndexComponent";
import { LibraryComponent } from "./LibraryComponent";
import { RootComponent } from "./RootComponent";

export const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorComponent,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
  errorComponent: ErrorComponent,
});

export const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$libraryId",
  component: LibraryComponent,
  errorComponent: ErrorComponent,
});

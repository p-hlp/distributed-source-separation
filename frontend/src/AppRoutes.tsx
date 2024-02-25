import { withAuthenticationRequired } from "@auth0/auth0-react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { indexRoute, libraryRoute, rootRoute } from "./routes";

const routeTree = rootRoute.addChildren([indexRoute, libraryRoute]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
});

const ProtectedRoutes = () => {
  return <RouterProvider router={router} />;
};

export const AppRoutes = withAuthenticationRequired(ProtectedRoutes);

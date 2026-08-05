import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute(
  "/creator-dashboard",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/creator-studio",
    });
  },
});
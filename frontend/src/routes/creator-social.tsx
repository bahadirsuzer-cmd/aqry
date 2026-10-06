import { createFileRoute, Navigate } from "@tanstack/react-router";

// Keep existing bookmarks working; publishing profiles are the canonical connection UI.
export const Route = createFileRoute("/creator-social")({ component: CreatorSocialPage });
function CreatorSocialPage() { return <Navigate to="/creator-publish" replace />; }

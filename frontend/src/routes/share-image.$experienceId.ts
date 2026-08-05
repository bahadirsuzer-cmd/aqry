import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/services/supabase";

export const Route = createFileRoute(
  "/share-image/$experienceId",
)({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { experienceId } = params;

        const { data, error } =
          await supabase
            .from("experience_share_assets")
            .select("square_url")
            .eq(
              "experience_id",
              experienceId,
            )
            .maybeSingle();

        if (
          error ||
          !data?.square_url
        ) {
          return new Response(
            "Share image not found",
            {
              status: 404,
            },
          );
        }

        const imageResponse =
          await fetch(
            data.square_url,
          );

        if (!imageResponse.ok) {
          return new Response(
            "Share image could not be loaded",
            {
              status: 502,
            },
          );
        }

        const body =
          await imageResponse.arrayBuffer();

        return new Response(
          body,
          {
            status: 200,
            headers: {
              "Content-Type":
                "image/png",
              "Cache-Control":
                "public, max-age=3600",
            },
          },
        );
      },
    },
  },
});
import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/services/supabase";

export const Route = createFileRoute(
  "/share/$experienceId",
)({
  loader: async ({ params }) => {
    const { experienceId } = params;

    const { data: experience } =
      await supabase
        .from("experiences")
        .select(
          `
            id,
            title,
            description
          `,
        )
        .eq("id", experienceId)
        .maybeSingle();

    const { data: assets } =
      await supabase
        .from("experience_share_assets")
        .select("square_url")
        .eq(
          "experience_id",
          experienceId,
        )
        .maybeSingle();

    return {
      experienceId,
      title:
        experience?.title ??
        "AQRYO Experience",
      description:
        experience?.description ??
        "Bu Experience'ı AQRYO'da keşfet.",
      imageUrl:
        assets?.square_url ?? null,
    };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: "AQRYO",
          },
          {
            name: "description",
            content: "AQRYO Experience",
          },
        ],
      };
    }

    const {
      experienceId,
      title,
      description,
      imageUrl,
    } = loaderData;

    const url =
      `https://www.aqryo.com/share/${experienceId}`;

    const meta = [
      {
        title: `${title} | AQRYO`,
      },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: url,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: title,
      },
      {
        name: "twitter:description",
        content: description,
      },
    ];

    if (imageUrl) {
      meta.push(
        {
          property: "og:image",
          content: imageUrl,
        },
        {
          property: "og:image:secure_url",
          content: imageUrl,
        },
        {
          property: "og:image:type",
          content: "image/png",
        },
        {
          property: "og:image:width",
          content: "1080",
        },
        {
          property: "og:image:height",
          content: "1080",
        },
        {
          property: "og:image:alt",
          content: title,
        },
        {
          name: "twitter:image",
          content: imageUrl,
        },
      );
    }

    return {
      meta,
    };
  },

  component: ShareRedirectPage,
});

function ShareRedirectPage() {
  const { experienceId } =
    Route.useLoaderData();

  useEffect(() => {
    window.location.replace(
      `/experience/${experienceId}`,
    );
  }, [experienceId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-muted-foreground">
        AQRYO Experience açılıyor...
      </p>
    </div>
  );
}
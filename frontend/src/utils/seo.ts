export interface SeoMetadataInput {
  title: string;
  description: string;
  canonicalPath?: string;
  imageUrl?: string | null;
  noIndex?: boolean;
}

const DEFAULT_SITE_NAME = "AQRYO";

function getPublicAppUrl() {
  const configured =
    import.meta.env
      .VITE_PUBLIC_APP_URL as
      | string
      | undefined;

  return (
    configured?.replace(
      /\/+$/,
      "",
    ) ||
    window.location.origin
  );
}

function ensureMeta(
  selector: string,
  attributes: Record<
    string,
    string
  >,
) {
  let element =
    document.head.querySelector(
      selector,
    ) as HTMLMetaElement | null;

  if (!element) {
    element =
      document.createElement(
        "meta",
      );

    for (const [
      key,
      value,
    ] of Object.entries(
      attributes,
    )) {
      element.setAttribute(
        key,
        value,
      );
    }

    document.head.appendChild(
      element,
    );
  }

  return element;
}

function setMetaName(
  name: string,
  content: string,
) {
  const element =
    ensureMeta(
      `meta[name="${name}"]`,
      {
        name,
      },
    );

  element.setAttribute(
    "content",
    content,
  );
}

function setMetaProperty(
  property: string,
  content: string,
) {
  const element =
    ensureMeta(
      `meta[property="${property}"]`,
      {
        property,
      },
    );

  element.setAttribute(
    "content",
    content,
  );
}

function setCanonical(
  href: string,
) {
  let element =
    document.head.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;

  if (!element) {
    element =
      document.createElement(
        "link",
      );
    element.rel =
      "canonical";
    document.head.appendChild(
      element,
    );
  }

  element.href = href;
}

export function applySeoMetadata(
  input: SeoMetadataInput,
) {
  const appUrl =
    getPublicAppUrl();

  const title =
    `${input.title} | ${DEFAULT_SITE_NAME}`;

  const canonical =
    input.canonicalPath
      ? `${appUrl}${
          input.canonicalPath.startsWith(
            "/",
          )
            ? input.canonicalPath
            : `/${input.canonicalPath}`
        }`
      : window.location.href;

  document.title = title;

  setMetaName(
    "description",
    input.description,
  );

  setMetaName(
    "robots",
    input.noIndex
      ? "noindex,nofollow"
      : "index,follow",
  );

  setMetaProperty(
    "og:site_name",
    DEFAULT_SITE_NAME,
  );

  setMetaProperty(
    "og:title",
    title,
  );

  setMetaProperty(
    "og:description",
    input.description,
  );

  setMetaProperty(
    "og:type",
    "website",
  );

  setMetaProperty(
    "og:url",
    canonical,
  );

  setMetaName(
    "twitter:card",
    input.imageUrl
      ? "summary_large_image"
      : "summary",
  );

  setMetaName(
    "twitter:title",
    title,
  );

  setMetaName(
    "twitter:description",
    input.description,
  );

  if (input.imageUrl) {
    setMetaProperty(
      "og:image",
      input.imageUrl,
    );

    setMetaName(
      "twitter:image",
      input.imageUrl,
    );
  }

  setCanonical(canonical);
}
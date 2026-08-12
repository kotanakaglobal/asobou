import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asobou",
    short_name: "Asobou",
    description: "みんなの空きと、やりたいを合わせて、次の遊びを決めよう。",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdfb",
    theme_color: "#ff7a45",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

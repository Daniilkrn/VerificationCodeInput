import type { SVGProps } from "react";

/** Добавляй сюда ключи и соответствующие `case` в `svgSprite`. */
export type SvgSpriteName = "done" | "reject";

/** Пропсы корневого `<svg>` без `children` (задаются внутри `switch`). */
export type SvgSpriteOptions = Omit<SVGProps<SVGSVGElement>, "children">;

export function svgSprite(
  name: SvgSpriteName,
  options?: SvgSpriteOptions,
): JSX.Element {
  const common: SVGProps<SVGSVGElement> = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    width: 24,
    height: 24,
    ...options,
  };

  switch (name) {
    case "done":
      return (
        <svg {...common}>
          <path
            d="M5 14L8.23309 16.4248C8.66178 16.7463 9.26772 16.6728 9.60705 16.2581L18 6"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      );
    case "reject":
      return (
        <svg {...common}>
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2}
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2}
          />
        </svg>
      );
  }
}

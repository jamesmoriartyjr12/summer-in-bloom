import Image from "next/image";

type PortfolioImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders portfolio photos with the bottom-left brand watermark cropped out.
 * Images are pre-processed, but this clip guard handles cache staleness too.
 */
export function PortfolioImage({ src, alt, sizes, priority }: PortfolioImageProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover max-w-none w-[128%] h-[120%] -left-[18%] -top-[1%]"
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    </div>
  );
}

import Image from "next/image";
import { BagMock } from "./BagMock";

type Props = {
  imageUrl?: string;
  name: string;
  sticker: { text: string; color: string };
};

export function ProductImage({ imageUrl, name, sticker }: Props) {
  if (imageUrl) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div className="w-[72%] -rotate-2">
      <BagMock label={name} sticker={sticker} />
    </div>
  );
}

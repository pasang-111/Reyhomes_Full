import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

type Props = {
  title: string;
  thumbnail: string;
  youtube: string;
};

export default function VideoCard({ title, thumbnail, youtube }: Props) {
  return (
    <Link href={youtube} target="_blank" className="group block">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative h-[280px]">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0F1C2E]/40 transition group-hover:bg-[#0F1C2E]/65" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#F8F5F0]/20 bg-[#F8F5F0]/10 backdrop-blur-xl shadow-2xl transition duration-500 group-hover:scale-110 group-hover:bg-[#F8F5F0] group-hover:border-[#F8F5F0]">
            <Play
              fill="currentColor"
              className="ml-1 h-7 w-7 text-[#F8F5F0] group-hover:text-[#0F1C2E]"
            />
          </div>
        </div>
      </div>

      <h3 className="mt-5 text-xl font-medium text-[#F8F5F0]/85 transition group-hover:text-[#F8F5F0]">
        {title}
      </h3>
    </Link>
  );
}
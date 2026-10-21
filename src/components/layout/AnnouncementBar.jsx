"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { announcements } from "@/data/menu";

export default function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-announce text-white text-[13px] uppercase tracking-[0.2em] py-2.5">
      {mounted ? (
        <Swiper
          modules={[Autoplay]}
          loop={announcements.length > 1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          allowTouchMove={false}
          className="announce-swiper"
        >
          {announcements.map((text) => (
            <SwiperSlide key={text} className="text-center">
              {text}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="text-center">{announcements[0]}</div>
      )}
    </div>
  );
}
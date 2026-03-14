import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { supabase } from '../lib/supabase';

export default function BannerSlider() {
  const [banners, setBanners] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase.from('banners').select('*');
        if (error) throw error;
        setBanners(data || []);
      } catch (error) {
        console.error('Failed to fetch banners', error);
      }
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="rounded-3xl overflow-hidden glass-glow mx-4 my-6 relative shadow-2xl">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        className="w-full aspect-[21/9] rounded-3xl"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="relative w-full h-full cursor-pointer"
              onClick={() => banner.link && navigate(banner.link)}
            >
              <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

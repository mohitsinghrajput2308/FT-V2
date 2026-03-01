// Videos are served from the Supabase Storage CDN.
// This improves clone speed and removes the need to store 300MB of assets in the repo.

const CDN_BASE_URL = 'https://eocagbloalvidegyxvpv.supabase.co/storage/v1/object/public/assets';

export const VIDEO_URLS = {
  heroBg: `${CDN_BASE_URL}/hero_bg_new.mp4`,
  chipBg: `${CDN_BASE_URL}/chip_01.mp4`,
  showcaseBg: `${CDN_BASE_URL}/showcase_bg.mp4`,
};

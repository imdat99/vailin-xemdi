import { Theme } from "./Types";

export const defaultTheme: Theme = "light" as const;
export const storageThemeKey = "Xemdi-movie-theme";
export const storageTimeKey = "Xemdi-movie-time";
export const imageCdn = "https://apii.online/image/ophim";
export const APP_DOMAIN_CDN_IMAGE = "https://img.ophim.live";
export const searchRegex = /[?&]keyword=([^&]+)/;
export enum ImageTypes {
    poster = "poster",
    thumb = "thumb",
}
export const menuList = [
    {
        name: "Phim Rạp",
        link: "/index.php/vod/type/id/1.html",
        icon: "/images/dy.svg",
    },
    {
        name: "Phim bộ",
        link: "/index.php/vod/type/id/3.html",
        icon: "/images/zy.svg",
    },
    {
        name: "TV Seri",
        link: "/index.php/vod/type/id/2.html",
        icon: "/images/tv.svg",
    },
    {
        name: "Hoạt hình",
        link: "/index.php/vod/type/id/4.html",
        icon: "/images/dm.svg",
    },
]
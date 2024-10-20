import { PassThrough } from "stream";
export const isClient = typeof window !== "undefined"
export function minifyJavaScript(jsCode: string = ''): string {
    return jsCode
        .replace(/\s*\/\/.*$/gm, '') // Loại bỏ comment dòng
        .replace(/\s*\/\*[\s\S]*?\*\//g, '') // Loại bỏ comment block
        .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng bằng một khoảng trắng
        .replace(/(\s*([{};:])\s*)/g, '$2') // Loại bỏ khoảng trắng quanh dấu ngoặc và dấu ;
        .trim(); // Loại bỏ khoảng trắng đầu và cuối
}
export function getStringFromPassThrough(passThroughStream: PassThrough): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        passThroughStream?.on("data", (chunk) => {
            data += chunk?.toString(); // Chuyển chunk thành chuỗi và cộng dồn
        });
        passThroughStream.on('end', () => {
            resolve(data); // Trả về chuỗi sau khi stream hoàn thành
        });
        passThroughStream.on('error', (err) => {
            reject(err); // Nếu có lỗi, reject Promise
        });
    });
}
export function setCookie(name: string, value: string, days: number = 365) {
    if(isClient) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }   
}
export function getCookie(name: string): string {
    if(!isClient) return "" // if not client return empty string
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}
export const parseParams = (requestUrl: string) => {
    const params = new URL(requestUrl).searchParams
    const obj: Record<string, any> = {}
    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            if (params.get(key) !== 'undefined') {
                obj[key] = params.getAll(key)
            }
        } else {
            if (params.get(key) !== 'undefined') {
                obj[key] = params.get(key)
            }
            if (typeof params.get(key) === 'boolean') {
                obj[key] = params.get(key)
            }
            if (params.get(key) === 'false' || params.get(key) === 'true') {
                obj[key] = JSON.parse(params.get(key) as any)
            }
        }
    }
    return obj
}
export const repairUrl = (url: string) => {
    if (!url.includes('http')) {
        url = `http://${url}`
    }
    return url.replace(/\/\//g, '/')
            .replace('http:/', 'http://')
            .replace('https:/', 'https://')
}
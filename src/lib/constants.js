import packageJson from "../../package.json";

export const APP_NAME = "Soseki";
export const APP_VERSION = `v${packageJson.version}`;
export const APP_AUTHOR = packageJson.author || "Ayush Solanki";
export const APP_AUTHOR_URL = "https://ayushsolanki.site";
export const APP_GITHUB_URL = packageJson.repository?.url || "https://github.com/ayushsolanki29/soseki";

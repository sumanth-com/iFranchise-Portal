/** Local development only — never used in production. */
export const DEV_AUTO_LOGIN = {
  email: "sumanth.reddy@ifranchise.in",
  password: "Sumanth@123",
} as const;

export function isDevAutoLoginEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

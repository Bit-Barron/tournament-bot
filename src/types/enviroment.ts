declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      ADMIN_ROLE: string;
    }
  }
}

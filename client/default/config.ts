interface Config {
    BACKEND_URL: string;
  }
  
const config: Config = {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/graphql",
};
  
export default config;
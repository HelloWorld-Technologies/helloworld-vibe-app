type Env = "staging" | "production";

const shared = {
  APP_VERSION_IOS: "v4.9.2",
  APP_VERSION_ANDROID: "v4.9.2",
  S3_IMAGE_BUCKET_BASE_URL: "https://images.thehelloworld.com/",
  /** Dev-only HTTP curl logs. Flip to `false` to silence them. */
  LOG_HTTP_CURL: false,
};

const configs = {
  staging: {
    ...shared,
    // BASE_URL: "https://89c4f24dba03.ngrok-free.app",
    // BASE_URL: "http://localhost:3000",
    BASE_URL: "https://apistaging.thehelloworld.com",
    PUBLIC_URL: "https://staging.thehelloworld.com",
    env: "staging" as const,
  },
  production: {
    ...shared,
    BASE_URL: "https://api.thehelloworld.com",
    PUBLIC_URL: "https://thehelloworld.com",
    env: "production" as const,
  },
};

/** Switch app environment here. */
// const env: Env = "production";
const env: Env = "production";

export default configs[env];

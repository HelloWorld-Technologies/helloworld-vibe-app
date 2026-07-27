const config = () => {
  return {
    APP_VERSION_IOS: "v4.9.2",
    APP_VERSION_ANDROID: "v4.9.2",
    // BASE_URL: "https://89c4f24dba03.ngrok-free.app",
    // BASE_URL: "http://localhost:3000",
    // BASE_URL: "https://api.thehelloworld.com",
    BASE_URL: "https://apistaging.thehelloworld.com",
    S3_IMAGE_BUCKET_BASE_URL: "https://images.thehelloworld.com/",
    PUBLIC_URL: "https://thehelloworld.com",
    // KYC_IMAGE_BASE_URL: process.env.KYC_IMAGE_BASE_URL,
    // env: "production",
    env: "production",
  };
};

export default config();

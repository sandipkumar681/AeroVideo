export const healthCheckJob = async (): Promise<void> => {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  console.log(`${timestamp} - Everything is fine ✅`);
};

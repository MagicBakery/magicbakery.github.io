// qsdk.js
const QuestSDK = {
  // 1. Initialize the SDK with the user's specific configuration
  init(config) {
    if (!config || !config.API_URL) {
      console.error("QuestSDK Error: API_URL is required inside init().");
      return;
    }
    this.apiUrl = config.API_URL;
  }
};
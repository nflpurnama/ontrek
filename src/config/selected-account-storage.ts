import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_ACCOUNT_KEY = "@ontrek:selected_account_id";

export const selectedAccountStorage = {
  async save(accountId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
    } catch (error) {
      console.error("Error saving selected account:", error);
      throw error;
    }
  },

  async get(): Promise<string | null> {
    try {
      const accountId = await AsyncStorage.getItem(SELECTED_ACCOUNT_KEY);
      return accountId;
    } catch (error) {
      console.error("Error getting selected account:", error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SELECTED_ACCOUNT_KEY);
    } catch (error) {
      console.error("Error clearing selected account:", error);
      throw error;
    }
  },
};

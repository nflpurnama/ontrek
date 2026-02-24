import { Vendor } from "@/src/domain/entities/vendor";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export function VendorInput({
  query,
  setQuery,
  suggestions,
  setSuggestions,
  setVendor
}: {
  query: string;
  setQuery: (input: string) => void;
  suggestions: Vendor[];
  setSuggestions: (input: Vendor[]) => void;
  setVendor: (input: Vendor | null) => void
}) {
  const [isFocused, setIsFocused] = useState(false);

  const shouldShowSuggestions =
  isFocused && suggestions?.length > 0 && query?.length > 0;

  const handleVendorSelect = (input: Vendor) => {
    setQuery(input.name);
    setIsFocused(false);
    setSuggestions([]);
    setVendor(input);
  };

  const handleTyping = (input: string) => {
    setQuery(input);
    setVendor(null)
  }

  if (
    suggestions.length === 1 &&
    suggestions[0].name.toLowerCase() === query.toLowerCase()
  ) {
    setSuggestions([]);
  }

  return (
    <View>
      {shouldShowSuggestions && (
        <View style={styles.dropdown}>
          {suggestions.map((vendor: Vendor) => (
            <TouchableOpacity
              key={vendor.id.getValue()}
              onPress={() => handleVendorSelect(vendor)}
              style={styles.item}
            >
              <Text>{vendor.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        placeholder="Where/who did you purchase from? (ex: Sigmamart)"
        value={query}
        onChangeText={handleTyping}
        style={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#888",
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
  },
  dropdown: {
    position: "absolute",
    top: 52, // input height + spacing
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

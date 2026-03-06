import { Vendor } from "@/src/domain/entities/vendor";
import { Ref, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TextInputProps,
} from "react-native";

export type VendorInputData =
{
  vendorName: string;
  vendor: Vendor | null;
};

type VendorInputProps =
TextInputProps
& {ref: Ref<TextInput>}
& {
  vendorSuggestions: Vendor[];
  handleSelect: (input: Vendor | null) => void;
  handleSearch: (query: string) => void;
  setVendorName: (query: string) => void;
  vendorName: string;
}

export function VendorInput({
  vendorSuggestions,
  handleSelect,
  handleSearch,
  setVendorName,
  vendorName,
  ref,
  ...props
}: VendorInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Vendor[]>(vendorSuggestions);

  useEffect(() => {
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsFocused(false);
    });

    return () => {
      hideSub.remove();
    };
  }, []);

  const handleVendorSelect = (input: Vendor) => {
    setIsFocused(false);
    setVendorName(input.name);
    handleSelect(input);
  };

  useEffect(() => {
    setSuggestions(vendorSuggestions);
  }, [vendorSuggestions]);

  useEffect(() => {
    const id = setTimeout(() => {
      handleSearch(vendorName);
    }, 300);

    return () => clearTimeout(id);
  }, [vendorName, handleSearch]);

  const shouldShowSuggestions =
    isFocused &&
    suggestions?.length > 0 &&
    vendorName?.length > 0 &&
    vendorName !== suggestions[0].name;

  const handleTyping = (input: string) => {
    setIsFocused(true);
    setVendorName(input);
  };

  return (
    <View>
      {shouldShowSuggestions && (
        <View style={styles.dropdown}>
          {[suggestions[0]].map((vendor: Vendor) => (
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
        ref={ref}
        value={vendorName}
        onChangeText={handleTyping}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
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
    // backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    // elevation: 2,
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

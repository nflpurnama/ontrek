import { Vendor } from "@/src/domain/entities/vendor";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export function VendorInput(props: {
  query: string;
  setQuery: (input: string) => void;
  vendorSuggestions: Vendor[];
  setVendorSuggestions: (input: Vendor[]) => void;
  isLoading: boolean;
}) {
    console.log("Query", props.query);
    console.log("Result", props.vendorSuggestions);

  return (
    <View>
      <TextInput
        placeholder="Vendor"
        value={props.query}
        onChangeText={props.setQuery}
        style={styles.input}
      />

      {(props.isLoading || props.vendorSuggestions.length > 0) && (
        <View style={styles.dropdown}>
          {props.isLoading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            props.vendorSuggestions.map((vendor: Vendor) => (
              <TouchableOpacity
                key={vendor.id.getValue()}
                onPress={() => {
                  props.setQuery(vendor.name);
                  props.setVendorSuggestions([]);
                }}
                style={styles.item}
              >
                <Text>{vendor.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
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

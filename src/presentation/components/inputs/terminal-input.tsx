import { ReactNode } from "react";
import {View, Text, StyleSheet} from "react-native";

type TerminalInputProps = {
  prompt: string,
  showPrompt?: boolean,
  children: ReactNode
}

const TerminalInput = ({prompt, showPrompt, children}: TerminalInputProps) => {
  return (
  <View style={styles.row}>
    <Text style={!showPrompt && styles.hidden}>{prompt}</Text>
    {children}
  </View>)
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row"
  },
  hidden: {
    display: "none"
  }
});

export default TerminalInput
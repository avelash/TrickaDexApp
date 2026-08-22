import React from "react";
import { Image, StyleSheet, View } from "react-native";

/**
 * Shown while startup work runs. Rendering this instead of null means a slow or
 * hung boot looks like the app loading rather than a blank white screen.
 */
export const AppSplash: React.FC = () => (
  <View style={styles.container}>
    <Image
      source={require("../../assets/app_icon_round.png")}
      style={styles.icon}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { width: 140, height: 140 },
});

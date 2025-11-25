import ProfileContainer from "@/components/ProfileContainer";
import Screen from "@/components/Screen";
import { getAuthState } from "@/store/auth";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const { profile } = useSelector(getAuthState);

  return (
    <Screen>
      <View style={styles.container}>
        <ProfileContainer profile={profile} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

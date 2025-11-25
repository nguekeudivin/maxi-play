import Screen from "@/components/Screen";
import PublicProfileContainer from "@/components/profile/PublicProfileContainer";
import { useFetchPublicProfile } from "@/hooks/query";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PublicProfileScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { data } = useFetchPublicProfile(profileId);

  return (
    <Screen>
      <View style={styles.container}>
        <PublicProfileContainer profile={data} />
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

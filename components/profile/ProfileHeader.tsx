import { getAuthState } from "@/store/auth";
import AvatarField from "@/ui/AvatarField";
import colors from "@/utils/colors";
import { Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function ProfileHeader() {
  const { profile } = useSelector(getAuthState);
  const router = useRouter();

  if (!profile) return null;

  return (
    <View style={styles.header}>
      {/* Avatar + Infos */}
      <View style={styles.profileInfo}>
        <AvatarField source={profile.avatar} />

        <View style={styles.infoContainer}>
          <Text style={styles.profileName}>{profile.name}</Text>

          <View style={styles.flexRow}>
            <Text style={styles.email}>{profile.email}</Text>
            <Octicons
              name={profile.verified ? "verified" : "unverified"}
              size={16}
              color={colors.SECONDARY}
              style={{ marginLeft: 5 }}
            />
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statText}>{profile.followers} Followers</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{profile.followings} Followings</Text>
          </View>
        </View>
      </View>

      {/* Bouton Settings en haut à droite */}
      <Pressable
        onPress={() => {
          router.push("/settings");
        }}
        style={styles.settingsButton}
        hitSlop={10} // zone de toucher plus large
      >
        <Octicons name="gear" size={26} color={colors.CONTRAST} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingTop: 20,
  },
  profileInfo: {
    flexDirection: "row",
    flex: 1,
  },
  infoContainer: {
    marginLeft: 16,
    justifyContent: "center",
  },
  profileName: {
    color: colors.CONTRAST,
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    color: colors.CONTRAST,
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  statText: {
    color: colors.CONTRAST,
    fontSize: 15,
    fontWeight: "600",
  },
  settingsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    paddingLeft: 8,
    top: -10,
    backgroundColor: colors.OVERLAY,
    justifyContent: "center",
    alignItems: "center",
    // Optionnel : petite ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

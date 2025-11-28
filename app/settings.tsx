// app/(profile)/ProfileSettings.tsx ou screens/ProfileSettings.tsx
import catchAsyncError from "@/api/catchError";
import { getClient } from "@/api/client";
import AppHeader from "@/components/AppHeader";
import ReVerificationLink from "@/components/ReVerificationLink";
import Screen from "@/components/Screen";
import {
  getAuthState,
  updateBusyState,
  updateLoggedInState,
  updateProfile,
} from "@/store/auth";
import { upldateNotification } from "@/store/notification";
import AppButton from "@/ui/AppButton";
import AvatarField from "@/ui/AvatarField";
import { Keys, removeFromAsyncStorage } from "@/utils/asyncStorage";
import colors from "@/utils/colors";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { FC, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";

interface ProfileInfo {
  name: string;
  avatar?: string;
}

const ProfileSettings: FC = () => {
  const [userInfo, setUserInfo] = useState<ProfileInfo>({ name: "" });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const { profile } = useSelector(getAuthState);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Comparaison simple et efficace (plus besoin de deep-equal)
  const isSame =
    userInfo.name === profile?.name && userInfo.avatar === profile?.avatar;

  const handleLogout = async (fromAll = false) => {
    dispatch(updateBusyState(true));
    try {
      const client = await getClient();
      await client.post(`/auth/log-out${fromAll ? "?fromAll=yes" : ""}`);
      await removeFromAsyncStorage(Keys.AUTH_TOKEN);
      dispatch(updateProfile(null));
      dispatch(updateLoggedInState(false));
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    } finally {
      router.push("/sign-in");
      dispatch(updateBusyState(false));
    }
  };

  const handleSubmit = async () => {
    if (!userInfo.name.trim()) {
      dispatch(
        upldateNotification({ message: "Name is required!", type: "error" })
      );
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("name", userInfo.name);

      if (userInfo.avatar) {
        formData.append("avatar", {
          uri: userInfo.avatar,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
      }

      const client = await getClient({ "Content-Type": "multipart/form-data" });
      const { data } = await client.post("/auth/update-profile", formData);

      dispatch(updateProfile(data.profile));
      dispatch(
        upldateNotification({ message: "Profile updated!", type: "success" })
      );
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    } finally {
      setBusy(false);
    }
  };

  const handleImageSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setUserInfo({ ...userInfo, avatar: result.assets[0].uri });
    }
  };

  const clearHistory = async () => {
    try {
      const client = await getClient();
      await client.delete("/history?all=yes");
      queryClient.invalidateQueries({ queryKey: ["histories"] });
      dispatch(
        upldateNotification({ message: "History cleared!", type: "success" })
      );
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "This will remove all your listening history.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearHistory },
      ]
    );
  };

  useEffect(() => {
    if (profile) {
      setUserInfo({
        name: profile.name,
        avatar: profile.avatar || undefined,
      });
    }
  }, [profile]);

  return (
    <Screen>
      <View style={styles.container}>
        <AppHeader title="Settings" />

        {/* Profile Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>

          <View style={styles.option}>
            <AvatarField source={userInfo.avatar} />
            <Pressable
              onPress={handleImageSelect}
              style={styles.changeAvatarBtn}
            >
              <Text style={styles.linkText}>Change Avatar</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.nameInput}
            value={userInfo.name}
            onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
            placeholder="Your name"
            placeholderTextColor={colors.INACTIVE_CONTRAST}
          />

          <View style={styles.emailContainer}>
            <Text style={styles.email}>{profile?.email}</Text>
            {profile?.verified ? (
              <MaterialIcons
                name="verified"
                size={18}
                color={colors.SECONDARY}
              />
            ) : (
              <ReVerificationLink linkTitle="Verify now" />
            )}
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          <Pressable onPress={handleClearHistory} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name="broom"
              size={24}
              color={colors.CONTRAST}
            />
            <Text style={styles.actionText}>Clear All History</Text>
          </Pressable>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logout</Text>
          <Pressable
            onPress={() => handleLogout(false)}
            style={styles.actionBtn}
          >
            <AntDesign name="logout" size={22} color={colors.ERROR} />
            <Text style={[styles.actionText, { color: colors.ERROR }]}>
              Logout
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLogout(true)}
            style={styles.actionBtn}
          >
            <AntDesign name="logout" size={22} color={colors.ERROR} />
            <Text style={[styles.actionText, { color: colors.ERROR }]}>
              Logout from all devices
            </Text>
          </Pressable>
        </View>

        {/* Update Button */}
        {!isSame && (
          <View style={styles.updateBtnContainer}>
            <AppButton
              title="Update Profile"
              onPress={handleSubmit}
              busy={busy}
              borderRadius={12}
            />
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.PRIMARY,
  },
  section: {
    marginTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.INACTIVE_CONTRAST + "40",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.SECONDARY,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  changeAvatarBtn: {
    marginLeft: 16,
  },
  linkText: {
    color: colors.SECONDARY,
    fontWeight: "600",
  },
  nameInput: {
    backgroundColor: colors.OVERLAY + "30",
    color: colors.CONTRAST,
    padding: 14,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  email: {
    color: colors.CONTRAST,
    fontSize: 16,
    marginRight: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: {
    color: colors.CONTRAST,
    fontSize: 17,
    marginLeft: 12,
  },
  updateBtnContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default ProfileSettings;

// components/profile/PublicProfileHeader.tsx
import catchAsyncError from "@/api/catchError";
import { getClient } from "@/api/client";
import { useFetchIsFollowing, useFetchPublicProfile } from "@/hooks/query";
import { upldateNotification } from "@/store/notification";
import AppButton from "@/ui/AppButton";
import AvatarField from "@/ui/AvatarField";
import colors from "@/utils/colors";
import { useLocalSearchParams } from "expo-router";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";

interface PublicProfile {
  id: string;
  name: string;
  avatar?: string;
  followers: number;
}

const PublicProfileHeader: FC = () => {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Récupération du profil public
  const { data: profile, isLoading } = useFetchPublicProfile(profileId);
  const { data: isFollowing = false } = useFetchIsFollowing(profileId);

  // Mutation Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: async () => {
      const client = await getClient();
      await client.post(`/profile/update-follower/${profileId}`);
    },
    onMutate: () => {
      // Optimistic update
      queryClient.setQueryData<boolean>(
        ["is-following", profileId],
        (old) => !old
      );
      queryClient.setQueryData<PublicProfile>(
        ["profile", profileId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            followers: isFollowing ? old.followers - 1 : old.followers + 1,
          };
        }
      );
    },
    onError: (error) => {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));

      // Revert optimistic update
      queryClient.setQueryData<boolean>(
        ["is-following", profileId],
        isFollowing
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
      queryClient.invalidateQueries({ queryKey: ["is-following", profileId] });
    },
  });

  // Loading state
  if (isLoading || !profile) {
    return (
      <View style={styles.container}>
        <AvatarField />
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileName} />
          <View
            style={{
              width: 100,
              height: 16,
              backgroundColor: colors.INACTIVE_CONTRAST + "30",
              marginTop: 8,
              borderRadius: 4,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <AvatarField source={profile.avatar} />

      <View style={styles.profileInfoContainer}>
        {/* Nom */}
        <Text style={styles.profileName}>{profile.name}</Text>
        {/* Followers */}
        <Text style={styles.followerText}>
          {profile.followers}{" "}
          {profile.followers === 1 ? "Follower" : "Followers"}
        </Text>
        {/* Bouton Follow / Unfollow */}
        <AppButton
          title={isFollowing ? "Unfollow" : "Follow"}
          onPress={() => followMutation.mutate()}
          busy={followMutation.isLoading}
          borderRadius={8}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.PRIMARY,
    marginTop: 16,
  },
  profileInfoContainer: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    color: colors.CONTRAST,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
    borderRadius: 4,
  },
  followerText: {
    color: colors.SECONDARY,
    fontSize: 18,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: "600",
  },
  followButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.SECONDARY,
  },
  unfollowButton: {
    backgroundColor: colors.OVERLAY + "80",
    borderWidth: 1.5,
    borderColor: colors.INACTIVE_CONTRAST,
  },
  followButtonText: {
    color: colors.PRIMARY,
    fontWeight: "700",
    fontSize: 15,
  },
  unfollowButtonText: {
    color: colors.CONTRAST,
  },
});

export default PublicProfileHeader;

// app/(public-profile)/[profileId]/playlist.tsx
import Container from "@/components/ui/container";
import { useFetchPublicPlaylist } from "@/hooks/query";
import {
  udpateAllowPlaylistAudioRemove,
  updateIsPlaylistPrivate,
  updatePlaylistVisbility,
  updateSelectedListId,
} from "@/store/playlistModal";
import { getCurrentId } from "@/store/profile";
import PlaylistItem from "@/ui/PlaylistItem";
import { ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function PublicPlaylistTab() {
  const profileId = useSelector(getCurrentId) as string;

  //const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { data } = useFetchPublicPlaylist(profileId);
  const dispatch = useDispatch();

  const handleOnListPress = (playlist: any) => {
    dispatch(udpateAllowPlaylistAudioRemove(false));
    dispatch(updateSelectedListId(playlist.id));
    dispatch(updatePlaylistVisbility(true));
    dispatch(updateIsPlaylistPrivate(playlist.visibility === "private"));
  };

  return (
    <Container>
      <ScrollView style={{ flex: 1 }}>
        {data?.map((playlist) => (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            onPress={() => handleOnListPress(playlist)}
          />
        ))}
      </ScrollView>
    </Container>
  );
}

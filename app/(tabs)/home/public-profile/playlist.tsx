import { Playlist } from "@/@types/audio";
import { PublicProfileTabParamsList } from "@/@types/navigation";
import { useFetchPublicPlaylist } from "@/hooks/query";
import {
  udpateAllowPlaylistAudioRemove,
  updateIsPlaylistPrivate,
  updatePlaylistVisbility,
  updateSelectedListId,
} from "@/store/playlistModal";
import PlaylistItem from "@/ui/PlaylistItem";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FC } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";

type Props = NativeStackScreenProps<
  PublicProfileTabParamsList,
  "PublicPlaylist"
>;

const PublicPlaylistTab: FC<Props> = (props) => {
  const { data } = useFetchPublicPlaylist(props.route.params.profileId);

  const dispatch = useDispatch();

  const handleOnListPress = (playlist: Playlist) => {
    dispatch(udpateAllowPlaylistAudioRemove(false));
    dispatch(updateSelectedListId(playlist.id));
    dispatch(updatePlaylistVisbility(true));
    dispatch(updateIsPlaylistPrivate(playlist.visibility === "private"));
  };

  return (
    <ScrollView style={styles.container}>
      {data?.map((playlist) => {
        return (
          <PlaylistItem
            onPress={() => handleOnListPress(playlist)}
            key={playlist.id}
            playlist={playlist}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default PublicPlaylistTab;

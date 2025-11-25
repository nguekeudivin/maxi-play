import { PublicProfileTabParamsList } from "@/@types/navigation";
import { useFetchPublicUploads } from "@/hooks/query";
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import AudioListItem from "@/ui/AudioListItem";
import AudioListLoadingUI from "@/ui/AudioListLoadingUI";
import EmptyRecords from "@/ui/EmptyRecords";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FC } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

type Props = NativeStackScreenProps<
  PublicProfileTabParamsList,
  "PublicUploads"
>;

const PublicUploadsTab: FC<Props> = (props) => {
  const { data, isLoading } = useFetchPublicUploads(
    props.route.params.profileId
  );
  const { onAudioPress } = useAudioController();
  const { onGoingAudio } = useSelector(getPlayerState);

  if (isLoading) return <AudioListLoadingUI />;

  if (!data?.length) return <EmptyRecords title="There is no audio!" />;

  return (
    <ScrollView style={styles.container}>
      {data?.map((item) => {
        return (
          <AudioListItem
            onPress={() => onAudioPress(item, data)}
            key={item.id}
            audio={item}
            isPlaying={onGoingAudio?.id === item.id}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default PublicUploadsTab;

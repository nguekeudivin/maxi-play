// app/(public-profile)/[profileId]/uploads.tsx
import Container from "@/components/ui/container";
import { useFetchPublicUploads } from "@/hooks/query";
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import { getCurrentId } from "@/store/profile";
import AudioListItem from "@/ui/AudioListItem";
import AudioListLoadingUI from "@/ui/AudioListLoadingUI";
import EmptyRecords from "@/ui/EmptyRecords";
import { ScrollView } from "react-native";
import { useSelector } from "react-redux";

export default function PublicUploadsTab() {
  //const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const profileId = useSelector(getCurrentId) as string;
  const { data, isLoading } = useFetchPublicUploads(profileId);
  const { isPlaying } = useAudioController();

  const { onAudioPress } = useAudioController();
  const { onGoingAudio } = useSelector(getPlayerState);

  if (isLoading)
    return (
      <Container>
        <AudioListLoadingUI />
      </Container>
    );

  if (!data?.length)
    return (
      <Container>
        <EmptyRecords title="No uploads yet" />
      </Container>
    );

  return (
    <Container>
      <ScrollView style={{ flex: 1 }}>
        {data.map((item) => (
          <AudioListItem
            key={item.id}
            audio={item}
            isPlaying={onGoingAudio?.id === item.id && isPlaying}
            onPress={() => onAudioPress(item, data)}
          />
        ))}
      </ScrollView>
    </Container>
  );
}

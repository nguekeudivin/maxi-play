import { AudioData } from "@/@types/audio";
import { ProfileNavigatorStackParamList } from "@/@types/navigation";
import OptionsModal from "@/components/OptionsModal";
import Container from "@/components/ui/container";
import { useFetchUploadsByProfile } from "@/hooks/query";
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import AudioListItem from "@/ui/AudioListItem";
import AudioListLoadingUI from "@/ui/AudioListLoadingUI";
import EmptyRecords from "@/ui/EmptyRecords";
import OptionSelector from "@/ui/OptionSelector";
import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { FC, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

interface Props {}

const UploadsTab: FC<Props> = (props) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioData>();
  const { onGoingAudio } = useSelector(getPlayerState);
  const { data, isLoading } = useFetchUploadsByProfile();
  const { onAudioPress } = useAudioController();
  const { navigate } =
    useNavigation<NavigationProp<ProfileNavigatorStackParamList>>();
  const { isPlaying } = useAudioController();

  const handleOnLongPress = (audio: AudioData) => {
    setSelectedAudio(audio);
    setShowOptions(true);
  };

  const handleOnEditPress = () => {
    setShowOptions(false);
    if (selectedAudio)
      navigate("UpdateAudio", {
        audio: selectedAudio,
      });
  };

  if (isLoading) return <AudioListLoadingUI />;

  if (!data?.length) return <EmptyRecords title="There is no audio!" />;

  return (
    <Container>
      <ScrollView style={styles.container}>
        {data?.map((item) => {
          return (
            <AudioListItem
              onPress={() => onAudioPress(item, data)}
              key={item.id}
              audio={item}
              isPlaying={onGoingAudio?.id === item.id && isPlaying}
              onLongPress={() => handleOnLongPress(item)}
            />
          );
        })}
      </ScrollView>
      <OptionsModal
        visible={showOptions}
        onRequestClose={() => {
          setShowOptions(false);
        }}
        options={[
          {
            title: "Edit",
            icon: "edit",
            onPress: handleOnEditPress,
          },
        ]}
        renderItem={(item) => {
          return (
            <OptionSelector
              icon={
                <MaterialIcons
                  size={24}
                  color={colors.PRIMARY}
                  name={item.icon as any}
                />
              }
              label={item.title}
              onPress={item.onPress}
            />
          );
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.PRIMARY,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionLabel: { color: colors.PRIMARY, fontSize: 16, marginLeft: 5 },
});

export default UploadsTab;

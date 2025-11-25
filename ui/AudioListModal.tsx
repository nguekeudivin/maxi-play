import { AudioData } from '@/@types/audio';
import { getPlayerState } from '@/store/player';
import colors from '@/utils/colors';
import { FC } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import AppModal from './AppModal';
import AudioListItem from './AudioListItem';
import AudioListLoadingUI from './AudioListLoadingUI';

interface Props {
  data: AudioData[];
  header?: string;
  visible: boolean;
  onRequestClose(): void;
  onItemPress(item: AudioData, data: AudioData[]): void;
  loading?: boolean;
}

const AudioListModal: FC<Props> = ({
  header,
  loading,
  data,
  visible,
  onItemPress,
  onRequestClose,
}) => {
  const {onGoingAudio} = useSelector(getPlayerState);
  return (
    <AppModal visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.container}>
        {loading ? (
          <AudioListLoadingUI />
        ) : (
          <>
            <Text style={styles.header}>{header}</Text>
            <FlatList
              contentContainerStyle={styles.flatlist}
              data={data}
              keyExtractor={item => item.id}
              renderItem={({item}) => {
                return (
                  <AudioListItem
                    onPress={() => onItemPress(item, data)}
                    audio={item}
                    isPlaying={onGoingAudio?.id === item.id}
                  />
                );
              }}
            />
          </>
        )}
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  flatlist: {
    paddingBottom: 50,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.CONTRAST,
    paddingVertical: 10,
  },
});

export default AudioListModal;

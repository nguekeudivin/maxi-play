import { getClient } from "@/api/client";
import Container from "@/components/ui/container";
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import AudioListItem from "@/ui/AudioListItem";
import AudioListLoadingUI from "@/ui/AudioListLoadingUI";
import EmptyRecords from "@/ui/EmptyRecords";
import PaginatedList from "@/ui/PaginatedList";
import { useFocusEffect } from "expo-router";
import { FC, useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";

interface Props {}
// let pageNo = 0;
const FavoriteTab: FC<Props> = (props) => {
  const { onGoingAudio } = useSelector(getPlayerState);
  const { onAudioPress } = useAudioController();
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetch = async () => {
    const client = await getClient();
    const { data } = await client("/favorite");
    setData(data.audio);
    //return data.audios;
  };

  const handleOnEndReached = () => {};
  const handleOnRefresh = () => {};

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  useEffect(() => {
    fetch();
  }, []);

  if (isLoading) return <AudioListLoadingUI />;

  return (
    <Container>
      <PaginatedList
        data={data}
        hasMore={hasMore}
        isFetching={isFetchingMore}
        onEndReached={handleOnEndReached}
        onRefresh={handleOnRefresh}
        refreshing={isFetching}
        ListEmptyComponent={
          <EmptyRecords title="There is no favorite audio!" />
        }
        renderItem={({ item }) => {
          return (
            <AudioListItem
              onPress={() => onAudioPress(item, data)}
              key={item.id}
              audio={item}
              isPlaying={onGoingAudio?.id === item.id}
            />
          );
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default FavoriteTab;

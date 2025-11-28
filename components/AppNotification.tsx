import {
  getNotificationState,
  upldateNotification,
} from "@/store/notification";
import colors from "@/utils/colors";
import { FC, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

interface Props {}

const AppNotification: FC<Props> = (props) => {
  const { message, type } = useSelector(getNotificationState);

  const height = useSharedValue(0);

  const dispatch = useDispatch();

  const heightStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  let backgroundColor = colors.ERROR;
  let textColor = colors.CONTRAST;

  switch (type) {
    case "success":
      backgroundColor = colors.SUCCESS;
      textColor = colors.PRIMARY;
      break;
  }

  useEffect(() => {
    if (message) {
      Toast.show({
        type: type,
        text1: "Notification",
        text2: message,
        position: "top",
        visibilityTime: 5000,
      });
      dispatch(upldateNotification({ message: "", type: "error" }));
    }
  }, [message]);

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    alignItems: "center",
  },
});

export default AppNotification;

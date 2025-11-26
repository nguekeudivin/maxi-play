import colors from "@/utils/colors";
import { FC } from "react";
import { View } from "react-native";

interface Props {
  children: any;
}

const Container: FC<Props> = ({ children }) => {
  return (
    <View style={{ backgroundColor: colors.PRIMARY, flex: 1, padding: 16 }}>
      {children}
    </View>
  );
};

export default Container;

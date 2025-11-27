import BasicModalContainer from "@/ui/BasicModalContainer";
import colors from "@/utils/colors";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { JSX, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface Props<T> {
  data: T[];
  visible?: boolean;
  title?: string;
  renderItem(item: T): JSX.Element;
  onSelect(item: T, index: number): void;
  onRequestClose?(): void;
}

const CategorySelector = <T extends any>({
  data,
  title,
  visible = false,
  renderItem,
  onSelect,
  onRequestClose,
}: Props<T>) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (item: T, index: number) => {
    setSelectedIndex(index);
    onSelect(item, index);
    onRequestClose && onRequestClose();
  };

  return (
    <BasicModalContainer visible={visible} onRequestClose={onRequestClose}>
      <Text style={styles.title}>{title}</Text>

      <ScrollView>
        {data.map((item, index) => {
          return (
            <Pressable
              onPress={() => handleSelect(item, index)}
              key={index}
              style={styles.selectorContainer}
            >
              {selectedIndex === index ? (
                <MaterialDesignIcons
                  name="radiobox-marked"
                  color={colors.SECONDARY}
                />
              ) : (
                <MaterialDesignIcons
                  name="radiobox-blank"
                  color={colors.SECONDARY}
                />
              )}
              {renderItem(item)}
            </Pressable>
          );
        })}
      </ScrollView>
    </BasicModalContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.PRIMARY,
    paddingVertical: 10,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CategorySelector;

import CategorySelector from "@/components/CategorySelector";
import { upldateNotification } from "@/store/notification";
import AppButton from "@/ui/AppButton";
import { categories } from "@/utils/categories";
import colors from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { FC, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface FormFields {
  title: string;
  category: string;
  about: string;
  file?: FileInfo;
  poster?: FileInfo;
}

const defaultForm: FormFields = {
  title: "",
  category: "",
  about: "",
  file: undefined,
  poster: undefined,
};

const commonSchema = {
  title: yup.string().trim().required("Title is missing!"),
  category: yup
    .string()
    .oneOf(categories, "Select a valid category!")
    .required("Category is missing!"),
  about: yup.string().trim().required("About is missing!"),
};

const newAudioSchema = yup.object().shape({
  ...commonSchema,
  file: yup.object().required("Audio file is required!"),
});

const updateAudioSchema = yup.object().shape({
  ...commonSchema,
});

interface Props {
  initialValues?: {
    title: string;
    category: string;
    about: string;
  };
  onSubmit(formData: FormData, callback?: () => void): void;
  progress?: number;
  busy?: boolean;
}

const AudioForm: FC<Props> = ({
  initialValues,
  onSubmit,
  progress = 0,
  busy = false,
}) => {
  const [audioInfo, setAudioInfo] = useState<FormFields>({ ...defaultForm });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isForUpdate, setIsForUpdate] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (initialValues) {
      setAudioInfo((prev) => ({
        ...prev,
        title: initialValues.title || "",
        category: initialValues.category || "",
        about: initialValues.about || "",
      }));
      setIsForUpdate(true);
    }
  }, [initialValues]);

  // Sélection du poster (image)
  const pickPoster = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    const fileName = asset.fileName || `poster_${Date.now()}.jpg`;
    const fileType =
      asset.type === "image" ? "image/jpeg" : asset.type || "image/jpeg";

    setAudioInfo((prev) => ({
      ...prev,
      poster: {
        uri: asset.uri,
        name: fileName,
        type: fileType,
      },
    }));
  };

  // Sélection du fichier audio
  const pickAudio = async () => {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (doc.canceled || !doc.assets?.[0]) return;

      const file = doc.assets[0];

      const fileName = file.name || `audio_${Date.now()}.mp3`;
      const fileType = file.mimeType || "audio/mpeg";

      setAudioInfo((prev) => ({
        ...prev,
        file: {
          uri: file.uri,
          name: fileName,
          type: fileType,
          size: file.size,
        },
      }));
    } catch (err) {
      console.warn("DocumentPicker Error: ", err);
      Alert.alert("Error", "Unable to select audio file");
    }
  };

  const handleSubmit = async () => {
    try {
      const schema = isForUpdate ? updateAudioSchema : newAudioSchema;
      await schema.validate(audioInfo, { abortEarly: false });

      const formData = new FormData();

      // Champs texte
      formData.append("title", audioInfo.title.trim());
      formData.append("about", audioInfo.about.trim());
      formData.append("category", audioInfo.category);

      // Poster (toujours autorisé, même en update)
      if (audioInfo.poster?.uri) {
        formData.append("poster", {
          uri: audioInfo.poster.uri,
          name: audioInfo.poster.name,
          type: audioInfo.poster.type,
          fileName: audioInfo.poster.name, // CRITICAL FOR ANDROID
        } as any);
      }

      // Fichier audio (uniquement en création)
      if (!isForUpdate && audioInfo.file?.uri) {
        formData.append("file", {
          uri: audioInfo.file.uri,
          name: audioInfo.file.name,
          type: audioInfo.file.type,
          fileName: audioInfo.file.name, // INDISPENSABLE SUR ANDROID
        } as any);
      }

      onSubmit(formData, () => {
        setAudioInfo({ ...defaultForm });
      });
    } catch (error: any) {
      const msg = error.errors?.[0] || "An error occurred";
      dispatch(upldateNotification({ message: msg, type: "error" }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Poster Selector */}
      <Pressable onPress={pickPoster} style={styles.posterContainer}>
        {audioInfo.poster?.uri ? (
          <>
            <Image
              source={{ uri: audioInfo.poster.uri }}
              style={styles.posterImage}
              resizeMode="cover"
            />
            <View style={styles.selectedIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={colors.PRIMARY}
              />
            </View>
            <View style={styles.posterOverlay}>
              <Ionicons name="camera" size={32} color="white" />
              <Text style={styles.changePosterText}>Change Poster</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyPosterState}>
            <Ionicons name="image-outline" size={56} color={colors.SECONDARY} />
            <Text style={styles.selectorText}>Select Poster</Text>
          </View>
        )}
      </Pressable>

      {/* Audio Selector - seulement en création */}
      {!isForUpdate && (
        <Pressable onPress={pickAudio} style={styles.audioSelector}>
          <Ionicons
            name={audioInfo.file ? "musical-notes" : "musical-notes-outline"}
            size={40}
            color={colors.SECONDARY}
          />
          <Text style={styles.audioFileName} numberOfLines={2}>
            {audioInfo.file?.name || "Select Audio File"}
          </Text>
          {audioInfo.file && (
            <View style={styles.selectedIndicatorSmall}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.PRIMARY}
              />
            </View>
          )}
        </Pressable>
      )}

      {/* Formulaire */}
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Title"
          placeholderTextColor={colors.INACTIVE_CONTRAST}
          style={styles.input}
          value={audioInfo.title}
          onChangeText={(t) => setAudioInfo((prev) => ({ ...prev, title: t }))}
        />

        <Pressable
          onPress={() => setShowCategoryModal(true)}
          style={styles.categorySelector}
        >
          <Text style={styles.categorySelectorTitle}>Category</Text>
          <Text
            style={
              audioInfo.category
                ? styles.selectedCategory
                : styles.placeholderCategory
            }
          >
            {audioInfo.category || "Select a category"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.INACTIVE_CONTRAST}
          />
        </Pressable>

        <TextInput
          placeholder="About this audio..."
          placeholderTextColor={colors.INACTIVE_CONTRAST}
          style={[styles.input, styles.aboutInput]}
          multiline
          textAlignVertical="top"
          value={audioInfo.about}
          onChangeText={(t) => setAudioInfo((prev) => ({ ...prev, about: t }))}
        />

        <CategorySelector
          visible={showCategoryModal}
          onRequestClose={() => setShowCategoryModal(false)}
          title="Select Category"
          data={categories}
          renderItem={(item) => <Text style={styles.categoryItem}>{item}</Text>}
          onSelect={(item) => {
            setAudioInfo((prev) => ({ ...prev, category: item }));
            setShowCategoryModal(false);
          }}
        />

        <AppButton
          busy={busy}
          title={isForUpdate ? "Update Audio" : "Submit Audio"}
          onPress={handleSubmit}
          borderRadius={8}
          // style={{ marginTop: 20 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  posterContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    // backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderStyle: "dashed",
    marginBottom: 20,
    position: "relative",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  emptyPosterState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    //backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  changePosterText: {
    color: "white",
    marginTop: 10,
    fontWeight: "600",
    fontSize: 16,
  },
  selectedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 4,
  },
  selectedIndicatorSmall: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  audioSelector: {
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  audioFileName: {
    marginTop: 12,
    color: colors.CONTRAST,
    fontSize: 16,
    textAlign: "center",
    maxWidth: "90%",
  },
  selectorText: {
    marginTop: 12,
    color: colors.SECONDARY,
    fontSize: 16,
    fontWeight: "500",
  },
  formContainer: { marginTop: 10 },
  input: {
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    color: colors.CONTRAST,
    //backgroundColor: "#111",
    backgroundColor: colors.PRIMARY,
  },
  aboutInput: {
    height: 120,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: colors.PRIMARY,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.INACTIVE_CONTRAST,
  },
  categorySelectorTitle: {
    color: colors.CONTRAST,
    fontSize: 17,
  },
  selectedCategory: {
    color: colors.CONTRAST,
    fontSize: 18,
  },
  placeholderCategory: {
    color: colors.INACTIVE_CONTRAST,
    fontStyle: "italic",
  },
  categoryItem: {
    padding: 16,
    fontSize: 16,
    color: colors.PRIMARY,
  },
});

export default AudioForm;

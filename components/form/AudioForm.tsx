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
  type?: string; // mime type
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
  category: yup.string().oneOf(categories, "Category is missing!"),
  about: yup.string().trim().required("About is missing!"),
};

const newAudioSchema = yup.object().shape({
  ...commonSchema,
  file: yup.object().required("Audio file is missing!"),
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
        ...initialValues,
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

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAudioInfo((prev) => ({
        ...prev,
        poster: {
          uri: asset.uri,
          name: asset.fileName || "poster.jpg",
          type: asset.type || "image/jpeg",
        },
      }));
    }
  };

  // Sélection du fichier audio
  const pickAudio = async () => {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (doc.canceled) return;

      const file = doc.assets[0];
      setAudioInfo((prev) => ({
        ...prev,
        file: {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "audio/mpeg",
          size: file.size,
        },
      }));
    } catch (err) {
      console.warn("DocumentPicker Error: ", err);
      Alert.alert("Erreur", "Impossible de sélectionner le fichier audio");
    }
  };

  const handleSubmit = async () => {
    try {
      const schema = isForUpdate ? updateAudioSchema : newAudioSchema;
      const validated = await schema.validate(audioInfo, { abortEarly: false });

      const formData = new FormData();

      // Ajout des champs texte
      formData.append("title", validated.title);
      formData.append("about", validated.about);
      formData.append("category", validated.category as any);

      // Ajout du poster s'il existe
      if (audioInfo.poster?.uri) {
        formData.append("poster", {
          uri: audioInfo.poster.uri,
          name: audioInfo.poster.name,
          type: audioInfo.poster.type || "image/jpeg",
        } as any);
      }

      // Ajout du fichier audio (seulement si création)
      if (!isForUpdate && audioInfo.file?.uri) {
        formData.append("file", {
          uri: audioInfo.file.uri,
          name: audioInfo.file.name,
          type: audioInfo.file.type || "audio/mpeg",
        } as any);
      }

      onSubmit(formData, () => {
        setAudioInfo({ ...defaultForm });
      });
    } catch (error: any) {
      const msg = error.errors?.[0] || "Une erreur est survenue";
      dispatch(upldateNotification({ message: msg, type: "error" }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sélecteurs de fichiers */}
      <View style={{ marginBottom: 20 }}>
        <Pressable onPress={pickPoster} style={styles.posterContainer}>
          {audioInfo.poster?.uri ? (
            <>
              {/* Aperçu de l'image */}
              <Image
                source={{ uri: audioInfo.poster.uri }}
                style={styles.posterImage}
                resizeMode="cover"
              />

              {/* Badge de validation */}
              <View style={styles.selectedIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={colors.PRIMARY}
                />
              </View>

              {/* Overlay sombre léger pour le texte (optionnel mais très classe) */}
              <View style={styles.posterOverlay}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.changePosterText}>Change Poster</Text>
              </View>
            </>
          ) : (
            /* État vide : icône + texte */
            <View style={styles.emptyPosterState}>
              <Ionicons
                name="image-outline"
                size={48}
                color={colors.SECONDARY}
              />
              <Text style={styles.selectorText}>Select Poster</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={{ marginBottom: 16 }}>
        {/* Audio Selector - seulement en création */}
        {!isForUpdate && (
          <Pressable onPress={pickAudio} style={[styles.selectorBtn]}>
            {!audioInfo.file && (
              <Ionicons
                name="musical-notes-outline"
                size={40}
                color={colors.SECONDARY}
              />
            )}
            <Text style={styles.selectorText}>
              {audioInfo.file?.name || "Select Audio"}
            </Text>
            {audioInfo.file && (
              <View style={styles.selectedIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.SECONDARY}
                />
              </View>
            )}
          </Pressable>
        )}
      </View>

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
          <Text style={styles.selectedCategory}>
            {audioInfo.category || "Select a category"}
          </Text>
        </Pressable>

        <TextInput
          placeholder="About"
          placeholderTextColor={colors.INACTIVE_CONTRAST}
          style={[styles.input, { height: 120, marginTop: 16 }]}
          multiline
          textAlignVertical="top"
          value={audioInfo.about}
          onChangeText={(t) => setAudioInfo((prev) => ({ ...prev, about: t }))}
        />

        <CategorySelector
          visible={showCategoryModal}
          onRequestClose={() => setShowCategoryModal(false)}
          title="Category"
          data={categories}
          renderItem={(item) => <Text style={styles.category}>{item}</Text>}
          onSelect={(item) => {
            setAudioInfo((prev) => ({ ...prev, category: item }));
            setShowCategoryModal(false);
          }}
        />

        {/* <View style={{ marginVertical: 20 }}>
            {busy && <Progress progress={progress} />}
          </View> */}

        <AppButton
          busy={busy}
          title={isForUpdate ? "Update" : "Submit"}
          onPress={handleSubmit}
          borderRadius={7}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  // fileSelctorContainer: { marginBottom: 20 },
  selectorBtn: {
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 7,
    padding: 15,
    alignItems: "center",
    flex: 1,
  },
  selectorIcon: { fontSize: 35, color: colors.SECONDARY },
  selectorText: { marginTop: 8, color: colors.CONTRAST },
  formContainer: { marginTop: 10 },
  input: {
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderRadius: 7,
    padding: 12,
    fontSize: 18,
    color: colors.CONTRAST,
    marginBottom: 15,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.INACTIVE_CONTRAST,
  },
  categorySelectorTitle: { color: colors.CONTRAST, fontSize: 18 },
  selectedCategory: { color: colors.SECONDARY, fontStyle: "italic" },
  category: { padding: 15, fontSize: 16 },

  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
  },
  posterContainer: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.PRIMARY,
    borderWidth: 2,
    borderColor: colors.SECONDARY,
    borderStyle: "dashed",
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0, // devient visible au hover/tap
  },

  changePosterText: {
    color: "white",
    marginTop: 8,
    fontWeight: "600",
  },
});

export default AudioForm;

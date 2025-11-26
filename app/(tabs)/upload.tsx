import catchAsyncError from "@/api/catchError";
import { getClient } from "@/api/client";
import AudioForm from "@/components/form/AudioForm";
import { upldateNotification } from "@/store/notification";
import colors from "@/utils/colors";
import { mapRange } from "@/utils/math";
import { FC, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

const Upload: FC = () => {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();

  const handleUpload = async (formData: FormData, callback: () => void) => {
    setBusy(true);
    setProgress(0);

    try {
      const client = await getClient({ "Content-Type": "multipart/form-data" });
      await client.post("/audio/create", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = mapRange({
              inputValue: e.loaded,
              inputMin: 0,
              inputMax: e.total,
              outputMin: 0,
              outputMax: 100,
            });
            setProgress(Math.floor(percent));
          }
        },
      });

      Toast.show({
        type: "success",
        text1: "Upload successful!",
        text2: "Your audio has been published successfully",
        position: "top",
        visibilityTime: 4000,
      });
      callback();
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <AudioForm onSubmit={handleUpload} busy={busy} progress={progress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // REQUIRED!!!
    backgroundColor: colors.PRIMARY,
  },
  container: {
    flex: 1,
  },
});

export default Upload;

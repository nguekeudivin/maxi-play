import catchAsyncError from "@/api/catchError";
import client from "@/api/client";
import AuthFormContainer from "@/components/AuthFormContainer";
import ReVerificationLink from "@/components/ReVerificationLink";
import { upldateNotification } from "@/store/notification";
import AppButton from "@/ui/AppButton";
import OTPField from "@/ui/OTPField";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { FC, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";

type UserInfo = {
  id: string;
  email: string;
  name: string;
};

const otpFields = new Array(6).fill("");

const Verification: FC = () => {
  const [otp, setOtp] = useState<string[]>([...otpFields]);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments(); // Pour savoir d'où on vient
  const { userInfo: rawUserInfo } = useLocalSearchParams();

  // Parse userInfo (envoyé via JSON.stringify)
  const userInfo: UserInfo = rawUserInfo
    ? JSON.parse(rawUserInfo as string)
    : null;

  const inputRef = useRef<TextInput>(null);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];

    if (value === "Backspace") {
      if (!newOtp[index]) setActiveOtpIndex(Math.max(0, index - 1));
      newOtp[index] = "";
    } else {
      newOtp[index] = value;
      setActiveOtpIndex(Math.min(5, index + 1));
    }

    setOtp(newOtp);
  };

  const handlePaste = (text: string) => {
    if (text.length === 6 && /^\d+$/.test(text)) {
      setOtp(text.split(""));
      setActiveOtpIndex(6);
      Keyboard.dismiss();
    }
  };

  const isValidOtp = otp.every((digit) => digit.trim() !== "");

  const handleSubmit = async () => {
    if (!isValidOtp) {
      dispatch(upldateNotification({ message: "Invalid OTP!", type: "error" }));
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await client.post("/auth/verify-email", {
        userId: userInfo.id,
        token: otp.join(""),
      });

      dispatch(upldateNotification({ message: data.message, type: "success" }));

      // Détermine où rediriger selon l'origine
      const cameFromProfile = (segments as any).includes("profile");

      if (cameFromProfile) {
        // On était dans le profil → on retourne simplement en arrière
        router.back();
      } else {
        // On était dans l'auth → on va vers SignIn ou Home
        router.replace("/(auth)/sign-in"); // ou "/(tabs)" si tu as un layout tabs
      }
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  if (!userInfo) {
    // Sécurité si on arrive ici sans userInfo
    router.replace("/(auth)/sign-in");
    return null;
  }

  return (
    <AuthFormContainer
      heading="Check your email"
      subHeading="We've sent you a 6-digit code"
    >
      <View style={styles.inputContainer}>
        {otpFields.map((_, index) => (
          <OTPField
            key={index}
            ref={activeOtpIndex === index ? inputRef : null}
            placeholder="*"
            keyboardType="numeric"
            value={otp[index] || ""}
            onChangeText={(text) => {
              if (text.length > 1) handlePaste(text);
              else if (text) handleChange(text, index);
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                handleChange("Backspace", index);
              }
            }}
          />
        ))}
      </View>

      <AppButton
        title="Verify"
        onPress={handleSubmit}
        busy={submitting}
        borderRadius={12}
      />

      <View style={styles.linkContainer}>
        <ReVerificationLink
          linkTitle="Resend OTP"
          userId={userInfo.id}
          activeAtFirst={false}
        />
      </View>
    </AuthFormContainer>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  linkContainer: {
    marginTop: 25,
    alignItems: "center",
  },
});

export default Verification;

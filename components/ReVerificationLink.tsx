// components/ReVerificationLink.tsx
import { getClient } from "@/api/client";
import { getAuthState } from "@/store/auth";
import AppLink from "@/ui/AppLink";
import colors from "@/utils/colors";
import { useRouter } from "expo-router";
import { FC, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

interface Props {
  time?: number;
  activeAtFirst?: boolean;
  linkTitle: string;
  userId?: string;
}

const ReVerificationLink: FC<Props> = ({
  linkTitle,
  userId,
  time = 60,
  activeAtFirst = true,
}) => {
  const [countDown, setCountDown] = useState(time);
  const [canSendNewOtpRequest, setCanSendNewOtpRequest] =
    useState(activeAtFirst);
  const { profile } = useSelector(getAuthState);
  const router = useRouter();

  const requestForOTP = async () => {
    if (!canSendNewOtpRequest) return;

    setCountDown(60);
    setCanSendNewOtpRequest(false);

    try {
      const client = await getClient();
      await client.post("/auth/re-verify-email", {
        userId: userId || profile?.id,
      });

      // Navigation Expo Router vers la page de vérification
      router.push({
        pathname: "/verification" as any,
        params: {
          userInfo: JSON.stringify({
            email: profile?.email || "",
            name: profile?.name || "",
            id: userId || profile?.id || "",
          }),
        },
      });
    } catch (error) {
      console.warn("Failed to request OTP:", error);
      // Optionnel : afficher un toast d'erreur
      setCanSendNewOtpRequest(true); // réactiver en cas d'erreur
    }
  };

  useEffect(() => {
    if (canSendNewOtpRequest) return;

    const intervalId = setInterval(() => {
      setCountDown((prev) => {
        if (prev <= 1) {
          setCanSendNewOtpRequest(true);
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [canSendNewOtpRequest]);

  return (
    <View style={styles.container}>
      {countDown > 0 && !canSendNewOtpRequest && (
        <Text style={styles.countDown}>{countDown}s</Text>
      )}
      <AppLink
        title={linkTitle}
        //route="/verification"
        onPress={requestForOTP}
        active={canSendNewOtpRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  countDown: {
    color: colors.SECONDARY,
    marginRight: 8,
    fontWeight: "600",
  },
});

export default ReVerificationLink;

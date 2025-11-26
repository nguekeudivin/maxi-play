import { AuthStackParamList } from "@/@types/navigation";
import catchAsyncError from "@/api/catchError";
import client from "@/api/client";
import AuthFormContainer from "@/components/AuthFormContainer";
import Form from "@/components/form";
import AuthInputField from "@/components/form/AuthInputField";
import SubmitBtn from "@/components/form/SubmitBtn";
import { updateLoggedInState, updateProfile } from "@/store/auth";
import { upldateNotification } from "@/store/notification";
import AppLink from "@/ui/AppLink";
import PasswordVisibilityIcon from "@/ui/PasswordVisibilityIcon";
import { Keys, saveToAsyncStorage } from "@/utils/asyncStorage";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { FormikHelpers } from "formik";
import { FC, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import * as yup from "yup";

const signinSchema = yup.object({
  email: yup
    .string()
    .trim("Email is missing!")
    .email("Invalid email!")
    .required("Email is required!"),
  password: yup
    .string()
    .trim("Password is missing!")
    .min(8, "Password is too short!")
    .required("Password is required!"),
});

interface Props {}

interface SignInUserInfo {
  email: string;
  password: string;
}

const initialValues = {
  email: "codec678538351@gmail.com",
  password: "asdsQKas!dsadsaa",
};

const SignIn: FC<Props> = (props) => {
  const [secureEntry, setSecureEntry] = useState(true);
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const dispatch = useDispatch();
  const router = useRouter();

  const togglePasswordView = () => {
    setSecureEntry(!secureEntry);
  };

  const handleSubmit = async (
    values: SignInUserInfo,
    actions: FormikHelpers<SignInUserInfo>
  ) => {
    actions.setSubmitting(true);
    try {
      // we want to send these information to our api
      const { data } = await client.post("/auth/sign-in", {
        ...values,
      });

      await saveToAsyncStorage(Keys.AUTH_TOKEN, data.token);

      dispatch(updateProfile(data.profile));
      dispatch(updateLoggedInState(true));
      router.push("/home");
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      dispatch(upldateNotification({ message: errorMessage, type: "error" }));
    }

    actions.setSubmitting(false);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={signinSchema}
    >
      <AuthFormContainer heading="Welcome back!">
        <View style={styles.formContainer}>
          <AuthInputField
            name="email"
            placeholder="john@email.com"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.marginBottom}
          />
          <AuthInputField
            name="password"
            placeholder="********"
            label="Password"
            autoCapitalize="none"
            secureTextEntry={secureEntry}
            containerStyle={styles.marginBottom}
            rightIcon={<PasswordVisibilityIcon privateIcon={secureEntry} />}
            onRightIconPress={togglePasswordView}
          />
          <SubmitBtn title="Sign in" />

          <View style={styles.linkContainer}>
            <AppLink title="I Lost My Password" route="/lost-password" />
            <AppLink title="Sign up" route="/sign-up" />
          </View>
        </View>
      </AuthFormContainer>
    </Form>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  marginBottom: {
    marginBottom: 20,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default SignIn;

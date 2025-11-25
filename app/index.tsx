import client from "@/api/client";
import {
  getAuthState,
  updateBusyState,
  updateLoggedInState,
  updateProfile,
} from "@/store/auth";
import { getFromAsyncStorage, Keys } from "@/utils/asyncStorage";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Index() {
  const { loggedIn, busy } = useSelector(getAuthState);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAuthInfo = async () => {
      dispatch(updateBusyState(true));
      try {
        const token = await getFromAsyncStorage(Keys.AUTH_TOKEN);
        if (!token) {
          return dispatch(updateBusyState(false));
        }

        const { data } = await client.get("/auth/is-auth", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        dispatch(updateProfile(data.profile));
        dispatch(updateLoggedInState(true));
      } catch (error) {
        console.log("Auth error: ", error);
      }

      dispatch(updateBusyState(false));
    };

    fetchAuthInfo();
  }, []);

  return loggedIn ? (
    <Redirect href="(tabs)" />
  ) : (
    // <Redirect href="(auth)/sign-in" />
    <Redirect href="/home" />
  );
}

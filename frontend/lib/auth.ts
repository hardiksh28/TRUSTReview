import {
  confirmSignUp as amplifyConfirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
} from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify";

export async function signUp(email: string, password: string) {
  configureAmplify();
  return amplifySignUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function confirmSignUp(email: string, code: string) {
  configureAmplify();
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export async function signIn(email: string, password: string) {
  configureAmplify();
  try {
    return await amplifySignIn({ username: email, password });
  } catch (err: any) {
    // A stale session from an earlier sign-in (this device/browser, possibly
    // a different account) blocks a fresh signIn() call. Clear it and retry
    // once rather than surfacing Amplify's internal error to the user.
    const alreadySignedIn =
      err?.name === "UserAlreadyAuthenticatedException" ||
      /already a signed in user/i.test(err?.message ?? "");
    if (alreadySignedIn) {
      await amplifySignOut();
      return await amplifySignIn({ username: email, password });
    }
    throw err;
  }
}

export async function signOut() {
  configureAmplify();
  return amplifySignOut();
}

export async function getCurrentSub(): Promise<string | null> {
  configureAmplify();
  try {
    const user = await getCurrentUser();
    return user.userId;
  } catch {
    return null;
  }
}

export async function isSignedIn(): Promise<boolean> {
  configureAmplify();
  try {
    const session = await fetchAuthSession();
    return !!session.tokens;
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  configureAmplify();
  try {
    const session = await fetchAuthSession();
    const groups = session.tokens?.idToken?.payload?.["cognito:groups"];
    return Array.isArray(groups) && groups.includes("admins");
  } catch {
    return false;
  }
}

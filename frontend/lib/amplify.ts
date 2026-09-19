import { Amplify } from "aws-amplify";

let configured = false;

/** Idempotent, safe to call from any client component before touching Auth. */
export function configureAmplify() {
  if (configured || typeof window === "undefined") return;
  configured = true;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? "",
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? "",
      },
    },
  });
}

// Configure eagerly on module load in the browser, in addition to the
// <AmplifyConfigure /> mount in the root layout — avoids any effect-ordering
// race between this and a page's own useEffect that needs Auth immediately.
configureAmplify();

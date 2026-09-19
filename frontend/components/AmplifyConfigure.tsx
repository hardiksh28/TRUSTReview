"use client";

import { useEffect } from "react";
import { configureAmplify } from "@/lib/amplify";

/** Runs Amplify.configure() once, client-side, before anything calls Auth. */
export function AmplifyConfigure() {
  useEffect(() => {
    configureAmplify();
  }, []);
  return null;
}

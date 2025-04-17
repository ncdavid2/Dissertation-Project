import React, { Suspense } from "react";
import ScreenshotExplanationPage from "./ScreenshotExplanationPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScreenshotExplanationPage />
    </Suspense>
  );
}

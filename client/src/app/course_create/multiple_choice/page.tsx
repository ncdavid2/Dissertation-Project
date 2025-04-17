import React, { Suspense } from "react";
import VideoPageCreation from "./VideoPageCreation";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoPageCreation />
    </Suspense>
  );
}

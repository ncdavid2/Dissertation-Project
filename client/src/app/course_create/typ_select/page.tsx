import React, { Suspense } from "react";
import PageSelection from "./PageSelection";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageSelection />
    </Suspense>
  );
}

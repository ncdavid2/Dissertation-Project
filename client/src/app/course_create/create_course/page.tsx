import React, { Suspense } from "react";
import CreateCoursePage from "./CreateCoursePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCoursePage />
    </Suspense>
  );
}

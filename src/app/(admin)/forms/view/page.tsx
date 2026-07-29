import { Suspense } from "react";
import { FormSubmissionDetailView } from "@/components/forms/form-submission-detail";
import { PageSpinner } from "@/components/ui/spinner";

export default function FormSubmissionViewPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <FormSubmissionDetailView />
    </Suspense>
  );
}

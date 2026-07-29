import { Suspense } from "react";
import { NewsEdit } from "@/components/news/news-edit";
import { PageSpinner } from "@/components/ui/spinner";

export default function NewsEditPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <NewsEdit />
    </Suspense>
  );
}

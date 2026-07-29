export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function WebsiteNewsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

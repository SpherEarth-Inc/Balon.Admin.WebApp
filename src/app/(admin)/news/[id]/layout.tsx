export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function NewsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

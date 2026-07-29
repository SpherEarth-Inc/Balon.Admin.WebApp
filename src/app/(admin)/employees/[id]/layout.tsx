export function generateStaticParams() {
  // Placeholder for static export; Apache serves this HTML for any /employees/:id/.
  return [{ id: "_" }];
}

export default function EmployeeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

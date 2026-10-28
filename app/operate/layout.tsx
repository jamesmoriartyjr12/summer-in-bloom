export default function OperateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FAF6EC",
        color: "#070F18",
        fontFamily: "var(--font-archivo)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

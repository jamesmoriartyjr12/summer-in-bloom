import "./operate.css";

export default function OperateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="operate">{children}</div>;
}

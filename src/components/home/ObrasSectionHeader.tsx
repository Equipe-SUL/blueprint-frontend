type ObrasSectionHeaderProps = {
  title: string;
};

export default function ObrasSectionHeader({
  title,
}: ObrasSectionHeaderProps) {
  return (
    <div className="list-title">
      <div className="title-left">
        <span className="blue-divider"></span>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

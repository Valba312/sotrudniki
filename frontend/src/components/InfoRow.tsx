interface Props {
  label: string;
  value: string;
}

export const InfoRow = ({ label, value }: Props) => (
  <div className="info-row">
    <span className="muted">{label}</span>
    <span>{value}</span>
  </div>
);

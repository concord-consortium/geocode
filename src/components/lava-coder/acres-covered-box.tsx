import "./acres-covered-box.scss";

interface AcresCoveredBoxProps {
  acresCovered: number;
}
export function AcresCovered({ acresCovered }: AcresCoveredBoxProps) {
  return (
    <div className="acres-covered-box">
      <div className="acres-covered-label">Total Area Covered:</div>
      <div className="acres-covered-value">
        {acresCovered.toLocaleString()} acres
      </div>
    </div>
  );
}

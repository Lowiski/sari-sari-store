import { Download, Filter } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

export default function ReportFilters({ from, to, onFrom, onTo, onApply, onExport, loading }) {
  return (
    <div className="filter-row" style={{ marginBottom: 18 }}>
      <div className="date-field"><Input label="From" type="date" value={from} onChange={(e) => onFrom(e.target.value)} /></div>
      <div className="date-field"><Input label="To" type="date" value={to} onChange={(e) => onTo(e.target.value)} /></div>
      <Button variant="dark" onClick={onApply} disabled={loading} icon={Filter}>Apply filter</Button>
      <Button variant="outline" onClick={onExport} disabled={loading} icon={Download}>Export CSV</Button>
    </div>
  );
}

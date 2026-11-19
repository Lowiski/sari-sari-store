import SearchBar from '../common/SearchBar.jsx';
import Input from '../common/Input.jsx';

export default function ProductFilters({
  search, onSearch, category, onCategory, categories = [], lowStock, onLowStock,
}) {
  return (
    <div className="filter-row">
      <SearchBar value={search} onChange={onSearch} placeholder="Search name or SKU..." />
      <div className="filter-field">
        <Input as="select" label="Category" value={category} onChange={(e) => onCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Input>
      </div>
      <label className="checkbox-line" style={{ paddingBottom: 11 }}>
        <input type="checkbox" checked={lowStock} onChange={(e) => onLowStock(e.target.checked)} />
        Low stock only
      </label>
    </div>
  );
}

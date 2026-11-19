export default function Loading({ message = 'Loading data...' }) {
  return (
    <div className="loading-box">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

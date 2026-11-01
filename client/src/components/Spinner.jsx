export default function Spinner({ size = 18, label = 'Loading' }) {
  return <span className="spinner" style={{ width: size, height: size }} role="status" aria-label={label} />;
}

export function FullPageSpinner() {
  return (
    <div className="full-page-center">
      <Spinner size={32} />
    </div>
  );
}

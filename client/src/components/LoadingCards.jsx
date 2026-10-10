export default function LoadingCards() {
  return (
    <div className="template-grid" role="status" aria-label="Loading templates">
      {Array.from({ length: 6 }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-copy" />
        </div>
      ))}
    </div>
  );
}

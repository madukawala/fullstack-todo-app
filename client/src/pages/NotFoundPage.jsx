import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="full-page-center">
      <div className="state">
        <p className="state__title">Page not found</p>
        <p className="state__text">The page you are looking for does not exist.</p>
        <Link to="/" className="button button--primary">
          Back to my todos
        </Link>
      </div>
    </main>
  );
}

import { Link, useLocation } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { pathname } = useLocation();

  return (
    <div className="not-found page-card">
      <h1>Page not found</h1>
      <p className="muted not-found__message">
        We couldn&apos;t find a page at <code className="not-found__path">{pathname}</code>.
      </p>
      <div className="not-found__actions">
        <Link to="/" className="button button--primary not-found__link">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

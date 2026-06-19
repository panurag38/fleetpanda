import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { formatUserGreeting } from '../../lib/userGreeting';
import { HomeIcon, ShieldIcon, TruckIcon } from './ui/icons';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAppContext();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const greeting = formatUserGreeting(user);

  const tiles = [
    {
      to: '/admin',
      title: 'Admin Dashboard',
      description: 'Manage fleet data, orders, inventory, and live vehicle tracking.',
      icon: <ShieldIcon />,
      visible: user.role === 'admin'
    },
    {
      to: '/driver',
      title: 'Driver Console',
      description: 'View shifts, live map updates, and complete delivery assignments.',
      icon: <TruckIcon />,
      visible: user.role === 'driver'
    }
  ].filter((tile) => tile.visible);

  return (
    <div className="homepage">
      <section className="homepage-hero page-card">
        <div className="homepage-hero__icon" aria-hidden="true">
          <HomeIcon />
        </div>
        <div>
          <p className="homepage-eyebrow">{greeting}</p>
          <h1>Fleet operations at a glance</h1>
          <p className="homepage-lead">
            Choose a workspace below to manage fleet operations or complete field deliveries.
          </p>
        </div>
      </section>

      {tiles.length > 0 ? (
        <div className="homepage-grid">
          {tiles.map((tile) => (
            <Link key={tile.to} to={tile.to} className="homepage-tile">
              <span className="homepage-tile__icon" aria-hidden="true">
                {tile.icon}
              </span>
              <div>
                <h3>{tile.title}</h3>
                <p>{tile.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className="homepage-empty page-card">
          <h3>No workspace assigned</h3>
          <p className="muted">Your account does not have an active admin or driver workspace yet.</p>
        </section>
      )}

      <section className="homepage-stats page-card">
        <h3>Quick tips</h3>
        <ul className="homepage-tips">
          <li>Use the Home and Driver toggle in the header to switch workspaces.</li>
          <li>Protected routes require the correct role before granting access.</li>
          <li>Sign out from the header when you are finished with your session.</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;

import { Link, NavLink } from 'react-router-dom';
import AIMenu from './AIMenu.jsx';
import Logo from './Logo.jsx';

export default function TopBar() {
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="מסלולי תנ״ך, דף הבית">
        <Logo />
        <span>מסלולי תנ״ך</span>
      </Link>
      <nav className="nav">
        <NavLink to="/" end>מסלולים</NavLink>
        <NavLink to="/timeline">ציר זמן</NavLink>
        <NavLink to="/threads">מארג קשרים</NavLink>
      </nav>
      <AIMenu />
    </header>
  );
}

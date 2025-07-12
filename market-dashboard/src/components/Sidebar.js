import React from 'react';
import './Sidebar.css';
import { FaStore, FaThLarge, FaClipboardList, FaHeart, FaShoppingCart, FaEnvelope, FaCommentDots, FaQuestionCircle, FaCog } from 'react-icons/fa';

const sidebarItems = [
  { icon: <FaStore />, label: 'Market' },
  { icon: <FaThLarge />, label: 'Categories' },
  { icon: <FaClipboardList />, label: 'Order' },
  { icon: <FaHeart />, label: 'Favourite' },
  { icon: <FaShoppingCart />, label: 'Cart' },
  { icon: <FaEnvelope />, label: 'Message' },
  { icon: <FaCommentDots />, label: 'Feedback' },
  { icon: <FaQuestionCircle />, label: 'Help' },
  { icon: <FaCog />, label: 'Settings' },
];

const Sidebar = ({ iconsOnly, onSelect, activePage }) => (
  <aside className={`sidebar${iconsOnly ? ' icons-only' : ''}`}>
    <nav>
      <ul>
        {sidebarItems.map((item) => (
          <li
            key={item.label}
            className={activePage === item.label ? 'active' : ''}
            onClick={() => onSelect && onSelect(item.label)}
            style={{ cursor: 'pointer' }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!iconsOnly && <span className="sidebar-label">{item.label}</span>}
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';

const AuthenticatedNavigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to='/' activeClassName='active' exact>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to='/profile' activeClassName='active'>
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to='/logout' activeClassName='active'>
            Logout
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default AuthenticatedNavigation;

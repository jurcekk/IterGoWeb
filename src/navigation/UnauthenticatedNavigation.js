import React from 'react';
import { NavLink } from 'react-router-dom';

const UnauthenticatedNavigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to='/' activeClassName='active' exact>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to='/login' activeClassName='active'>
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to='/register' activeClassName='active'>
            Register
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default UnauthenticatedNavigation;

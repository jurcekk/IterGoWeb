import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Profile from './pages/Profile';
import UsersList from './pages/UsersList';
import Navigation from './navigation/Navigation';
import AddNewDriver from './pages/AddNewDriver';

function App() {
  const { currentUser } = useContext(AuthContext);
  const RequireAuth = ({ children }) => {
    return currentUser !== null ? children : <Navigate to='/login' />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />

          <Route
            index
            element={
              <RequireAuth>
                <Navigation>
                  <Home />
                </Navigation>
              </RequireAuth>
            }
          />
          <Route path='users'>
            <Route
              index
              element={
                <RequireAuth>
                  <Navigation>
                    <Profile />
                  </Navigation>
                </RequireAuth>
              }
            />
            <Route
              path=':userId'
              element={<RequireAuth>{/* <Single /> */}</RequireAuth>}
            />
            <Route
              path='list'
              element={
                <RequireAuth>
                  <Navigation>
                    <UsersList />
                  </Navigation>
                </RequireAuth>
              }
            />
            <Route
              path='new'
              element={
                <RequireAuth>
                  <Navigation>
                    <AddNewDriver />
                  </Navigation>
                </RequireAuth>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

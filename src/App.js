import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// import List from './pages/list/List';
// import Single from './pages/single/Single';
// import New from './pages/new/New';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Profile from './pages/Profile';

function App() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const RequireAuth = ({ children }) => {
    return currentUser !== null ? children : <Navigate to='/login' />;
  };

  const RequireAdmin = ({ children }) => {
    return currentUser.role === 'admin' ? children : <Navigate to='/' />;
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
                <Home />
              </RequireAuth>
            }
          />
          <Route path='users'>
            <Route index element={<RequireAuth>{<Profile />}</RequireAuth>} />
            <Route
              path=':userId'
              element={
                <RequireAdmin>
                  <RequireAuth>{/* <Single /> */}</RequireAuth>
                </RequireAdmin>
              }
            />
            <Route
              path='new'
              element={
                <RequireAuth>
                  {/* <New inputs={userInputs} title='Add New User' /> */}
                </RequireAuth>
              }
            />
          </Route>
          <Route path='products'>
            <Route
              index
              element={<RequireAuth>{/* <List /> */}</RequireAuth>}
            />
            <Route
              path=':productId'
              element={<RequireAuth>{/* <Single /> */}</RequireAuth>}
            />
            <Route
              path='new'
              element={
                <RequireAuth>
                  {/* <New inputs={productInputs} title='Add New Product' /> */}
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

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PendingUsersList from '../components/admin/PendingUsersList';
import DriverList from '../components/user/DriverList';

const UsersList = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <>{currentUser.role === 'admin' ? <PendingUsersList /> : <DriverList />}</>
  );
};

export default UsersList;

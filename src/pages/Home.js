import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminStat from '../components/admin/AdminStat';
import TaxiStat from '../components/user/TaxiStat';

//  TODO: NAPRAVITI STATISTIKU ZA ZARADU I BROJ VOŽNJI TAXI PREDUZECA
const Home = () => {
  const { currentUser } = useContext(AuthContext);
  return <>{currentUser.role === 'admin' ? <AdminStat /> : <TaxiStat />}</>;
};

export default Home;

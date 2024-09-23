import React, { useState, useEffect, useContext } from 'react';
import InviteCodesList from '../components/user/InviteCodesList';
import InviteCode from '../components/user/InviteCode';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import { get, ref, child, set } from 'firebase/database';
import PendingDriverList from '../components/user/PendingDriverList';
import { AuthContext } from '../context/AuthContext';
import { Button } from 'antd';

const AddNewDriver = () => {
  const [codes, setCodes] = useState([]);
  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;
  const { dispatch, currentUser } = useContext(AuthContext);

  const getCodes = () => {
    const dbRef = ref(db);
    get(child(dbRef, `inviteCodes`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );
          const filteredDAta = data.filter(
            (code) => code.taxi === auth.currentUser.uid
          );
          setCodes(filteredDAta);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const hiring = (status) => {
    const updatedUser = {
      ...currentUser,
      hiring: { isHiring: status, candidates: [] },
    };
    set(ref(db, `users/${currentUser.uid}`), updatedUser).then(() => {
      dispatch({ type: 'LOGIN', payload: updatedUser });
    });
  };

  useEffect(() => {
    getCodes();
  }, [db]);

  return (
    <>
      {/* <InviteCode setCodes={setCodes} getCodes={getCodes} />
      <InviteCodesList codes={codes} getCodes={getCodes} /> */}

      {currentUser.hiring.isHiring ? (
        <>
          <Button onClick={() => hiring(false)}>Zatvori konkurs</Button>
          <h1>Lista prijavljenih kadnidata</h1>
          <PendingDriverList />
        </>
      ) : (
        <>
          <h1>Nemate raspisan konkurs</h1>
          <Button onClick={() => hiring(true)}>Raspisi konkurs</Button>
        </>
      )}
    </>
  );
};

export default AddNewDriver;

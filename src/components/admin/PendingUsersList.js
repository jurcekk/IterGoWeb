import React, { useState, useEffect } from 'react';
import { Button, Space, Table, Tag } from 'antd';
import { get, ref, child, set } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';

const PendingUsersList = () => {
  const [users, setUsers] = useState([]);

  const db = FIREBASE_DB;

  const handleAction = (record, status) => {
    const usersRef = ref(db, `users/${record.uid}/status`);
    set(usersRef, status).then(() => {
      setUsers((prev) => {
        return prev.filter((user) => user.uid !== record.uid);
      });
    });
  };

  const columns = [
    {
      title: 'Ime i prezime',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Button type='link'>{text}</Button>,
    },
    {
      title: 'Naziv firme',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Adresa',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Br. telefona',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Uloga',
      key: 'role',
      dataIndex: 'role',
      render: (_, value) => {
        return (
          <>
            <Tag color='blue' key={value}>
              {value.role.toUpperCase()}
            </Tag>
          </>
        );
      },
    },
    {
      title: 'Akcija',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            onClick={() => handleAction(record, 'accepted')}
          >
            Prihvati
          </Button>
          <Button
            type='primary'
            danger
            onClick={() => handleAction(record, 'rejected')}
          >
            Obriši
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const dbRef = ref(db);
    get(child(dbRef, `users`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );

          const filteredData = data
            .filter((user) => user.role === 'taxi' && user.status === 'pending')
            .sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
          setUsers(filteredData);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [db]);

  return <Table columns={columns} dataSource={users} />;
};

export default PendingUsersList;

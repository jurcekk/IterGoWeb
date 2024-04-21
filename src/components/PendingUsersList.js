import React, { useState, useEffect } from 'react';
import { Space, Table, Tag } from 'antd';
import { get, ref, child } from 'firebase/database';
import { FIREBASE_DB } from '../firebaseConfig';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size='middle'>
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];
const PendingUsersList = () => {
  const [users, setUsers] = useState([]);

  const db = FIREBASE_DB;

  useEffect(() => {
    // fetch users from firebaase
    const dbRef = ref(db);
    get(child(dbRef, `users`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          //   console.log(snapshot.val());
          //convert object to array
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );
          console.log(data);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });

    setUsers(data);
  }, []);

  return <Table columns={columns} dataSource={data} />;
};
export default PendingUsersList;

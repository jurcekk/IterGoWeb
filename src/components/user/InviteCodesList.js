import React from 'react';
import { Button, Space, Table, Popconfirm, message } from 'antd';
import { ref, set } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';

const InviteCodesList = ({ codes, getCodes }) => {
  const handleActivate = (code) => {
    if (code.isActive) {
      message.error('Kod je već aktivan');
      return;
    }

    set(ref(FIREBASE_DB, `inviteCodes/${code.key}`), {
      ...code,
      isActive: true,
    })
      .then(() => {
        message.success('Kod uspešno aktiviran');
        getCodes();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeactivate = (code) => {
    if (!code.isActive) {
      message.error('Kod je već deaktiviran');
      return;
    }
    set(ref(FIREBASE_DB, `inviteCodes/${code.key}`), {
      ...code,
      isActive: false,
    })
      .then(() => {
        message.success('Kod uspešno deaktiviran');
        getCodes();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDelete = (code) => {
    set(ref(FIREBASE_DB, `inviteCodes/${code.key}`), null)
      .then(() => {
        message.success('Kod uspešno obrisan');
        getCodes();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Aktivan',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text) => <Button type='link'>{text ? 'Da' : 'Ne'}</Button>,
    },
    {
      title: 'Akcija',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            onClick={() => {
              handleActivate(record);
            }}
          >
            Aktiviraj
          </Button>
          <Button
            type='primary'
            danger
            onClick={() => {
              handleDeactivate(record);
            }}
          >
            Deaktiviraj
          </Button>

          <Popconfirm
            title='Obrisati kod?'
            description='Da li si siguran da želiš da obrišeš kod?'
            onConfirm={() => {
              handleDelete(record);
            }}
            onCancel={() => {}}
            okText='Da'
            cancelText='Ne'
          >
            <Button danger>Obriši</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return <Table columns={columns} dataSource={codes} />;
};

export default InviteCodesList;

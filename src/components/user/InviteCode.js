import React, { useState } from 'react';
import { Form, Input, Button, Flex, message } from 'antd';
import { ref, push, update } from 'firebase/database';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';

const InviteCode = ({ setCodes, getCodes }) => {
  const [inviteCode, setInviteCode] = useState({
    value: '',
  });
  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;

  const handleGenerateCode = () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setInviteCode({ value: result });
  };

  const onFinish = (values) => {
    if (!inviteCode.value) {
      message.error('Molim Vas generišite kod!');
      return;
    } else if (inviteCode.value.length < 6) {
      message.error('Kod mora sadržati najmanje 6 karaktera!');
      return;
    }

    values = {
      code: inviteCode.value,
      isActive: true,
      taxi: auth.currentUser.uid,
    };
    const inviteCodeRef = ref(db, 'inviteCodes');

    const key = push(inviteCodeRef, values).key;
    values = { ...values, key: key };

    update(ref(db, `inviteCodes/${key}`), values);
    setCodes((prevState) => [...prevState, values]);
    message.success('Uspešno ste dodali kod');
    setInviteCode({ value: '' });

    getCodes();
  };

  return (
    <Form
      onFinish={onFinish}
      style={{
        maxWidth: '400px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        marginTop: '20px',
        marginBottom: '50px',
      }}
      name='inviteCodeForm'
    >
      <Form.Item
        label='Kod'
        rules={[
          {
            required: true,
            message: 'Molim Vas unesite kod!',
          },
          {
            min: 6,
            message: 'Kod mora sadržati najmanje 6 karaktera!',
          },
        ]}
      >
        <Input
          value={inviteCode.value}
          onChange={(e) => {
            setInviteCode({ value: e.target.value });
          }}
        />
      </Form.Item>
      <Flex gap={'20px'}>
        <Form.Item>
          <Button type='primary' onClick={handleGenerateCode} ghost>
            Generiši kod
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Dodaj kod
          </Button>
        </Form.Item>
      </Flex>
    </Form>
  );
};

export default InviteCode;

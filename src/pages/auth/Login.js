import React from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { Flex, Row, Col, Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { get, ref } from 'firebase/database';

const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const { dispatch } = useContext(AuthContext);

  const onFinish = (values) => {
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        const userData = await get(ref(db, `users/${user.uid}`));
        if (
          (userData.val().role !== 'admin' && userData.val().role !== 'taxi') ||
          userData.val().status === 'pending'
        ) {
          messageApi.open({
            content: 'Nemate pristup',
            type: 'error',
            duration: 2,
          });
          return;
        }

        dispatch({ type: 'LOGIN', payload: userData.val() });
        navigate('/');
      })
      .catch((error) => {
        const errorMessage = error.message;
        displayMess(errorMessage);
      });
  };

  const onFinishFailed = (errorInfo) => {
    messageApi.open({
      content: 'Molim Vas popunite sva polja',
      type: 'error',
      duration: 2,
    });
  };

  const displayMess = (error) => {
    console.log('ERROR', error);
    if (error === 'Firebase: Error (auth/user-not-found).') {
      messageApi.open({
        content: 'Korisnik nije pronađen',
        type: 'error',
        duration: 2,
      });
    }
    if (error === 'Firebase: Error (auth/wrong-password).') {
      messageApi.open({
        content: 'Pogrešna šifra',
        type: 'error',
        duration: 2,
      });
    }
    if (error === 'Firebase: Error (auth/invalid-email).') {
      messageApi.open({
        content: 'Pogrešan format email adrese',
        type: 'error',
        duration: 2,
      });
    }
    if (error === 'Firebase: Error (auth/too-many-requests).') {
      messageApi.open({
        content: 'Previse zahteva, pokusajte kasnije',
        type: 'error',
        duration: 2,
      });
    }
    if (error === 'Firebase: Error (auth/invalid-credential).') {
      messageApi.open({
        content: 'Pogrešni podaci za prijavu',
        type: 'error',
        duration: 2,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Row justify='center' align='middle' style={{ minHeight: '100vh' }}>
        <Col span={8}>
          <Form
            name='basic'
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            <Form.Item
              label='Email'
              name='email'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite email adresu!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Password'
              name='password'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite šifru!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Flex justify='flex-end'>
              <a href='/register'>Nemate nalog? Registrujte se ovde</a>
            </Flex>

            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button type='primary' htmlType='submit'>
                Prijavi se
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default Login;

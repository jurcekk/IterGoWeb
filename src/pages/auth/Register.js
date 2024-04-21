import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import { Flex, Row, Col, Button, Form, Input } from 'antd';

const Register = () => {
  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;

  const { dispatch } = useContext(AuthContext);

  const onFinish = async (values) => {
    await createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        dispatch({ type: 'LOGIN', payload: user });
        navigate('/');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
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
            <a href='/login'> Prijavite se</a>
          </Flex>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type='primary' htmlType='submit'>
              Registrujte se
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Register;

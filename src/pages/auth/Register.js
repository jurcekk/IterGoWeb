import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
  FIREBASE_DB,
} from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import { Flex, Row, Col, Button, Form, Input, message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as refDb, set } from 'firebase/database';

const Register = () => {
  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;
  const storage = FIREBASE_STORAGE;
  const db = FIREBASE_DB;

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { dispatch } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();

  const handleChange = (info) => {
    const isJpgOrPng =
      info.file.type === 'image/jpeg' || info.file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Slika mora biti JPG/PNG format!');
      return;
    }
    const isLt2M = info.file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Slika mora biti manja od 2MB!');
      return;
    }

    let reader = new FileReader();

    reader.onload = function () {
      let base64String = reader.result;
      setImageUrl(base64String);
    };

    reader.readAsDataURL(info.file);
  };

  const uploadFile = async (file) => {
    setLoading(true);
    const imageRef = ref(storage, `images/${file.file.uid}`);
    const snapshot = await uploadBytes(imageRef, file.file);
    const url = await getDownloadURL(snapshot.ref);
    setImageUrl(url);
    setLoading(false);
    return url;
  };

  const onFinish = async (values) => {
    const url = await uploadFile(values.logo);

    await createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;

        const userRef = refDb(db, `users/${user.uid}`);
        set(userRef, {
          uid: user.uid,
          name: values.name,
          companyName: values.companyName,
          phone: values.phone,
          address: values.address,
          email: values.email,
          logo: url,
          role: 'taxi',
          status: 'pending',
          hiring: {
            isHiring: false,
            candidates: [],
          },
        })
          .then(() => {
            console.log('User data saved successfully!');
            dispatch({ type: 'LOGIN', payload: user });
            if (
              (user.val().role !== 'admin' && user.val().role !== 'taxi') ||
              user.val().status === 'pending'
            ) {
              messageApi.open({
                content: 'Nemate pristup',
                type: 'error',
                duration: 2,
              });
              return;
            }
            navigate('/');
          })
          .catch((error) => {
            console.log('Error saving user data: ', error);
          });
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
              label='Ime Direktora'
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite ime!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Ime Kompanije'
              name='companyName'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite ime kompanije!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Telefon'
              name='phone'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite broj telefona!',
                },
                {
                  pattern: /^[0-9\b]+$/,
                  message: 'Broj telefona može sadržati samo brojeve!',
                },
                {
                  min: 9,
                  message: 'Broj telefona mora imati najmanje 9 brojeva!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Adresa'
              name='address'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite adresu!',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label='Logo' name='logo'>
              <Upload
                name='avatar'
                listType='picture-circle'
                className='avatar-uploader'
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleChange}
                fileList={[]}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt='avatar'
                    style={{
                      width: '100%',
                    }}
                  />
                ) : (
                  <button
                    style={{
                      border: 0,
                      background: 'none',
                    }}
                    type='button'
                  >
                    {loading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      Upload
                    </div>
                  </button>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label='Email'
              name='email'
              rules={[
                {
                  required: true,
                  message: 'Molim Vas unesite email adresu!',
                },
                {
                  type: 'email',
                  message: 'Unesite validnu email adresu!',
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
                {
                  max: 20,
                  message: 'Šifra može imati najviše 20 karaktera!',
                },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                  message:
                    'Šifra mora biti 6 karaktera i sadržati najmanje jedno slovo i jedan broj!',
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
    </>
  );
};

export default Register;

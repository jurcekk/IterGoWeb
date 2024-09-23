import React, { useState, useContext } from 'react';
import {
  Card,
  Avatar,
  Divider,
  Button,
  Form,
  Input,
  Upload,
  message,
} from 'antd';
import { FIREBASE_DB, FIREBASE_STORAGE } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { ref as refDb, update } from 'firebase/database';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const { Meta } = Card;

const Profile = () => {
  const { dispatch, currentUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  console.log(currentUser);

  const db = FIREBASE_DB;
  const storage = FIREBASE_STORAGE;

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

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const onFinish = async (values) => {
    if (typeof values.logo === 'object') {
      // delete previous image, find in the string %2F and split it
      const imageNamePortion = currentUser.logo.match(/images%2F([^?]+)/);
      console.log(imageNamePortion);
      if (imageNamePortion && imageNamePortion.length > 1) {
        // Decode the URI component to get the actual image name
        const decodedImageName = decodeURIComponent(imageNamePortion[1]);
        const imageRef = ref(storage, `images/${decodedImageName}`);
        await deleteObject(imageRef);
      } else {
        return null; // Return null if the image name portion couldn't be extracted
      }

      const url = await uploadFile(values.logo);
      values = {
        ...values,
        uid: currentUser.uid,
        logo: url,
        role: currentUser.role,
        status: currentUser.status,
      };
    } else {
      values = {
        ...values,
        uid: currentUser.uid,
        logo: currentUser.logo,
        role: currentUser.role,
        status: currentUser.status,
      };
    }
    setIsEditing(false);
    await update(refDb(db, `users/${currentUser.uid}`), values);
    dispatch({ type: 'LOGIN', payload: values });
    message.success('Podaci uspešno sačuvani');
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size={150} src={currentUser.logo} />
            <div style={{ marginLeft: '30px' }}>
              <Meta
                title={<h2 style={{ marginBottom: 0 }}>{currentUser.name}</h2>}
                description={
                  <p style={{ color: '#999', marginBottom: 0 }}>
                    {currentUser.companyName}
                  </p>
                }
              />
            </div>
          </div>
          {!isEditing && (
            <Button type='primary' onClick={handleEditProfile}>
              Uredi profil
            </Button>
          )}
        </div>
        <Divider />
        <div>
          <h2>Podaci o korisniku</h2>
          <Form
            layout='vertical'
            onFinish={onFinish}
            initialValues={currentUser}
          >
            {isEditing && (
              <Form.Item label='Logo' name='logo'>
                <Upload
                  name='avatar'
                  listType='picture-circle'
                  className='avatar-uploader'
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleChange}
                  // customRequest={uploadFile}
                  fileList={[]}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt='avatar'
                      style={{
                        width: '100%',
                        borderRadius: '50%',
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
            )}

            <Form.Item label='Ime vlasnika' name='name'>
              <Input disabled={!isEditing} />
            </Form.Item>
            <Form.Item label='Ime firme' name='companyName'>
              <Input disabled={!isEditing} />
            </Form.Item>
            <Form.Item label='Email' name='email'>
              <Input disabled={!isEditing} />
            </Form.Item>
            <Form.Item label='Telefon' name='phone'>
              <Input disabled={!isEditing} />
            </Form.Item>
            <Form.Item label='Adresa' name='address'>
              <Input disabled={!isEditing} />
            </Form.Item>
            {isEditing && (
              <Button type='primary' htmlType='submit'>
                Sačuvaj
              </Button>
            )}
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

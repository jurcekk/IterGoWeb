import React, { useContext } from 'react';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Layout, Menu, theme, Button, Typography, Avatar } from 'antd';
import { CarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const { Header, Content, Sider } = Layout;
const items1 = [
  {
    key: '/',
    label: 'Home',
  },
];

const Navigation = ({ children }) => {
  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;

  const { dispatch, currentUser } = useContext(AuthContext);

  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
      disabled: currentUser.status === 'pending' ? true : false,
    };
  }

  const { role } = currentUser;

  const items2 = [
    getItem(
      `${role === 'taxi' ? 'Vozači' : 'Preduzeća'}`,
      'drivers',
      <CarOutlined />,
      [
        getItem(
          `${role === 'taxi' ? 'Lista vozača' : 'Lista preduzeća'} `,
          '/users/list'
        ),
        role === 'taxi' && getItem('Dodaj vozača', '/users/new'),
      ]
    ),
  ];

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('Signed out successfully');
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
      })
      .catch((error) => {
        // An error happened.
      });
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onClick = ({ key }) => {
    navigate(`${key}`);
  };

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ marginRight: '20px' }}>
          <Title
            level={3}
            style={{
              color: 'white',
              margin: 0,
            }}
          >
            Admin Panel
          </Title>
        </div>
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={['/']}
          items={items1}
          style={{
            flex: 1,
            minWidth: 0,
          }}
          onClick={onClick}
        />
        <Button
          type='link'
          style={{
            color: 'white',
            marginLeft: '10px',
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => navigate('/users')}
        >
          <Avatar src={currentUser.logo} />

          {currentUser.name}
        </Button>

        <div>
          <Button type='link' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          style={{
            background: colorBgContainer,
          }}
        >
          <Menu
            mode='inline'
            defaultOpenKeys={['drivers']}
            style={{
              height: '100%',
              borderRight: 0,
            }}
            items={items2}
            onClick={onClick}
          />
        </Sider>
        <Layout
          style={{
            padding: '16px 24px',
          }}
        >
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: window.innerHeight - 74,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Navigation;

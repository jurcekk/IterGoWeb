import React, { useContext } from 'react';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Breadcrumb, Layout, Menu, theme, Button, Typography } from 'antd';
import PendingUsersList from '../components/PendingUsersList';

const { Title } = Typography;

const { Header, Content, Footer } = Layout;
const items = new Array(15).fill(null).map((_, index) => ({
  key: index + 1,
  label: `nav ${index + 1}`,
}));

const Home = () => {
  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;

  const { dispatch } = useContext(AuthContext);

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
  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className='demo-logo' />
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={['1']}
          items={items}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />
        <Button type='link' ghost onClick={handleLogout}>
          Logout
        </Button>
      </Header>
      <Content
        style={{
          padding: '16px 48px',
        }}
      >
        {/* <Breadcrumb
          style={{
            margin: '16px 0',
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb> */}
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            flex: 1,
          }}
        >
          <Title level={2}>Home</Title>
          <PendingUsersList />
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default Home;

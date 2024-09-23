import React, { useState, useEffect, useContext } from 'react';
import { Button, Space, Table, Modal, Popconfirm, Input, Select } from 'antd';
import { get, push, ref, set } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';

const PendingDriverList = () => {
  const [users, setUsers] = useState([]);
  const { dispatch, currentUser } = useContext(AuthContext);
  const db = FIREBASE_DB;

  const handleDelete = (user) => {
    const updatedDrivers = currentUser.drivers.filter(
      (driverId) => driverId !== user.uid
    );

    set(ref(db, `users/${currentUser.uid}/drivers`), updatedDrivers);
    setUsers(users.filter((u) => u.uid !== user.uid));
    dispatch({
      type: 'LOGIN',
      payload: { ...currentUser, drivers: updatedDrivers },
    });
  };

  const getAllUserData = async () => {
    if (
      (currentUser?.hiring?.candidates &&
        currentUser.hiring.candidates.length === 0) ||
      !currentUser?.hiring?.candidates
    )
      return;
    const candidates = Object.values(currentUser?.hiring?.candidates);
    console.log(candidates);

    const promises = candidates.map((driverId) => getDriverData(driverId));
    const data = await Promise.all(promises);
    setUsers(data);
  };

  const getDriverData = async (driverId) => {
    const snapshot = await get(ref(db, `users/${driverId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(snapshot.val());
      const filteredData = {
        ...data,
        location: data?.location.locationString,
        key: data.uid,
      };

      return filteredData;
    }
  };

  const columns = [
    {
      title: 'Slika',
      dataIndex: 'profileImage',
      key: 'profileImage',
      render: (text) => (
        <img
          src={text}
          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          alt='profileImg'
        />
      ),
    },
    {
      title: 'Ime',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text) => <Button type='link'>{text}</Button>,
    },
    {
      title: 'Prezime',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text) => <Button type='link'>{text}</Button>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Adresa',
      dataIndex: 'location',
      key: 'locationString',
    },
    {
      title: 'Br. telefona',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Akcija',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <AddVehicleModal value={record} />

          <Popconfirm
            title='Obrisati korisnika?'
            description='Da li si siguran da želiš da obrišeš korisnika?'
            onConfirm={() => {
              handleDelete(record);
            }}
            onCancel={() => {
              console.log('CANCELLED');
            }}
            okText='Da'
            cancelText='Ne'
          >
            <Button danger>Odbij</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getAllUserData();
  }, [currentUser, db]);

  return <Table columns={columns} dataSource={users} />;
};

const AddVehicleModal = ({ value }) => {
  const [visible, setVisible] = useState(false);
  const [vehicle, setVehicle] = useState({});
  const [vehicleModel, setVehicleModel] = useState([]);
  const [modelYear, setModelYear] = useState([
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
    '2015',
    '2014',
    '2013',
    '2012',
    '2011',
    '2010',
    '2009',
    '2008',
    '2007',
    '2006',
    '2005',
    '2004',
    '2003',
    '2002',
    '2001',
    '2000',
  ]);

  const { currentUser } = useContext(AuthContext);

  const db = FIREBASE_DB;

  const getVehicleModels = async () => {
    const snapshot = await get(ref(db, `carBrands`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      setVehicleModel(data);
    }
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    console.log('EDITED VEHICLE', vehicle);
    set(ref(db, `users/${value.uid}/vehicle`), vehicle).then(() => {
      console.log('Vehicle updated');
      push(ref(db, `users/${currentUser.uid}/drivers`), value.uid).then(() => {
        console.log('Driver added');
        setVehicle(vehicle);
        setVisible(false);
      });
    });
  };
  const handleCancel = () => {
    setVisible(false);
    setVehicle({});
  };

  useEffect(() => {
    getVehicleModels();
  }, []);

  return (
    <>
      <Space size='middle'>
        <Button type='primary' ghost onClick={showModal}>
          Prihvati
        </Button>
      </Space>

      <Modal
        title='Podaci o vozilu'
        open={visible}
        onOk={handleOk}
        okText='Sačuvaj'
        cancelText='Otkaži'
        onCancel={handleCancel}
      >
        <>
          <Space size='middle'>
            <p>Boja: </p>
            <Input
              placeholder='Boja vozila'
              type='text'
              value={vehicle.color}
              onChange={(e) =>
                setVehicle((prevState) => ({
                  ...prevState,
                  color: e.target.value,
                }))
              }
            />
          </Space>
          <br />

          <Space size='middle'>
            <p>Tablice:</p>
            <Input
              placeholder='Tablice vozila'
              type='text'
              value={vehicle.licencePlate}
              onChange={(e) => {
                console.log(e);
                setVehicle((prevState) => ({
                  ...prevState,
                  licencePlate: e.target.value,
                }));
              }}
            />
          </Space>
          <br />

          <Space size='middle'>
            <p>Model:</p>
            <Select
              //   defaultValue={vehicle.model}
              placeholder='Izaberi model'
              style={{ width: '100%' }}
              onChange={(value) =>
                setVehicle((prevState) => ({
                  ...prevState,
                  model: value,
                }))
              }
            >
              {vehicleModel.map((model) => (
                <Select.Option key={model.id} value={model.value}>
                  {model.label}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <br />

          <Space size='middle'>
            <p>Godište:</p>
            <Select
              //   defaultValue={vehicle.year}
              placeholder='Izaberi godište'
              style={{ width: '100%' }}
              onChange={(value) =>
                setVehicle((prevState) => ({
                  ...prevState,
                  year: value,
                }))
              }
            >
              {modelYear.map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <br />
        </>

        {/* <Space size='middle'>
          <Button type='primary' onClick={handleSave}>
            Sačuvaj
          </Button>
          <Button type='primary' danger onClick={handleCancelEdit}>
            Otkaži
          </Button>
        </Space> */}
      </Modal>
    </>
  );
};
export default PendingDriverList;

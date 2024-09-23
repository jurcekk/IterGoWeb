import React, { useState, useEffect, useContext } from 'react';
import { Button, Space, Table, Modal, Popconfirm, Input, Select } from 'antd';
import { get, ref, set } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';

const DriverList = () => {
  const [users, setUsers] = useState([]);
  const [usersOrder, setUsersOrder] = useState([]);
  const { dispatch, currentUser } = useContext(AuthContext);
  const db = FIREBASE_DB;

  const getDistance = () => {
    let distance = 0;
    usersOrder.forEach((order) => {
      distance += +order.distance;
    });
    return distance;
  };

  const getEarnings = () => {
    let earnings = 0;
    usersOrder.forEach((order) => {
      earnings += +order.price;
    });
    return earnings;
  };

  const getDriverOrders = async (driverId) => {
    const snapshot = await get(ref(db, `orders`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const filteredData = Object.values(data).filter(
        (order) => order.driverId === driverId
      );
      setUsersOrder(filteredData);
    }
  };

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
    const promises = currentUser.drivers.map((driverId) =>
      getDriverData(driverId)
    );
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
      title: 'Podaci o autu',
      key: 'vehicle',
      dataIndex: 'vehicle',
      render: (_, value) => {
        console.log('VALUE', value);
        return <VehicleModal value={value} key={value.vehicle.licencePlate} />;
      },
    },
    {
      title: 'Akcija',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
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
            <Button danger>Obriši</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getAllUserData();
  }, [currentUser, db]);

  return (
    <Table
      columns={columns}
      dataSource={users}
      expandable={{
        onExpand: (_, record) => {
          getDriverOrders(record.uid);
        },
        expandedRowRender: (record) => {
          return (
            <p style={{ margin: 0 }}>
              Ukupna zarada: <b>{getEarnings()} din</b>
              <br />
              Ukupna pređena distanca: <b>{getDistance()} km</b>
              <br />
              Broj vožnji: <b>{usersOrder.length}</b>
            </p>
          );
        },
      }}
    />
  );
};

const VehicleModal = ({ value }) => {
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState(value.vehicle);
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

  const db = FIREBASE_DB;

  useEffect(() => {
    getVehicleModels();
  }, []);

  const getVehicleModels = async () => {
    const snapshot = await get(ref(db, `carBrands`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('DATA', data);
      setVehicleModel(data);
    }
  };

  const showModal = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setVisible(false);
  };
  const handleCancel = () => {
    setVisible(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    // Perform save operation here
    // You can access the edited vehicle data using the editedVehicle state
    // Update the vehicle data in the database or make any necessary changes
    // After saving, you can set editMode back to false to exit edit mode
    console.log('EDITED VEHICLE', editedVehicle);
    set(ref(db, `users/${value.uid}/vehicle`), editedVehicle).then(() => {
      console.log('Vehicle updated');
      setEditMode(false);
      setEditedVehicle(editedVehicle);
    });
  };

  const handleCancelEdit = () => {
    // Cancel the edit operation
    // You can reset the editedVehicle state to the original vehicle data

    setEditedVehicle(value.vehicle);
    setEditMode(false);
  };

  return (
    <>
      <Space size='middle'>
        <Button type='primary' ghost onClick={showModal}>
          Pogledaj
        </Button>
      </Space>

      <Modal
        title='Podaci o vozilu'
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {editMode ? (
          <>
            <Space size='middle'>
              <p>Boja: </p>
              <Input
                placeholder='Boja vozila'
                type='text'
                value={editedVehicle.color}
                onChange={(e) =>
                  setEditedVehicle((prevState) => ({
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
                value={editedVehicle.licencePlate}
                onChange={(e) => {
                  console.log(e);
                  setEditedVehicle((prevState) => ({
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
                defaultValue={editedVehicle.model}
                style={{ width: 120 }}
                onChange={(value) =>
                  setEditedVehicle((prevState) => ({
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
                defaultValue={editedVehicle.year}
                style={{ width: 120 }}
                onChange={(value) =>
                  setEditedVehicle((prevState) => ({
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
        ) : (
          <>
            <p>Boja: {editedVehicle.color}</p>
            <p>Tablice: {editedVehicle.licencePlate}</p>
            <p>Model: {editedVehicle.model}</p>
            <p>Godište: {editedVehicle.year}</p>
          </>
        )}
        <Space size='middle'>
          <Button type='primary' onClick={editMode ? handleSave : handleEdit}>
            {editMode ? 'Sačuvaj' : 'Izmeni'}
          </Button>
          <Button type='primary' danger onClick={handleCancelEdit}>
            Otkaži
          </Button>
        </Space>
      </Modal>
    </>
  );
};
export default DriverList;

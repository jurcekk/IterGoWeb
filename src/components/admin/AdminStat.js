import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  DatePicker,
  Space,
  message,
  Select,
} from 'antd';
import CountUp from 'react-countup';
import { get, ref } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import moment from 'moment';
import IncomeChart from '../user/IncomeChart';

const AdminStat = () => {
  const [users, setUsers] = useState([]);
  const [taxiUsers, setTaxiUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date, dateString) => {
    setStartDate(dateString);
  };

  const handleEndDateChange = (date, dateString) => {
    setEndDate(dateString);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const db = FIREBASE_DB;

  const formatter = (value) => (
    <CountUp end={value} separator=',' decimals={value % 1 !== 0 ? 2 : 0} />
  );
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    if (value === 'selected all') {
      getAllOrders();
      return;
    }
    const selectedTaxi = taxiUsers.filter((taxi) => taxi.value === value);
    getAllTaxiOrders(selectedTaxi[0].data.drivers);
  };

  const getAllTaxiOrders = (uids) => {
    const common = orders.filter((item1) =>
      uids.some((item2) => item1.driverId === item2)
    );
    setOrders(common);
  };

  const getUsersRole = (role) => {
    let usersRole = 0;
    users.forEach((user) => {
      if (user.role === role) {
        usersRole++;
      }
    });

    return usersRole;
  };

  const getDistance = () => {
    let distance = 0;
    orders.forEach((order) => {
      distance += +order.distance;
    });

    return distance;
  };

  const getProffit = () => {
    let proffit = 0;
    orders.forEach((order) => {
      proffit += +order.price;
    });

    return proffit;
  };

  const getUsers = () => {
    get(ref(db, 'users'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );

          console.log(data);
          setUsers(data);

          const filteredData = data.filter((user) => user.role === 'taxi');
          const selectData = filteredData.map((user) => {
            return {
              value: user.uid,
              label: user.name,
              data: user,
            };
          });
          setTaxiUsers([
            {
              value: 'all',
              label: 'Sva preduzeća',
              data: { drivers: data.map((user) => user.uid) },
            },
            ...selectData,
          ]);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getAllOrders = (uid) => {
    get(ref(db, 'orders'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );
          const filteredData = data.filter(
            (order) => order.status === 'completed'
          );

          setOrders(filteredData);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getAllOrders();
    getUsers();
  }, []);

  useEffect(() => {
    if (startDate && endDate && orders.length > 0) {
      const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.date);
        let start;
        let end;
        if (startDate > endDate) {
          start = new Date(endDate);
          end = new Date(startDate);
          setStartDate(endDate);
          setEndDate(startDate);
        } else {
          start = new Date(startDate);
          end = new Date(endDate);
        }

        return orderDate >= start && orderDate <= end;
      });

      setOrders(filteredOrders);
    } else if (startDate && endDate) {
      message.error('Početni datum mora biti manji od završnog datuma');
    } else {
      getAllOrders();
    }
  }, [startDate, endDate]);

  return (
    <Row gutter={24}>
      <Col span={6}></Col>
      <Col span={6}>
        <Select
          placeholder='Izaberite taxi preduzeće'
          style={{
            width: '100%',
          }}
          onChange={handleChange}
          options={taxiUsers}
        />
      </Col>

      <Col span={12}>
        <Space direction='horizontal' style={{ marginBottom: 16 }}>
          <DatePicker
            value={startDate ? moment(startDate, 'YYYY-MM-DD') : null}
            onChange={handleStartDateChange}
            placeholder='Početni Datum'
            format='YYYY-MM-DD'
          />
          <DatePicker
            value={endDate ? moment(endDate, 'YYYY-MM-DD') : null}
            onChange={handleEndDateChange}
            placeholder='Krajnji Datum'
            format='YYYY-MM-DD'
          />
        </Space>
        <Button onClick={handleReset}>Reset</Button>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Broj Korisnika'
            value={getUsersRole('user')}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Broj Vozača'
            value={getUsersRole('driver')}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Završene Vožnje'
            value={orders.length}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Ukupna Zarada'
            value={orders && getProffit()}
            formatter={formatter}
            suffix='RSD'
          />
        </Card>
      </Col>
      <Col
        span={6}
        style={{
          marginTop: 16,
        }}
      >
        <Card bordered={false}>
          <Statistic
            title='Pređeni Kilometri'
            value={orders && getDistance()}
            formatter={formatter}
            precision={2}
            suffix='km'
          />
        </Card>
      </Col>
      <Col span={24}>
        <IncomeChart taxiOrders={orders} />
      </Col>
    </Row>
  );
};

export default AdminStat;

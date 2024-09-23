import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  DatePicker,
  Space,
  message,
} from 'antd';
import CountUp from 'react-countup';
import { get, ref } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import moment from 'moment';
import IncomeChart from './IncomeChart';

const TaxiStat = () => {
  const [taxiOrders, setTaxiOrders] = useState([]);
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
  const { currentUser } = useContext(AuthContext);

  const formatter = (value) => (
    <CountUp end={value} separator=',' decimals={value % 1 !== 0 ? 2 : 0} />
  );

  const getDistance = () => {
    let distance = 0;
    taxiOrders.forEach((order) => {
      distance += +order.distance;
    });

    return distance;
  };

  const getProffit = () => {
    let proffit = 0;
    taxiOrders.forEach((order) => {
      proffit += +order.price;
    });

    return proffit;
  };

  const isDriverInUserList = (order, userDrivers) => {
    const orderDriverId = order.driverId;

    const isDriverInList = userDrivers.some(
      (driver) => driver.driverId === orderDriverId
    );

    return isDriverInList;
  };

  const getAllUsersOrders = () => {
    get(ref(db, 'orders'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = Object.keys(snapshot.val()).map(
            (key) => snapshot.val()[key]
          );
          const filteredData = data.filter(
            (order) => order.status === 'completed'
          );

          const driversOrders = filteredData.map((order) => {
            const isDriverInList = isDriverInUserList(
              order,
              currentUser.drivers
            );
            return { ...order, isDriverInList };
          });

          setTaxiOrders(driversOrders);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getAllUsersOrders();
  }, []);

  useEffect(() => {
    if (startDate && endDate && taxiOrders.length > 0) {
      const filteredOrders = taxiOrders.filter((order) => {
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

      setTaxiOrders(filteredOrders);
    } else if (startDate && endDate) {
      message.error('Početni datum mora biti manji od završnog datuma');
    } else {
      getAllUsersOrders();
    }
  }, [startDate, endDate]);

  return (
    <Row gutter={24}>
      <Col span={6}></Col>
      <Col span={18}>
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
            title='Aktivni Vozači'
            value={currentUser.drivers.length}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Završene Vožnje'
            value={taxiOrders.length}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Ukupna Zarada'
            value={getProffit()}
            formatter={formatter}
            suffix='RSD'
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card bordered={false}>
          <Statistic
            title='Pređeni Kilometri'
            value={getDistance()}
            formatter={formatter}
            precision={2}
            suffix='km'
          />
        </Card>
      </Col>
      <Col span={18}>
        <IncomeChart taxiOrders={taxiOrders} />
      </Col>
    </Row>
  );
};

export default TaxiStat;

import React, { useEffect, useState, useContext } from 'react';
import { Card } from 'antd';
import { Chart } from 'react-google-charts';
import { get, ref } from 'firebase/database';
import { FIREBASE_DB } from '../../firebaseConfig';
import { AuthContext } from '../../context/AuthContext';

const IncomeChart = ({ taxiOrders }) => {
  const { currentUser } = useContext(AuthContext);

  const db = FIREBASE_DB;
  const getIncomeByMonth = () => {
    const incomeByMonth = taxiOrders?.reduce((acc, order) => {
      const date = new Date(order.date);
      const month = date.getMonth();
      const year = date.getFullYear();

      if (year === new Date().getFullYear()) {
        acc[month] = acc[month] ? acc[month] + +order.price : +order.price;
      }

      return acc;
    }, []);

    const data = [
      ['Mesec', 'Zarada'],
      ['January', incomeByMonth[0] || 0],
      ['February', incomeByMonth[1] || 0],
      ['March', incomeByMonth[2] || 0],
      ['April', incomeByMonth[3] || 0],
      ['May', incomeByMonth[4] || 0],
      ['June', incomeByMonth[5] || 0],
      ['July', incomeByMonth[6] || 0],
      ['August', incomeByMonth[7] || 0],
      ['September', incomeByMonth[8] || 0],
      ['October', incomeByMonth[9] || 0],
      ['November', incomeByMonth[10] || 0],
      ['December', incomeByMonth[11] || 0],
    ];

    return data;
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

          // setTaxiOrders(driversOrders);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    // getAllUsersOrders();
  }, []);

  return (
    <Card
      title={`Zarada po mesecima u ${new Date().getFullYear()} godini`}
      style={{ marginTop: '20px' }}
    >
      <Chart
        width={'100%'}
        height={'400px'}
        chartType='ColumnChart'
        loader={<div>Učitavanje</div>}
        data={getIncomeByMonth()}
        options={{
          title: 'Zarada',
          hAxis: {
            title: 'Mesec',
          },
          vAxis: {
            title: 'Zarada',
          },
        }}
      />
    </Card>
  );
};

export default IncomeChart;

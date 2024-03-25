import React from 'react';

const DeliveryOrders = ({ orders, onOrderSelect }) => {
  return (
    <div>
      <h3>Delivery Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.id} onClick={() => onOrderSelect(order)}>
            Order #{order.id} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeliveryOrders;

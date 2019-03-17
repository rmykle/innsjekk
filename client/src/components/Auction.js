import React from "react";

export default ({ auction }) => {
  if (!auction || !auction.isActive) return null;
  return (
    <>
      <h3>Auksjon - Gjeldende bud</h3>
      <div className="auctionStatus">
        <p>
          <strong>{auction.leader ? auction.leader : <i>Ingen bud</i>}</strong>
        </p>
        <p>{auction.pages} sider</p> <p>{auction.price} credits</p>
      </div>
    </>
  );
};

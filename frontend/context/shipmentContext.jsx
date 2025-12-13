"use client";

import { createContext, useContext, useState } from "react";

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [senderInfo, setSenderInfo] = useState({
    senderFirstName: "",
    senderLastName: "",
    senderContact: "",
    senderAddressText: "",
    senderSubDistrict: "",
  });
  const [shipments, setShipments] = useState([]);
  const [shipmentData, setShipmentData] = useState({
    recieverFirstName: "",
    recieverLastName: "",
    recieverContact: "",
    recieverAddressText: "",
    recieverSubDistrict: "",
    packageWeight: "",
    packageSize: "",
    quantity: 1,
  });

  return (
    <ShipmentContext.Provider
      value={{
        senderInfo,
        setSenderInfo,
        shipments,
        setShipments,
        shipmentData,
        setShipmentData,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context)
    throw new Error("useShipment must be used within a ShipmentProvider");
  return context;
};

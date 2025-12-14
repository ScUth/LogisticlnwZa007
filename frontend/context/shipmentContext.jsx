"use client";

import { createContext, useContext, useState } from "react";

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipmentDrafts, setShipmentDrafts] = useState([]);
  const [senderInfo, setSenderInfo] = useState({
    senderFirstName: "",
    senderLastName: "",
    senderContact: "",
    senderAddressText: "",
    senderSubDistrict: "",
  });
  const [shipmentDraftData, setShipmentDraftData] = useState({
    recieverFirstName: "",
    recieverLastName: "",
    recieverContact: "",
    recieverAddressText: "",
    recieverSubDistrict: "",
    estimatedWeight: 0,
    size: "",
    quantity: 1,
  });

  return (
    <ShipmentContext.Provider
      value={{
        senderInfo,
        setSenderInfo,
        shipmentDrafts,
        setShipmentDrafts,
        shipmentDraftData,
        setShipmentDraftData,
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

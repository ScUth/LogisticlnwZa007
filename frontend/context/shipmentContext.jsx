"use client";

import { createContext, useContext, useState } from "react";

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipmentData, setShipmentData] = useState({
    senderFirstName: "",
    senderLastName: "",
    senderContact: "",
    senderAddressText: "",
    senderSubDistrict: "",
    recieverFirstName: "",
    recieverLastName: "",
    recieverContact: "",
    recieverAddressText: "",
    recieverSubDistrict: "",
    packageWeight: "",
    


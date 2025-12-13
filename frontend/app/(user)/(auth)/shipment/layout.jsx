import { ShipmentProvider } from "@/context/shipmentContext";

export default function ShipmentLayout({ children }) {
  return <ShipmentProvider>{children}</ShipmentProvider>;
}

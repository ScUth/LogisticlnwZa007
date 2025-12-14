import "./globals.css";
import DisableNumberScroll from "@/components/DisableNumberScroll";

export const metadata = {
  title: "DB Project Dashboard",
  description: "MERN DB demo app"
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <DisableNumberScroll />
        {children}
      </body>
    </html>
  );
}

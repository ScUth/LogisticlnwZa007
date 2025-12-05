import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";

export const metadata = {
  title: "DB Project Dashboard",
  description: "MERN DB demo app"
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

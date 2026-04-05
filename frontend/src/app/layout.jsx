import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RailBooker — Indian Railway Reservation System',
  description: 'Book train tickets online with real-time availability, seat selection, and AI-powered fare predictions. Search trains across India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

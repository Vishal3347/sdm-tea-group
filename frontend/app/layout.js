import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth';
import './globals.css';

export const metadata = {
  title: 'SDM Tea Group LLP – Sultanicherra',
  description: 'Tea Garden Management System for SDM Tea Group LLP, Sultanicherra',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e4424',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#5fa466', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

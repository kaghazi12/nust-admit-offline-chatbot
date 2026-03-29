import './globals.css';

export const metadata = {
  title: 'NUST Admit',
  description: 'Offline NUST Admissions Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

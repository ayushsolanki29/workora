export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SuperAdminRootLayout({ children }) {
  return <>{children}</>;
}

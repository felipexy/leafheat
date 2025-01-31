import "@/app/globals.css";
import { GlobalContextProvider } from "@/app/Context/store";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalContextProvider>{children}</GlobalContextProvider>
      </body>
    </html>
  );
}

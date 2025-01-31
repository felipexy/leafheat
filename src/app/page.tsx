import dynamic from "next/dynamic";

export default async function Home() {
  const Map = dynamic(() => import("../components/map/map"), { ssr: false });

  return <Map />;
}

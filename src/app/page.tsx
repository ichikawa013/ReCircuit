// src/app/page.tsx
import { redirect } from "next/navigation";
import Head from "next/head";

export default function Home() {
  // Redirect to /login
  redirect("/login");

  return (
    <>
      <Head>
        <title>Recircuit</title>
        <meta name="description" content="Recircuit platform" />
      </Head>
      {/* You can keep any other content here if needed */}
    </>
  );
}

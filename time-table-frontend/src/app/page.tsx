"use client"; // Required for client-side hooks like useRouter

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/Auth/signin"); // Redirect to /signin
  }, [router]);

  return null; // Optionally show a loading spinner
};

export default Page;

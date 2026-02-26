import React from "react";
import Link from "next/link";
import Navigation from "./components/shared/Navigation/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main style={{ padding: "2rem" }}>
      <h1>Welcome to Asset Flow</h1>
      <p>
        This is the home page of the Asset Flow application. Use the navigation
        links below to explore different sections of the app.
      </p>
    </main>
    </>
  );
}

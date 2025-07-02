import React from "react";
import Header from "./Header";

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <>
      <Header />
      <main>
        <p>Typical app structure</p>
        {count}
        <button onClick={() => setCount(count + 1)}>increment counter</button>
      </main>
    </>
  );
}

// later, we'd like to test different component forms:
/*
 * const Header = () => {
 *   return <h1>This is a header</h1>
 * };
 *
 */

export default App;

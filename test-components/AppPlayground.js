import React from "react";
import Header from "./Header";
import Content from "./Content";

import FavouriteColorContext from "./FavouriteColorProvider";
import FavouriteThemeContext from "./FavouriteThemeProvider";

function App({ children, propA, propB, propC }) {
  const [count, setCount] = React.useState(0);
  const [theme, setTheme] = React.useState("");
  const favouriteColor = React.useContext(FavouriteColorContext);
  const { theme1, theme2 } = React.useContext(FavouriteThemeContext);
  function buttonHandler() {
    setCount(count + 1);
    setTheme("dark");
    B();
  }
  function B(color) {
    favouriteColor[color];
    console.log(theme1);
    console.log(theme2);

    function C() {}
    return C();
  }
  return (
    <>
      <Header propA={propA} propB={propB} propC={propC} />
      <main>
        <p>Typical app structure</p>
        {count}
        <button onClick={() => buttonHandler}>increment counter</button>
        <Content theme={theme}>{children}</Content>
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

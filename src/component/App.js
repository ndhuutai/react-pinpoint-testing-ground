import React from "react";
import Display from "./Display";
import ButtonPanel from "./ButtonPanel";
import calculate from "../logic/calculate";
import Test from "./Test";
import "./App.css";

class App extends React.Component {
  state = {
    total: null,
    next: null,
    operation: null,
  };

  handleClick = buttonName => {
    this.setState(calculate(this.state, buttonName));
    // this.setState(calculate(this.state, buttonName));
    // this.setState(prevState => {
    //   return calculate(prevState, buttonName);
    // });
    // this.setState(prevState => {
    //   return calculate(prevState, buttonName);
    // });
  };

  render() {
    return (
      <div className="component-app">
        {/* <Display value={this.state.next || this.state.total || "0"} /> */}
        {/* <ButtonPanel clickHandler={this.handleClick} /> */}
        <Test />
      </div>
    );
  }
}

export default App;

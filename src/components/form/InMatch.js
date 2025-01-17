import React, { Component } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { createMatchForm } from "../../store/actions/matchFormActions";
import { Redirect, withRouter } from "react-router-dom";
import "./style.css";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { reactReduxFirebase } from "react-redux-firebase";

const tele_time =
  window.location.href.substring(7, 16) != "localhost:" ? 5000 : 20000;
const qm_blue = [[0, 0, 0]];
const qm_red = [[0, 0, 0]];
const qm = [
  [
    { label: "R 1: 0", value: 1 },
    { label: "R 2: 0", value: 2 },
    { label: "R 3: 0", value: 3 },
    { label: "B 1: 0", value: 4 },
    { label: "B 2: 0", value: 5 },
    { label: "B 3: 0", value: 6 }
  ]
];

const loadMatchesAndTeams = async () => {
  const response = await fetch(
    `https://www.thebluealliance.com/api/v3/event/2020onosh/matches/simple`,
    {
      headers: {
        "X-TBA-Auth-Key": `rVSoi1uFgP4KkYnjXvjtFdakv662U7rCi3wtFZ1jwNcQTiphjrlveXAo6fYG7mt7`
      }
    }
  );
  const json_temp = await response.json();
  for (let i = 0; i < json_temp.length; i++) {
    if (json_temp[i].comp_level === "qm") {
      qm_blue.push([
        parseInt(json_temp[i].alliances.blue.team_keys[0].substring(3)),
        parseInt(json_temp[i].alliances.blue.team_keys[1].substring(3)),
        parseInt(json_temp[i].alliances.blue.team_keys[2].substring(3))
      ]);

      qm_red.push([
        parseInt(json_temp[i].alliances.red.team_keys[0].substring(3)),
        parseInt(json_temp[i].alliances.red.team_keys[1].substring(3)),
        parseInt(json_temp[i].alliances.red.team_keys[2].substring(3))
      ]);
      qm.push([]);

      qm[json_temp[i].match_number] = [
        {
          label:
            "R 1: " +
            parseInt(json_temp[i].alliances.red.team_keys[0].substring(3)),
          value: 1
        },
        {
          label:
            "R 2: " +
            parseInt(json_temp[i].alliances.red.team_keys[1].substring(3)),
          value: 2
        },
        {
          label:
            "R 3: " +
            parseInt(json_temp[i].alliances.red.team_keys[2].substring(3)),
          value: 3
        },
        {
          label:
            "B 1: " +
            parseInt(json_temp[i].alliances.blue.team_keys[0].substring(3)),
          value: 4
        },
        {
          label:
            "B 2: " +
            parseInt(json_temp[i].alliances.blue.team_keys[1].substring(3)),
          value: 5
        },
        {
          label:
            "B 3: " +
            parseInt(json_temp[i].alliances.blue.team_keys[2].substring(3)),
          value: 6
        }
      ];
    }
  }
  console.log(json_temp);
  console.log(qm_red);
  console.log(qm_blue);
  console.log(qm);
  // const json_temp = await response.json();
  // for (let i = 0; i < json_temp.length; i++) {
  //   json.push(json_temp[i].team_number);
  // }
  // console.log(json);
};

loadMatchesAndTeams();

const red_field = "./field.png";
const blue_field = "./field.png";
const circlered = "./circlered.png";
const circleblue = "./circleblue.png";
const field_size = 5.7;
let starting_time;
let tele_start_time;

let auto_cycles = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];

let tele_cycles = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];

function Counter(props) {
  return (
    <div className="counter">
      <button
        className="counter-action decrement"
        onClick={function() {
          props.onChange(props.score > 0 ? -1 : 0);
        }}
      >
        {" "}
        -{" "}
      </button>
      <div className="counter-score">
        {" "}
        <p style={{ fontSize: "15px", marginBottom: "0px" }}>
          {props.displayName}
        </p>
        <div style={{ lineHeight: "20px", maxHeight: "20px" }}>
          {props.score}
        </div>
      </div>
      <button
        className="counter-action increment"
        onClick={function() {
          props.onChange(+1);
        }}
      >
        {" "}
        +{" "}
      </button>
    </div>
  );
}

function Shot(props) {
  return (
    <div className="shot">
      <div className="shot-score">
        <Counter
          score={props.score}
          onChange={props.onScoreChange}
          displayName={props.displayName}
        />
      </div>
    </div>
  );
}

class MatchType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      match_type: "AUTON"
    };
  }

  displayTime = () => {
    if (new Date().getTime() - starting_time < tele_time) {
      this.setState({
        match_type: "auton"
      });
    } else {
      this.setState({
        match_type: "teleop"
      });
    }
  };

  render() {
    return <p>{this.displayTime()}</p>;
  }
}

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timer_running: null,
      timer: 0 / 1000
    };
  }
  render() {
    let that = this.props.this;
    // this.props.state.name=this.state.timer;
    let stopTimer = () => {
      if (new Date().getTime() - that.state.match_start_time > 15000) {
        if (!this.state.timer_running) {
          this.setState({ timer_running: new Date().getTime() });
        } else {
          this.setState({
            timer_running: null,
            timer:
              this.state.timer + new Date().getTime() - this.state.timer_running
          });
          this.state.timer =
            this.state.timer + new Date().getTime() - this.state.timer_running;
        }
        that.setState({ [this.props.id]: this.state.timer });
      }
    };
    return (
      <button
        className="btn btn-danger"
        style={{ height: "60px" }}
        onClick={stopTimer}
      >
        {(this.state.timer_running === null
          ? this.props.displayName
          : "Stop Timer") +
          ": " +
          (this.state.timer / 1000).toFixed(3) +
          "s"}
      </button>
    );
  }
}

class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.type === Boolean ? false : null };
  }
  render() {
    return (
      <tr>
        <th style={{ width: "30px", paddingTop: "0px", paddingBottom: "0px" }}>
          <button
            onClick={() => {
              this.setState({ value: !this.state.value });
              console.log(!this.state.value);
              this.props.doClick({
                [this.props.statename]: !this.state.value
              });
            }}
            style={{ border: "1px solid black" }}
          >
            <div style={{ height: "20px", width: "10px" }}>
              {this.state.value ? "✓" : null}
            </div>
          </button>
        </th>
        <th style={{ width: "30px", paddingTop: "0px", paddingBottom: "0px" }}>
          <div style={{ height: "11px" }}></div>
          <p>{this.props.displayName}</p>
        </th>
      </tr>
    );
  }
}

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team_num: -1,
      field_size: field_size,
      cycle_time: [],
      auto_cycle_time: [],
      match_start_time: 0.0,
      ind_cycle_time: [],
      average: 0,
      climb_time: 0.0,
      noshow: false,
      defence_time: 0.0,
      balls_scored: 0,
      auto_balls_scored: 0,
      floor_pickup: false,
      station_pickup: false,
      stage2_activate: false,
      stage3_activate: false,
      trench: false,
      climb: false,
      preloads: 0,
      match_view: "AUTON",
      shooting_pos: [],
      shooting_pos_auto: [],
      // shooting_pos_teleop: [],
      time: 0,
      isOn: false,
      start: 0,
      inMatchView: 0,
      circle_size: 50,
      circle_show: true,
      shots: [
        {
          type: "high",
          score: 0,
          id: 1
        },
        {
          type: "low",
          score: 0,
          id: 2
        },
        {
          type: "miss",
          score: 0,
          id: 3
        }
      ],
      top: 0,
      bot: 0,
      miss: 0,
      auto_shots: [
        {
          type: "high",
          score: 0,
          id: 1
        },
        {
          type: "low",
          score: 0,
          id: 2
        },
        {
          type: "miss",
          score: 0,
          id: 3
        }
      ],
      tele_top: 0,
      tele_bot: 0,
      tele_miss: 0,
      teamSelected: null,
      dc: false,
      replay: false
    };
  }

  Circle(props) {
    try {
      let circle = (index, isRed) => {
        return (
          <img
            key={props.shooting_pos[index].index}
            src={isRed ? require(`${circlered}`) : require(`${circleblue}`)}
            width={props.circle_size}
            height={props.circle_size}
            onClick={() => {
              this.field_onClick(window.event);
            }}
            style={{
              position: "absolute",
              left:
                props.shooting_pos[index].x +
                document
                  .getElementById("match_field_image")
                  .getBoundingClientRect().left -
                props.circle_size / 2 +
                "px",
              top:
                props.shooting_pos[index].y +
                document
                  .getElementById("match_field_image")
                  .getBoundingClientRect().top -
                props.circle_size / 2 +
                window.scrollY +
                "px"
            }}
          ></img>
        );
      };
      let circles = [
        props.shooting_pos_auto.map(index => {
          return circle(index.index, false);
        }),
        props.shooting_pos
          .slice(props.shooting_pos_auto.length, props.shooting_pos.length)
          .map(index => {
            return circle(index.index, true);
          })
      ];
      return <React.Fragment>{circles}</React.Fragment>;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  updateTeamChange = () => {
    this.setState({ match_start_time: new Date().getTime() });
    try {
      this.setState({
        teamSelected: +document
          .getElementsByClassName("  css-1uccc91-singleValue")[0]
          .innerText.slice(5)
      });
      this.setState({
        team_num: this.state.teamSelected
      });
    } catch {}
  };

  onScoreChange = (index, delta) => {
    if ((new Date().getTime() - this.state.match_start_time) / 1000 <= 20) {
      this.state.auto_shots[index].score += delta;
      if (index === 0 || index === 1) {
        this.state.auto_balls_scored += delta;
      }
      if (this.state.auto_balls_scored % 5 === 0) {
        if (auto_cycles[this.state.auto_balls_scored / 5 - 1] === false) {
          auto_cycles[this.state.auto_balls_scored / 5 - 1] = true;
          this.state.auto_cycle_time.push(
            (new Date().getTime() - starting_time) / 1000
          );
          starting_time = new Date().getTime();
        }
      }
      this.setState(this.state);
    } else {
      this.state.shots[index].score += delta;
      if (index === 0 || index === 1) {
        this.state.balls_scored += delta;
      }
      if (this.state.balls_scored % 5 === 0) {
        if (tele_cycles[this.state.balls_scored / 5 - 1] === false) {
          tele_cycles[this.state.balls_scored / 5 - 1] = true;
          this.state.cycle_time.push(
            (new Date().getTime() - tele_start_time) / 1000
          );
          tele_start_time = new Date().getTime();
        }
      }
      this.setState(this.state);
    }

    this.state.average_cycle_time =
      this.arraySum(this.state.cycle_time) / this.state.cycle_time.length;
    this.state.average_auto_cycle_time =
      this.arraySum(this.state.auto_cycle_time) /
      this.state.auto_cycle_time.length;
    this.state.top = this.state.auto_shots[0].score;
    this.state.bot = this.state.auto_shots[1].score;
    this.state.miss = this.state.auto_shots[2].score;
    this.state.tele_top = this.state.shots[0].score;
    this.state.tele_bot = this.state.shots[1].score;
    this.state.tele_miss = this.state.shots[2].score;
    this.setState(this.state);
  };

  arraySum = arr => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  };

  showPreMatch = e => {
    e.preventDefault();
    this.setState({ inMatchView: 1 });
    console.log(this.state);
  };

  useEffect = () => {
    window.scrollTo(0, 0);
  };

  showInMatch = e => {
    this.useEffect();
    e.preventDefault();
    this.setState({ inMatchView: 2, preloads: this.state.preloads });
    starting_time = new Date().getTime();
    tele_start_time = new Date().getTime() + 20 * 1000;
    this.setState({
      team_num: this.state.teamSelected === null ? -1 : this.state.teamSelected
    });
    this.showMatchType();
    console.log(this.state);
  };

  showEndMatch = e => {
    this.state.shooting_pos.splice(
      0,
      // this.state.shooting_pos_auto.length == this.state.shooting_pos.length
      // ? 0:
      this.state.shooting_pos_auto.length
    );
    e.preventDefault();
    this.setState({ inMatchView: 3 });
    this.setState({
      climb_time: this.state.climb_time / 1000,
      defence_time: this.state.defence_time / 1000
    });
    console.log(this.state);
  };

  handleChange = e => {
    if (isNaN(e.target.value)) {
      this.setState({
        [e.target.id]: e.target.value
      });
    } else {
      this.setState({
        [e.target.id]: Number(e.target.value)
      });
    }
    console.log(this.state);
  };

  handleNext = e => {
    e.preventDefault();
    console.log(this.state);
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.createMatchForm(this.state);
    this.props.history.push("/home");
  };

  togglecircledisplay = () => {
    this.setState({ circle_show: !this.state.circle_show });
  };

  field_onClick = e => {
    let x = e.clientX;
    let y = e.clientY;
    x = Number(
      x -
        document.getElementById("match_field_image").getBoundingClientRect()
          .left
    ).toFixed(0);
    y = Number(
      y -
        document.getElementById("match_field_image").getBoundingClientRect().top
    ).toFixed(0);
    if (
      x >= 0 &&
      y >= 0 &&
      x <=
        document.getElementById("match_field_image").getBoundingClientRect()
          .right -
          document.getElementById("match_field_image").getBoundingClientRect()
            .left &&
      y <=
        document.getElementById("match_field_image").getBoundingClientRect()
          .bottom -
          document.getElementById("match_field_image").getBoundingClientRect()
            .top
    ) {
      let shooting_pos_copy = [...this.state.shooting_pos];
      shooting_pos_copy.push({
        x: Number(x),
        y: Number(y),
        index: this.state.shooting_pos.length
      });
      this.setState({ shooting_pos: shooting_pos_copy });
      if (new Date().getTime() - this.state.match_start_time < tele_time) {
        this.setState({ shooting_pos_auto: shooting_pos_copy });
      }
      // console.log([
      //   document.getElementById("match_field_image").getBoundingClientRect()
      //     .left,
      //   document.getElementById("match_field_image").getBoundingClientRect()
      //     .top + window.scrollY
      // ]);
    }
  };

  incrementPreload = e => {
    e.preventDefault();
    if (this.state.preloads + 1 > 3) {
      this.setState({
        preloads: 3
      });
    } else {
      this.setState({
        preloads: this.state.preloads + 1
      });
    }
  };

  resetPreload = e => {
    e.preventDefault();
    this.setState({
      preloads: 0
    });
  };

  showMatchType = e => {
    this.interval = setInterval(
      () => this.setState({ match_view: "TELEOP" }),
      window.location.href.substring(7, 16) == "localhost" ? 5000 : tele_time
    );
  };

  clearMatchType = e => {
    clearInterval(this.interval);
  };

  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />;
    let newMatchForm =
      this.state.inMatchView === 0 ? (
        <form
          className="white"
          onSubmit={this.showPreMatch}
          style={{
            marginTop: "0px"
          }}
        >
          <div className="input-field" style={{ marginBottom: "0px" }}>
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              Enter the current match number:
            </p>
            <input
              type="number"
              id="match_num"
              onChange={this.handleChange}
              placeholder="Match number"
            />
          </div>
          <div className="input-field">
            <button
              className="btn pink lighten-1"
              id="button1"
              style={{ opacity: +this.state.match_num ? 100 : 0 }}
            >
              Next
            </button>
          </div>
        </form>
      ) : null;

    let CompetingTeams =
      this.state.inMatchView === 1 ? (
        <div className="spacer">
          <h1> </h1>
          {/* <div className="container"> */}
          <div className="row">
            <div className="col-md-4" style={{ marginLeft: "15px" }}>
              <h5 style={{ fontWeight: "bold" }}>
                Select The Team You're Scouting
              </h5>
              <div onClick={this.updateTeamChange} id="teamSelect2">
                <Select
                  isSearchable={false}
                  options={qm[this.state.match_num]}
                  id="teamSelect"
                  ref="teamselect"
                />
                {console.log()}
              </div>
            </div>
            <div className="col-md-4"></div>
          </div>
          {/* </div> */}
        </div>
      ) : null;

    let prematch =
      this.state.inMatchView === 1 ? (
        <form
          className="white"
          onSubmit={this.showInMatch}
          style={{
            marginTop: "0px",
            paddingTop: "0px"
          }}
        >
          <div className="input-field">
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              Number of Preloads
            </p>
            <button
              type="number"
              id="increment_preloads"
              onClick={this.incrementPreload}
              className="preload increment"
            >
              Preloads: {this.state.preloads}
            </button>
            <button
              type="number"
              id="reset_preloads"
              onClick={this.resetPreload}
              className="preload decrement"
            >
              Reset Preloads
            </button>
          </div>
          <div className="input-field">
            <button
              onClick={this.updateTeamChange}
              className="btn pink lighten-1"
              onSubmit={() => {
                this.getCurrentTime();
              }}
              id="button2"
            >
              Next
            </button>
          </div>
        </form>
      ) : null;

    let matchField = (
      <img
        src={require(`${red_field}`)}
        width={86 * 1.3 * field_size}
        height={47 * 1.3 * field_size}
        onClick={this.field_onClick}
        id="match_field_image"
      ></img>
    );

    let boolCheckMap = () => {
      let boolCheckMapList = [
        ["Did Floor Pickup", "floor_pickup"],
        ["Did Station Pickup", "station_pickup"],
        ["Climb Successful", "climb"],
        ["Stage 2 Activated - Turn Table Light", "stage2_activate"],
        ["Stage 3 Activated - Turn Table Light", "stage3_activate"],
        ["Did Go Under Trench", "trench"],
        ["Did They D/C", "dc"],
        ["Match is a replay", "replay"],
        ["Robot was a no show", "noshow"]
      ];
      return boolCheckMapList.map(index => (
        <Checkbox
          key={index[0]}
          type={Boolean}
          displayName={index[0]}
          doClick={state => {
            this.setState(state);
          }}
          statename={index[1]}
          key={index[1]}
        />
      ));
    };

    let endMatchForm =
      this.state.inMatchView === 3 ? (
        <div className="container">
          <div className="input-field">
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              End of Match Form
            </p>
          </div>
          <table>
            <tbody>{boolCheckMap()}</tbody>
          </table>

          <form className="white" onSubmit={this.handleSubmit}>
            <div className="input-field">
              <button className="btn pink lighten-1" id="button4">
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : null;

    let inMatchForm = this.state.inMatchView === 2 ? matchField : null;

    let showncircle = this.state.circle_show ? this.Circle(this.state) : null;

    let shotNames = ["Top", "Bot", "Miss"];

    let scoreboard =
      this.state.inMatchView === 2 ? (
        new Date().getTime() - this.state.match_start_time <= 20 * 1000 ? (
          <span className="scoreboard">
            <span className="shots">
              {this.state.auto_shots.map(
                function(shot, index) {
                  return (
                    <Shot
                      onScoreChange={function(delta) {
                        this.onScoreChange(index, delta);
                      }.bind(this)}
                      score={shot.score}
                      key={index}
                      displayName={shotNames[index]}
                    />
                  );
                }.bind(this)
              )}
            </span>
          </span>
        ) : (
          <span className="scoreboard">
            <span className="shots">
              {this.state.shots.map(
                function(shot, index) {
                  return (
                    <Shot
                      onScoreChange={function(delta) {
                        this.onScoreChange(index, delta);
                      }.bind(this)}
                      score={shot.score}
                      key={index}
                      displayName={shotNames[index]}
                    />
                  );
                }.bind(this)
              )}
            </span>
          </span>
        )
      ) : null;

    let field_input =
      this.state.inMatchView === 2 ? (
        <div>
          <table className="FieldInput">
            <tbody>
              <tr>
                <td style={{ width: "200px" }}>
                  <h1>{this.state.match_view}</h1>
                  <Timer
                    this={this}
                    name={this.state.defence_time}
                    displayName="Defence Timer"
                    id="defence_time"
                  />
                  <div style={{ height: "15px" }} />
                  {scoreboard}
                  <Timer
                    this={this}
                    name={this.state}
                    displayName="Climb Timer"
                    id="climb_time"
                  />
                </td>
                <td width="500px">{inMatchForm}</td>
              </tr>
            </tbody>
          </table>
          {showncircle}
          <div className="input-field">
            <button
              className="btn pink lighten-1"
              onClick={this.showEndMatch}
              id="button3"
            >
              Next
            </button>
          </div>
        </div>
      ) : null;

    return (
      <div>
        <div>{}</div>
        <span>
          {newMatchForm}
          {CompetingTeams}
          {prematch}
          {/* {team_select} */}
          {field_input}
          {endMatchForm}
        </span>
      </div>
    );
  }
  componentDidMount() {
    document.getElementById("button1").focus();
    // ReactDOM.unmountComponentAtNode(
    //   document.getElementsByClassName("nav-wrapper grey darken-3")
    // );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.inMatchView != this.state.inMatchView) {
      document.getElementById("button" + (this.state.inMatchView + 1)).focus();
    }
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createMatchForm: project => dispatch(createMatchForm(project))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));

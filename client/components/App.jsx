import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {List, ListItem} from 'material-ui/List';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import DoneAll from 'material-ui/svg-icons/action/done-all';

class Activity extends Component {

  /**To update the status of the Activity */
  update = (checked) => {
    this.props.updateStatusActivity(this.props.activityId);
  }

  /**To delete one Activity */
  delete = (activity) => {
    this.props.deleteActivity(this.props.activityId);
  }

  render() {
    return(
      <ListItem leftCheckbox = { <Checkbox checked = {this.props.status} onCheck = { this.update.bind(this) } /> } primaryText = {this.props.name} rightIconButton = { <FlatButton icon = { <ActionDelete /> } onClick = { this.delete.bind(this) } />} />
    );
  }
}

class ActivityList extends Component {
  state = {
    activities : [],
    selectAll : false
  }

  addNewActivity = (activityInfo) => {
    console.log("Entra");
    this.setState({
      activities : [...this.state.activities, { name : activityInfo, status : false, id : this.state.activities.length }]
    }, ()=> console.log("se salio"))
  };

  updateStatusActivity = (id) => {
    console.log(id);
    this.setState(prevState => ({
      activities : prevState.activities.map((activity, key) => {
        if(activity.id === id) {
          activity.status = activity.status ? false : true;
        }

        return activity
      })
    }), () => console.log(this.state.activities) )
  };

  deleteActivity = (id) => {
    console.log(id);
    this.setState(prevState => ({
      activities : prevState.activities.filter((activity, key) => {
        return activity.id !== id;
      })
    }));
  };

  updateAllActivities = () => {
    console.log("Actualiza todo");
    this.setState(prevState => ({
      activities : prevState.activities.map((activity, key) => {
       
        this.state.selectAll ? activity.status = false : activity.status = true;

        return activity
      }), selectAll : !prevState.selectAll
    }))
  }

  render() {
    return(
      <div>
        <Form onSubmit = { this.addNewActivity } updateAllActivities = { this.updateAllActivities} />
        <br />
        <MuiThemeProvider>
          <List>
            { this.state.activities.map((activity, id) => <Activity key = {id} activityId = { activity.id } status = { activity.status } updateStatusActivity = {this.updateStatusActivity} name = { activity.name } deleteActivity = { this.deleteActivity } />) }
          </List>
        </MuiThemeProvider>
      </div>
    );
  }
}

class Form extends Component {
  state = {
    activity : ''
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.props.onSubmit(this.state.activity);
    this.setState( {activity : ''} )
  };

  render() {
    return(
      <MuiThemeProvider>
        <form onSubmit = { this.handleSubmit }>
          <FlatButton icon = { <DoneAll /> } onClick = { this.props.updateAllActivities } />
          <TextField type = "text" value = { this.state.activity } onChange = { (event) => this.setState({ activity : event.target.value }) } hintText="ToDo Activity"/>
          <FlatButton label="Add ToDo" type = "submit" />            
        </form>
      </MuiThemeProvider >
    );
  }
}

class App extends React.Component {
  render() {
    return(
      <ActivityList />
    );
  }
}

export default App;
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {List, ListItem} from 'material-ui/List';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import DoneAll from 'material-ui/svg-icons/action/done-all';
import Create from 'material-ui/svg-icons/content/create'
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import AppBar from 'material-ui/AppBar';
import * as firebase from 'firebase';
import _ from 'lodash';
import Badge from 'material-ui/Badge';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Avatar from 'material-ui/Avatar';
import Dialog from 'material-ui/Dialog';

/********************************/
/**Firebase *********************/
/********************************/
 // Initialize Firebase
 var config = {
  apiKey: "AIzaSyC7tCMzGS9iU8LbuonDzHFAc09HsVj6yiM",
  authDomain: "reactjstodo-93a9f.firebaseapp.com",
  databaseURL: "https://reactjstodo-93a9f.firebaseio.com",
  projectId: "reactjstodo-93a9f",
  storageBucket: "reactjstodo-93a9f.appspot.com",
  messagingSenderId: "637042479355"
};

firebase.initializeApp(config);

const activitiesFirebase = firebase.database().ref().child('activities');   //activities table

/********************************/
/********************************/
/********************************/

const styles = {
  underlinedActivity : {
    textDecoration: 'line-through'
  }
}

class Activity extends Component {

  /**To update the status of the Activity */
  update = (checked) => {
    this.props.updateStatusActivity(this.props.activityId);
  }

  /**To delete one Activity */
  delete = (activity) => {
    this.props.deleteActivity(this.props.activityId);
  }

  edit = (activity) => {
    console.log("Entra al edit(). ID:" + this.props.activityId + ". Activity: " + this.props.name)
    this.props.editActivity(this.props.activityId, this.props.name)
  }

  render() {
    return(
      <ListItem leftCheckbox = { <Checkbox checked = { this.props.status } onCheck = { this.update.bind(this) } /> } primaryText = { this.props.name } rightIconButton = { <span><FlatButton icon = { <Create /> } onClick = { this.edit.bind(this) } /> <FlatButton icon = { <ActionDelete /> } onClick = { this.delete.bind(this) } /></span> } style = { this.props.status && styles.underlinedActivity } />
    );
  }
}

/**Enum with the statuses of the activities */
const filterEnum = {
  all : 0,
  active : 1,
  completed : 2
};

class ActivityList extends Component {
  state = {
    activities : [],
    currentFilter : filterEnum.all,     //returns all the activities
    selected : false,
    logged : false,
    displayName : null,
    email : null,
    photoURL : '',
    open : false,         //Dialog open state
    activityName : '',    //Dialog activity name
    activityId : ''       //Dialog activity id
  }

  componentWillMount() {

    firebase.auth().onAuthStateChanged(function(user) {         //Avoids to add items in the DB
      if(user) {
        this.setState({
          logged : true,
          displayName : user.displayName,
          email : user.email,
          photoURL : user.photoURL
        })

        if(this.state.logged) {         //Checks if the user is logged
          activitiesFirebase.on("child_added", function(snapshot) {           //Populates the list
            this.setState((prevState) => ({
              activities : [...prevState.activities, snapshot.val()]
            }))
          }.bind(this));          //bind(this) takes the context of the outer state

          activitiesFirebase.on('child_changed', function(snapshot) {         //Updates the item
            this.setState((prevState) => ({
              activities : prevState.activities.map((activity, key) => {
                if(activity.id === snapshot.val().id){
                  activity = snapshot.val();
                }
                return activity;
              })
            }))
          }.bind(this));          //bind(this) takes the context of the outer state

          activitiesFirebase.on('child_removed', function(snapshot) {         //Removes the item
            this.setState((prevState) => ({
              activities : prevState.activities.filter((activity, key) => {
                return activity.id !== snapshot.val().id;
              })
            }))
          }.bind(this));          //bind(this) takes the context of the outer state
        }
      } else {
        this.setState({
          logged : false,
          displayName : null,
          email : null,
          photoURL : null,
          activities : []
        })
      }
    }.bind(this))         //bind(this) takes the context of the outer state

    console.log("entra componentWillMount")
   }

  addNewActivity = (activityInfo) => {
    var newActivityKey = activitiesFirebase.push();         //Creates a new record

    newActivityKey.set({
      activity : activityInfo,
      id : newActivityKey.key,                      //Inserts the ID (key)
      status : false
    });
  }

  updateStatusActivity = (id) => {
    console.log(id);
    var updateActivity = activitiesFirebase.child(id);

    updateActivity.once('value', function(snapshot) {
      updateActivity.update({ status : !snapshot.val().status })
    });
  }

  /**Opens the dialog with the form */
  editActivity = (activityId, activityName) => {
    console.log("editActivity(): " + activityId + ", " + activityName)

    this.setState({
      open : true,
      activityId : activityId,
      activityName : activityName
    })
  };

  /**Closes the dialog */
  editActivityClose = () => {
    this.setState({
      open : false,
      activityName : '',
      activityId : ''
    })
  }

  handleEditActivity = (event) => {
    event.preventDefault();
    
    var editActivity = activitiesFirebase.child(this.state.activityId);

    editActivity.once('value', function(snapshot) {
      editActivity.update({ activity : this.state.activityName })
    }.bind(this));

    this.setState({
      open : false,
      activityName : '',
      activityId : ''
    })
  }

  deleteActivity = (id) => {
    activitiesFirebase.child(id).remove();
  }

  updateAllActivities = () => {
    console.log("actualiza todo");

    this.state.activities.forEach((activity, key) => {
      let updateAllActivities = activitiesFirebase.child(activity.id);
      
      updateAllActivities.once('value', function(snapshot) {
        if(this.state.selected === false) {
          updateAllActivities.update({ status : true })
        } else {
          updateAllActivities.update({ status : false })
        }
      }.bind(this));          //I make a reference to the outer state context
    });

    this.setState(prevState => ({       //Changing the state of all activities
      selected : !prevState.selected
    }));
  }

  deleteDoneActivities = () => {
    this.state.activities.forEach((activity, key) => {
      if(activity.status === true) {
        activitiesFirebase.child(activity.id).remove();
      }
    })
  }

  filterActivites = (f) => {
    activitiesFirebase.once('value', function(snapshot) {
      this.setState(prevState => ({
        activities : _.filter(snapshot.val(), (activity, key) => {
         
          switch(f) {
            case filterEnum.active:
              return !activity.status ? true : false;
            break;
            case filterEnum.completed:
              return activity.status ? true : false;
            break;
            case filterEnum.all:
              return true;
          }
  
        }), currentFilter : f     //If I add a new item, independiently of the view (if I'm watching the completed, active or all), I don't change the current view. 
      }))  
    }.bind(this));   
  } 

  login = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      console.log("Se loggeo: " + user);

      this.setState(prevState => ({
        logged : !prevState.logged
      }));

    }.bind(this)).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
    });
  }

  logout = () => {
    firebase.auth().signOut().then(function() {
      console.log("Salió");

      this.setState(prevState => ({
        logged : false
      }))
    }.bind(this))
  }

  render() {
    return(
        <div>
          <MuiThemeProvider>
            <Dialog title = "Edit ToDo" open = { this.state.open } >
              <form onSubmit = { this.editActivity }>
                <TextField name = "activityName" defaultValue = { this.state.activityName } onChange = { (event) => this.setState({ activityName : event.target.value }) } />
                <br /><br />
                <FlatButton label="Edit" type = "submit" onClick = { this.handleEditActivity } />
                <FlatButton label="Cancel" onClick = { this.editActivityClose } />
              </form>
            </Dialog>
          </MuiThemeProvider>
          <MuiThemeProvider>
            <AppBar
              iconElementLeft = { <Avatar src = { this.state.photoURL } /> }
              title = { this.state.displayName }
              iconElementRight = { this.state.logged === false ? <FlatButton label = "Log In" onClick = { this.login } /> : <FlatButton label = "Log Out" onClick = { this.logout } /> }
            />
          </MuiThemeProvider>
          <br />
          { this.state.logged === true ? 
              <Form onSubmit = { this.addNewActivity } updateAllActivities = { this.updateAllActivities} />
              :
              <MuiThemeProvider>
                <Toolbar>
                  <ToolbarGroup style = {{ float: 'none', marginLeft: 'auto', marginRight: 'auto' }}>
                    <ToolbarTitle text = "You must be logged to add an activity!" />
                  </ToolbarGroup>
                </Toolbar>
              </MuiThemeProvider>
          }
          <br />
          <MuiThemeProvider>
            <List>
              { this.state.activities.map((activity, id) => <Activity key = {id} activityId = { activity.id } status = { activity.status } updateStatusActivity = {this.updateStatusActivity} name = { activity.activity } editActivity = { this.editActivity } deleteActivity = { this.deleteActivity } />) }
            </List>
          </MuiThemeProvider>
          { this.state.logged === true &&
              <MuiThemeProvider>
                <Toolbar>
                    <ToolbarGroup firstChild = { true } >
                        <Badge badgeContent = { this.state.activities.length } primary = { true }>
                          <NotificationsIcon />
                        </Badge>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <FlatButton label = "All" onClick = { () => this.filterActivites(filterEnum.all) } />
                        <FlatButton label = "Active" onClick = { () => this.filterActivites(filterEnum.active) } />
                        <FlatButton label = "Completed" onClick = { () => this.filterActivites(filterEnum.completed) } />
                        <FlatButton label = "Remove Done" onClick = { () => this.deleteDoneActivities() } />
                    </ToolbarGroup>
                  </Toolbar>
              </MuiThemeProvider>
          }
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
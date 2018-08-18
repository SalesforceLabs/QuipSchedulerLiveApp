import React, { Component } from 'react';
import moment from 'moment';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';

export default class App extends Component {

    state = {
        record: null,
        containerWidth: 800,
        dates: [],
        googleLogin: false
    }

    componentDidMount() {
        this.updateContainerWidth();
        this.updateDates();
        this.updateGoogleLogin();

        this.setState({
            record: this.props.record
        });

        // Start listening for updates from other users/devices
        this.props.record.listen(this.remoteUpdateHandler);

        const timeslots = this.props.record.get('timeSlots');
        if (timeslots) {
            timeslots.listen(this.remoteUpdateHandler);
        }

        quip.apps.addEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, this.updateContainerWidth);
    }

    componentWillUnmount() {
        // Stop listening for updates from other users/devices
        this.props.record.unlisten(this.remoteUpdateHandler);

        const timeslots = this.props.record.get('timeSlots');
        if (timeslots) {
            timeslots.listen(this.remoteUpdateHandler);
        }

        quip.apps.removeEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, this.updateContainerWidth);
    }

    updateGoogleLogin = () => {
        const google = quip.apps.auth('google');
        if (google) {
            this.setState({ googleLogin: google.isLoggedIn() });
        }
    }

    updateMenu = () => {
        const commandList = ['google-header'];
        if (this.state.googleLogin) {
            commandList.push('google-logout');
        } else {
            commandList.push('google-login');
        }

        const menuCommands = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: commandList
            },
            {
                id: 'google-header',
                label: 'Calendar Integration',
                isHeader: true
            },
            {
                id: 'google-login',
                label: 'Connect to Google…',
                handler: this.googleLoginHandler
            },
            {
                id: 'google-logout',
                label: 'Disconnect Google',
                handler: this.googleLogoutHandler
            }
        ];
        const toolbarCommandIds = [ quip.apps.DocumentMenuCommands.MENU_MAIN ];
        const disabledCommandIds = [];

        quip.apps.updateToolbar({
            toolbarCommandIds: toolbarCommandIds,
            menuCommands: menuCommands,
            disabledCommandIds: disabledCommandIds
        });
    }

    googleLoginHandler = () => {
        const google = quip.apps.auth('google');
        if (google) {
            google.login({
                access_type: 'offline',
                prompt: 'consent'
            })
                .then(() => {
                    console.log('Google login successful!');
                    this.setState({ googleLogin: true });
                })
                .catch(err => {
                    console.log('Error while logging into Google', err);
                    this.setState({ googleLogin: false });
                });
        }
    }

    googleLogoutHandler = () => {
        const google = quip.apps.auth('google');
        if (google) {
            google.logout()
                .then(() => {
                    this.setState({ googleLogin: false });
                });
        }
    }

    updateContainerWidth = () => {
        this.setState({ containerWidth: quip.apps.getContainerWidth() });
    }

    remoteUpdateHandler = () => {
        this.updateDates();
    }

    updateDates() {
        // Calculate days
        const editable = quip.apps.isDocumentEditable() && quip.apps.getViewingUser();

        let timeslots = [];
        if (this.props.record.has('timeSlots')) {
            timeslots = this.props.record.get('timeSlots').getRecords();
        }

        const startOfDays = [];
        let days = [];

        for (let timeslot of timeslots) {
            let time = timeslot.get('startTime');
            let startOfDay = moment(time).startOf('day').valueOf();
            if (startOfDay >= moment().startOf('day')) {
                if (startOfDays.indexOf(startOfDay) == -1) {
                    startOfDays.push(startOfDay);

                    days.push({
                        timestamp: startOfDay,
                        configuring: false,
                        timeslots: [timeslot]
                    });
                } else {
                    let day = days.find(day => day.timestamp == startOfDay);
                    if (day) {
                        day.timeslots.push(timeslot);
                    }
                }
            }
        }

        // Check if there are any empty dates locally
        // These are dates we're currently working on and shouldn't be deleted
        const emptyDates = this.state.dates.filter(date => date.timeslots.length == 0 && date.timestamp > 0);
        days.push(...emptyDates);
        
        days.sort((dateA, dateB) => {
            return dateA.timestamp - dateB.timestamp;
        });

        if (editable && quip.apps.getContainerWidth() == 800) {
            if (days.length == 0) {
                days.push({
                    timestamp: 0,
                    configuring: true,
                    timeslots: []
                });
            } else {
                days.push({
                    timestamp: 0,
                    configuring: false,
                    timeslots: []
                });
            }
        }

        this.setState({
            dates: days
        });
    }

    dismissDatePickerHandler = (timestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == timestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                configuring: false
            };

            const newDates = [...this.state.dates];
            newDates[index] = newDay;

            const emptyDate = newDates.find(date => date.timestamp == 0);
            if (!emptyDate) {
                newDates.push({
                    timestamp: 0,
                    configuring: false,
                    timeslots: []
                });
            }

            this.setState({
                dates: newDates
            });
        }
    }

    openDatePickerHandler = (timestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == timestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                configuring: true
            };

            const newDates = [...this.state.dates];
            newDates[index] = newDay;

            this.setState({
                dates: newDates
            });
        }
    }

    setDateHandler = (oldTimestamp, newTimestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == oldTimestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            // we need to update
            const today = moment();
            const startOfToday = today.startOf('day');

            if (newTimestamp >= startOfToday.valueOf()) {

                const newDay = {
                    ...day,
                    timestamp: newTimestamp
                };

                const newDates = [...this.state.dates];
                newDates[index] = newDay;

                newDates.sort((dateA, dateB) => {
                    return dateA.timestamp - dateB.timestamp;
                });

                this.setState({
                    dates: newDates
                }, () => {
                    this.dismissDatePickerHandler(newTimestamp);
                });

            } else {
                this.setState({
                    dates: [...this.state.dates]
                }, () => {
                    this.dismissDatePickerHandler(oldTimestamp);
                });
            }

        }
    }

    createTimeslotHander = (startOfDay, startTime, endTime) => {
        const newTimeslot = this.props.record.get('timeSlots').add({
            startTime: startTime,
            endTime: endTime
        });

        const index = this.state.dates.findIndex(date => date.timestamp == startOfDay);
        
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                timeslots: [
                    ...day.timeslots,
                    newTimeslot
                ]
            };

            const newDates = [...this.state.dates];
            newDates[index] = newDay;

            this.setState({
                dates: newDates
            });
        } else {
            this.setState({
                dates: [...this.state.dates]
            });
        }
    }

    deleteTimeslotHandler = (startOfDay, slotRecord) => {
        const myStartTime = slotRecord.get('startTime');
        const myEndTime = slotRecord.get('endTime');

        const myDateIndex = this.state.dates.findIndex(date => date.timestamp == startOfDay);
        if (myDateIndex > -1) {
            const myDate = this.state.dates[myDateIndex];
            const newTimeslots = myDate.timeslots.filter(slot => {
                const startTime = slot.get('startTime');
                const endTime = slot.get('endTime');

                return !(startTime == myStartTime && endTime == myEndTime);
            });

            const myNewDate = {
                ...myDate,
                timeslots: newTimeslots
            };

            const newDates = [...this.state.dates];
            newDates[myDateIndex] = myNewDate;

            slotRecord.delete();
            this.setState({
                dates: newDates
            });
        }
    }

    deleteDayHandler = (startOfDay) => {
        const newDates = this.state.dates.filter(date => date.timestamp != startOfDay);

        this.setState({
            dates: newDates
        });
    }

    checkIfDateExists = (startOfDay) => {
        return this.state.dates.find(d => d.timestamp == startOfDay);
    }

    render() {

        this.updateMenu();

        return <div>
            <Scheduler
                days={this.state.dates}
                openDatePicker={this.openDatePickerHandler}
                dismissDatePicker={this.dismissDatePickerHandler}
                setNewDate={this.setDateHandler}
                deleteDate={this.deleteDayHandler}
                validateDate={this.checkIfDateExists}
                createTimeslot={this.createTimeslotHander}
                deleteTimeslot={this.deleteTimeslotHandler}
                containerWidth={this.state.containerWidth}
                googleLogin={this.state.googleLogin} />
        </div>;
    }
}
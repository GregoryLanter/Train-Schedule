# Train-Schedule
## Features
The train scheduler will pull in existing schedules from a firebase database. Then the user can add a new train, remove a train or update a train. When a train is withing 20 minutes of arrival the text in  the schedule will turn yellow. When a train is within 10 minutes of arriving the text will turn red. The input is in a modal form that can be accessed by clicking Add train. the same modal is used for updating. Clicking update with bring up the modal and load the current values of all the fields.

##Technical decisions
We have an object that holds the entered data. We put those in an array. Any update must be done in three places, on the screen, on the database and in the array. We do this so we are not contantly looking to the data base. We calculate next arrival and minutes away.
We take train start time minus current time using moment.js. This gives us the difference in minutes. if we take the frequency and subtract the result of taking diff modulo frequency it will give us the minutes until the next train. We can take this and add it to current time to get the arrival date.
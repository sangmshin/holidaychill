'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var stateTracker;

var stateHandlers = {
    'LaunchRequest': function () {
        stateTracker = "askMode";
        
        this.response.speak(this.t('WELCOME_MSG')).listen(this.t('HELP_MSG'));
        this.emit(':responseReady');
    },
    'Meditation_Intent': function () {

        stateTracker = "meditation"
        controller.play.call(this, this.t('', { skillName: audioData.title }));

    },
    'SoundsOfWinter_Intent': function () {

        stateTracker = "soundsOfWinter"
        controller2.play.call(this, this.t('', { skillName: audioData.title }));

    },

    'Help_Intent': function () {
        this.response.speak(this.t('HELP_MSG')).listen(this.t('HELP_MSG'))
        // this.response.listen(this.t('HELP_MSG'))
        // this.response.listen(this.t('HELP_MSG', { skillName: audioData.title } ));
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        // this.response.listen(this.t('HELP_MSG'))
        this.response.speak(this.t('HELP_MSG')).listen(this.t('HELP_MSG'))
        this.emit(':responseReady');
        // this.emit('Help_Intent');
    },
    
    'SessionEndedRequest': function () {
        // No session ended logic
    },
    'ExceptionEncountered': function () {
        console.log("\n******************* EXCEPTION **********************");
        console.log("\n" + JSON.stringify(this.event.request, null, 2));
        this.callback(null, null)
    },
    'Unhandled': function () {
        this.response.speak(this.t('UNHANDLED_MSG'));
        this.emit(':responseReady');
    },
    'AMAZON.NextIntent': function () {
        if (stateTracker == "soundsOfWinter") {
            this.emit('Meditation_Intent');

        } else if (stateTracker == "meditation") {
            this.emit('SoundsOfWinter_Intent');

        } else if (stateTracker == "askState") {
            this.response.speak(this.t('UNHANDLED_MSG'));
            this.emit(':responseReady');
        }
        
    },
    'AMAZON.PreviousIntent': function () { 
        if (stateTracker == "soundsOfWinter") {
            this.emit('Meditation_Intent');

        } else if (stateTracker == "meditation") {
            this.emit('SoundsOfWinter_Intent');

        } else if (stateTracker == "askState") {
            this.response.speak(this.t('UNHANDLED_MSG'));
            this.emit(':responseReady');
        }
    },

    'AMAZON.PauseIntent':   function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.CancelIntent':  function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.StopIntent':    function () { controller.stop.call(this, this.t('STOP_MSG')) },

    'AMAZON.ResumeIntent':  function () { controller.play.call(this, this.t('RESUME_MSG')) },

    'AMAZON.LoopOnIntent':     function () { this.emit('AMAZON.StartOverIntent'); },
    'AMAZON.LoopOffIntent':    function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOnIntent':  function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOffIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.StartOverIntent':  function () { 
        if (stateTracker == "soundsOfWinter") {
            var say = "Would you like to listen to the sounds of winter again, or go all the way back to the beginning?"

        } else if (stateTracker == "meditation") {
            var say = "Would you like to restart the meditation, or go all the way back to the beginning?"

        } else if (stateTracker == "askState") {
            var say = "Would you like to meditate or listen to the sounds of winter, or go all the way back to the beginning?"
        }

        this.response.speak(say).listen(say);
        this.emit(':responseReady');
    },
    'Beginning_Intent': function () {
        
        this.response.speak("Okay, let's start over. " + this.t('WELCOME_MSG')).listen(this.t('HELP_MSG'));
        this.emit(':responseReady');
    },

    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued':  function () { controller.play.call(this, this.t('WELCOME_MSG', { skillName: audioData.title } )) },
    'PauseCommandIssued': function () { controller.stop.call(this, this.t('STOP_MSG')) }
}

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */

            if (canThrowCard.call(this)) {
                var cardTitle   = audioData.subtitle;
                var cardContent = audioData.cardContent;
                var cardImage   = audioData.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }

            this.response.speak(text).audioPlayerPlay('REPLACE_ALL', getRandomScript(), 'meditation', null, 0);
            this.emit(':responseReady');
        },
        stop: function (text) {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak(text).audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

var controller2 = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */

            if (canThrowCard.call(this)) {
                var cardTitle = audioData.subtitle;
                var cardContent = audioData.cardContent;
                var cardImage = audioData.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }

            this.response.speak(text).audioPlayerPlay('REPLACE_ALL', getSoundsOfWinter(), 'soundsOfWinter', null, 0);
            this.emit(':responseReady');
        },
        stop: function (text) {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak(text).audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}


function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomScript() {

    var script = [
        "https://s3.amazonaws.com/holidaychillin/script1.mp3",
        "https://s3.amazonaws.com/holidaychillin/script2.mp3",
        "https://s3.amazonaws.com/holidaychillin/script3.mp3",
        "https://s3.amazonaws.com/holidaychillin/script4.mp3"
    ];

    return script[getRandom(0, script.length - 1)]

}

function getSoundsOfWinter() {

    var script = [
        "https://s3.amazonaws.com/holidaychillin/fireplace.mp3"
    ];

    return script[getRandom(0, script.length - 1)]

}

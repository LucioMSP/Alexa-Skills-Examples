/* Author: Vicente G. Guzmán Lucio */
/* Date: 29/Nov/2019 */
/* Twitter: @LucioMSP */

const Alexa = require('ask-sdk-core');
const axios = require('axios');
const chargersUrl = 'https://api-electric-charger.herokuapp.com/electricCharger';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to API Electric Charger! You can request "chargers" to get information.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('API electricCharger', speechText)
      .getResponse();
  },
};

const randomArrayElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const getChargers = async () => {
  try {
    const { data } = await axios.get(chargersUrl);
    return data;
  } catch (error) {
    console.error('cannot fetch electric chargers for cars', error);
  }
};

const GetChargerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetChargerIntent';
  },
  async handle(handlerInput) {
    try {
      const e = await getChargers();
      const ecar = randomArrayElement(e);
      const speechText = 
      `I found an electric charger station, his name is ${ecar.name}, 
       his plug type is ${ecar.plug_type},
       his kilowatt price is ${ecar.kw_price},
       currently it is ${ecar.state}
       his longitude is ${ecar.geolocation.longitude}
       and his latitude is ${ecar.geolocation.latitude}`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('API electricCharger', speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask to give me a electric charger station';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('API electricCharger', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('API electricCharger', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetChargerIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
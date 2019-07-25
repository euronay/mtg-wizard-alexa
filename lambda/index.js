// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Api = require('mtg-wizard-core');
const Renderer = require('./util/renderer.js');

const defaultUi = require('./ui/default.json');
const defaultUiData = require('./models/default-viewdata.json');

async function searchCards(query, responseBuilder, aplAvailable) {
    
    try{
        var cards = await Api.searchCards(query);
        
        if(!cards || cards.length === 0){
            return responseBuilder
                .speak(`Sorry, I couldn't find any cards named ${query}.`)
                .getResponse();
        }
        else if(cards.length === 1){
            return Renderer
                .renderCard(responseBuilder, cards[0], aplAvailable)
                .getResponse();
        }
        else {
            return Renderer
                .renderCards(responseBuilder, cards, aplAvailable)
                .getResponse();
        }
    }
    catch(err){
        return responseBuilder
            .speak(`Sorry, I couldn't find any cards named ${query}.`)
            .getResponse();
    }
}

async function getCard(cardId, responseBuilder, aplAvailable) {
    
    var card = await Api.getCard(cardId);
        
    return Renderer
        .renderCard(responseBuilder, card, aplAvailable)
        .getResponse();
}

async function getSpoilers(responseBuilder, aplAvailable){
    const query = "game%3Apaper+order%3Aspoiled";
    var cards = await Api.searchCards(query);
    
    return Renderer
            .renderCards(responseBuilder, cards.slice(0,5), aplAvailable)
            .getResponse();
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'LaunchRequest') ||
            (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent');
    },
    handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const speechText = 'Welcome, search for any Magic The Gathering card by saying <emphasis level="moderate">Find</emphasis> and then the card name';
        let responseBuilder = handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText);
            
        Renderer.renderDisplay(responseBuilder, defaultUi, defaultUiData, aplAvailable);
            
        return responseBuilder.getResponse();
    }
};
const SearchCardIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'SearchCardIntent');
    },
    async handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const query = handlerInput.requestEnvelope.request.intent.slots.card.value;
        
        return searchCards(query, handlerInput.responseBuilder, aplAvailable);
    }
};
const SelectCardIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'SelectCardIntent');
    },
    async handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const cardId = handlerInput.requestEnvelope.request.intent.slots.predefinedCard.resolutions.resolutionsPerAuthority.find(element => element.status.code === "ER_SUCCESS_MATCH").values[0].value.id;
        
        return getCard(cardId, handlerInput.responseBuilder, aplAvailable);
    }
};
const TouchIntentHandler = {
    // handles the user selecting an item in the search results view
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
            && handlerInput.requestEnvelope.request.arguments.length > 0
            && handlerInput.requestEnvelope.request.arguments[0] === 'ItemSelected';
    },
    handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const cardId = JSON.parse(handlerInput.requestEnvelope.request.arguments[2]).id;
        
        return getCard(cardId, handlerInput.responseBuilder, aplAvailable);
    }
};
const SpoilersIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'SpoilersIntent');
    },
    async handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        
        return getSpoilers(handlerInput.responseBuilder, aplAvailable);
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Search for any Magic The Gathering card by saying <emphasis level="moderate">Find</emphasis> and then the card name';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
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
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message} ${JSON.stringify(handlerInput)}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`; // ${error.message} ${JSON.stringify(handlerInput)}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SearchCardIntentHandler,
        SelectCardIntentHandler,
        TouchIntentHandler,
        SpoilersIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

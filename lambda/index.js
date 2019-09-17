const Alexa = require('ask-sdk-core');
const Api = require('mtg-wizard-core');

const Renderer = require('./util/renderer.js');

var strings = require('./util/strings.js').indexStrings;

async function searchCards(query, responseBuilder, aplAvailable, locale) {
    
    try{

        let fullQuery = query + '&game:paper';
        
        if(!locale.startsWith("en")){
            fullQuery +=  '&include_multilingual=true';
        }
        
        console.log(`🔍 Search query: ${fullQuery}`);
        
        var cards = await Api.searchCards(fullQuery);
        
        console.log(`🎴 Found ${cards.length} cards`)

        var renderer = new Renderer(aplAvailable, locale);
        
        if(cards.length === 1){
            return renderer
                .renderCard(responseBuilder, cards[0], aplAvailable)
                .getResponse();
        }
        else {
            return renderer
                .renderCards(responseBuilder, cards, aplAvailable)
                .getResponse();
        }
    }
    catch(err){
        console.log(`⛔️ Error in searchCards: ${JSON.stringify(err)} `)
        
        return responseBuilder
            .speak(strings.formatString(strings.noResults, query))
            .getResponse();
    }
}

async function getCard(cardId, responseBuilder, aplAvailable, locale) {
    
    var card = await Api.getCard(cardId);
        
    return new Renderer(aplAvailable, locale)
        .renderCard(responseBuilder, card, aplAvailable, locale)
        .getResponse();
}

async function getSpoilers(responseBuilder, aplAvailable, locale){
    const query = "game%3Apaper+order%3Aspoiled";
    var cards = await Api.searchCards(query);
    
    return new Renderer(aplAvailable, locale)
            .renderCards(responseBuilder, cards.slice(0,5))
            .getResponse();
}
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
    },
    handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const locale = handlerInput.requestEnvelope.request.locale;
        strings.setLanguage(locale);

        let responseBuilder = handlerInput.responseBuilder
            .speak(strings.welcome)
            .reprompt(strings.welcomeReprompt);
            
        new Renderer(aplAvailable, locale).renderDefaultDisplay(responseBuilder);
            
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
        const locale = handlerInput.requestEnvelope.request.locale;
        const query = handlerInput.requestEnvelope.request.intent.slots.card.value;
        strings.setLanguage(locale);
        
        let predefinedCard = null;
        
        if (handlerInput.requestEnvelope.request.intent.slots.predefinedCard.resolutions){
            predefinedCard = handlerInput.requestEnvelope.request.intent.slots.predefinedCard.resolutions.resolutionsPerAuthority.find(element => element.status.code === "ER_SUCCESS_MATCH").values[0].value.id || null;
        } 
        
        console.log(`🎤 SearchCardIntent query: "${query}", card id: ${predefinedCard}`);
        
        if(predefinedCard){
            return getCard(predefinedCard, handlerInput.responseBuilder, aplAvailable, locale);
        } else if(query) {
            return searchCards(query, handlerInput.responseBuilder, aplAvailable, locale);
        } else {
            return handlerInput.responseBuilder
            .speak(strings.welcomeReprompt)
            .reprompt(strings.fallback)
            .getResponse();
        }
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
        const locale = handlerInput.requestEnvelope.request.locale;
        const cardId = handlerInput.requestEnvelope.request.arguments[2].id;
        
        return getCard(cardId, handlerInput.responseBuilder, aplAvailable, locale);
    }
};
const SpoilersIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'SpoilersIntent');
    },
    async handle(handlerInput) {
        const aplAvailable = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty("Alexa.Presentation.APL");
        const locale = handlerInput.requestEnvelope.request.locale;
        
        return getSpoilers(handlerInput.responseBuilder, aplAvailable, locale);
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        strings.setLanguage(locale);

        return handlerInput.responseBuilder
            .speak(strings.help)
            .reprompt(strings.help)
            .getResponse();
    }
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        
        console.log(`⚠️ Fallback handled: ${JSON.stringify(handlerInput)}`);
        
        const locale = handlerInput.requestEnvelope.request.locale;
        strings.setLanguage(locale);
        
        return handlerInput.responseBuilder
            .speak(strings.fallback)
            .reprompt(strings.error)
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
        const locale = handlerInput.requestEnvelope.request.locale;
        strings.setLanguage(locale);

        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(strings.end)
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
        console.log(`⛔️ Error handled: ${error.message} ${JSON.stringify(handlerInput)}`);
        const locale = handlerInput.requestEnvelope.request.locale;
        strings.setLanguage(locale);

        return handlerInput.responseBuilder
            .speak(this.strings.error)
            .reprompt(this.strings.error)
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
        TouchIntentHandler,
        SpoilersIntentHandler,
        HelpIntentHandler,
        FallbackIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

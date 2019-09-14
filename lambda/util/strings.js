const LocalizedStrings = require('localized-strings').default;

/** Localized strings for index.js */
module.exports.indexStrings = new LocalizedStrings({
    en: {
        welcome: 'Welcome, search for any Magic The Gathering card by saying <break strength="weak"/><emphasis level="strong">Find</emphasis><break strength="weak"/> and then the card name',
        welcomeReprompt: 'Say the word <break strength="weak"/><emphasis level="strong">Find</emphasis><break strength="weak"/> and then the card name you want to search for.',
        help: 'Search for any Magic The Gathering card by saying <break strength="weak"/><emphasis level="strong">Find</emphasis><break strength="weak"/> and then the card name. ' +
            'You can also ask me for the latest spoilers.',
        noResults: 'Sorry, I couldn\'t find any cards named {0}',
        fallback: 'Sorry, I didn\'t catch that. Could you ask that again?',
        end: 'Goodbye!',
        error: 'Sorry, I couldn\'t understand what you said. Please try again.'
    },
    de: {
        welcome: 'Willkommen, suche nach einer beliebigen Magic the Gathering Karte, indem du <break strength="weak"/><emphasis level="strong">finde</emphasis><break strength="weak"/>, gefolgt vom Namen der Karte sagst',
        welcomeReprompt: 'Sage einfach <break strength="weak"/><emphasis level="strong">finde</emphasis><break strength="weak"/> und dann den Namen der Karte, nach der du suchen willst.',
        help: 'Suche nach einer beliebigen Magic the Gathering Karte, indem du <break strength="weak"/><emphasis level="strong">Find</emphasis><break strength="weak"/> gefolgt vom Namen der Karte sagst. ' +
            'Du kannst mich auch nach den neuesten Spoilern fragen.',
        noResults: 'Tut mir leid, ich konnte keine karte mit dem namen {0} finden.',
        fallback: 'Tut mir leid, das habe ich nicht verstanden. Kannst du die Frage bitte wiederholen?',
        end: 'Bis bald!',
        error: 'Tut mir leid, ich konnte nicht verstehen, was du sagtest. Bitte versuche es noch einmal.'
    }
},
    {/* options */ }
);

/** Localized strings for util/renderer.js */
module.exports.rendererStrings = new LocalizedStrings({
    en:{
        cardFrom: '{0} from {1}',
        foundCards: 'I found {0}. Which one are you interested in?',
        foundCardsLots: 'I found {0} cards. Can you be more specific?',
        noSelect: 'Sorry, I didn\'t catch that. Which card are you interested in?',
        white: 'white',
        blue: 'blue',
        black: 'black',
        red: 'red',
        green: 'green',
        colorless: 'colorless',
        snow: 'snow',
        hybrid: 'hybrid',
        phyrexian: 'phyrexian',
        energy: 'energy',
        star: 'star',
        plusone: 'plus one plus one',
        minusone: 'minus one minus one',
        tap: 'tap',
        untap: 'untap',
        hintTexts: {
            find: 'Try, "Alexa, find Magic Card \'{0}\'"',
            findTwo: 'Try, "Alexa, find \'{0}\'"',
            search: 'Try, "Alexa, search for \'{0}\'"',
            spoilers: 'Try, "Alexa, show me the latest spoilers"'
        },
        exampleCards:{
            forceOfWill: 'Force of Will',
            lightningBolt: 'Lightning Bolt',
            birdsOfParadise: 'Birds of Paradise',
            moxRuby: 'Mox Ruby',
            templeGarden: 'Temple Garden',
            counterspell: 'Counterspell',
            lilianaOfTheVeil: 'Liliana of the Veil',
            pathToExile: 'Path to Exile'
        }
            
    },
    de: {
        cardFrom: '{0} von {1}',
        foundCards: 'Ich habe {0} gefunden. An welcher Karte bist du denn interessiert?',
        foundCardsLots: 'Ich habe {0} karten gefunden. Kannst du bitte etwas spezifischer sein?',
        noSelect: 'Tut mir leid, das habe ich nicht verstanden. An welcher Karte bist du denn interessiert?',
        white: 'weiss',
        blue: 'blau',
        black: 'schwarz',
        red: 'rot',
        green: 'grün',
        colorless: 'farblos',
        phyrexian: 'phyrexianisch',
        energy: 'energie',
        star: 'sternchen',
        plusone: 'plus eins plus eins',
        minusone: 'minus eins minus eins',
        tap: 'tappen',
        untap: 'enttappen',
        hintTexts: {
            find: 'Versuche, "Alexa, finde die Magic Karte \'{0}\'"',
            findTwo: 'Versuche, "Alexa, finde \'{0}\'"',
            search: 'Versuche, "Alexa, suche nach \'{0}\'"',
            spoilers: 'Versuche, "Alexa, zeig mir die neuesten spoilers"'
        },
        exampleCards:{
            forceOfWill: 'Willenskraft',
            lightningBolt: 'Blitzschlag',
            birdsOfParadise: 'Paradiesvögel',
            moxRuby: 'Mox Ruby',
            templeGarden: 'Tempelgarten',
            counterspell: 'Gegenzauber',
            lilianaOfTheVeil: 'Liliana mit Schleier',
            pathToExile: 'Weg ins Exil'
        }
    }},
    {/* options */}
  );
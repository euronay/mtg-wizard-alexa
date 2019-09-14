const LocalizedStrings = require('localized-strings').default;

const defaultUi = require('../ui/default.json');
const defaultUiData = require('../models/default-viewdata.json');
const singleCardUi = require('../ui/singlecard.json');
const cardViewData = require('../models/card-viewdata.json');
const searchResultsUi = require('../ui/searchresults.json');
const searchResultViewData = require('../models/searchresults-viewdata.json');


module.exports = class Renderer {

    constructor(aplAvaliable, locale)
    {
        this.aplAvaliable = aplAvaliable;
        this.locale = locale;

        this.strings = require('./strings.js').rendererStrings;
        this.strings.setLanguage(this.locale);
    }

    renderCard(responseBuilder, card){
        
        console.log(`🎴 Rendering card ${card.name}`);
        
        let data = Object.assign({}, cardViewData);

        data.viewData.imageUrl = card.image;
        data.viewData.name = card.name;
        data.viewData.manaAndType = card.manaCostAndType;
        data.viewData.set = card.setName;
        data.viewData.rarity = card.rarity;
        data.viewData.body = card.bodyText;
        data.viewData.price = `USD ${card.prices.usd || 'n/a'} | EUR ${card.prices.eur || 'n/a'}`;
        data.viewData.backgroundImageUrl = card.safeData.image_uris.art_crop;
        data.viewData.hintText = this.generateHintText();
        
        let speech = `${this.strings.formatString(this.strings.cardFrom, card.name, card.setName)}. ${this.speak(card)}`;
        
        // clear dynamic entities once we find a card
        let dynamicEntities = {
            type: "Dialog.UpdateDynamicEntities",
            updateBehavior: "CLEAR",
            types: [
                {
                    name: "PredefinedCard",
                    values: []
                }
            ]
        };

        responseBuilder
            .speak(speech)
            .addDirective(dynamicEntities);
            
        this.renderDisplay(responseBuilder, singleCardUi, data);
            
        return responseBuilder;
    }

    renderCards(responseBuilder, cards)
    {
        console.log(`🎴 Rendering cards: ${cards.map(card => card.name).join(', ')}`);
        
        const MAX_CARDS_TO_RENDER = 20;
        
        let data = Object.assign({}, searchResultViewData);

        let cardsToSpeak = "\n";

        data.viewData.hintText = this.generateHintText();
        data.viewData.results = cards.slice(0,MAX_CARDS_TO_RENDER).map(card => {

            cardsToSpeak += `${this.strings.formatString(this.strings.cardFrom, card.name, card.setName)},\n`; 

            return {
                imageUrl: card.image,
                name: card.name,
                id: card.id,
                set: card.setName,
                manaAndType: card.manaCostAndType
            };
        });

        let speech = ((cards.length <= 5) 
            ? this.strings.formatString(this.strings.foundCards, cardsToSpeak) 
            : this.strings.formatString(this.strings.foundCardsLots, cards.length));

        let dynamicEntities = {
            type: "Dialog.UpdateDynamicEntities",
            updateBehavior: "REPLACE",
            types: [
                {
                    name: "PredefinedCard",
                    values: cards.slice(0,MAX_CARDS_TO_RENDER).map((card, index) => ({
                        id: card.id,
                        name: {
                            value: card.name,
                            // Important - the maximum number of synonyms is 100 total. The number of cards returned must not exceed
                            // (100 / number of synonyms [5]) = 20
                            synonyms: [
                                card.name.replace(/[^0-9a-zA-Z ]/g, ''), // Lightning Bolt
                                this.strings.formatString(this.strings.cardFrom, card.name.replace(/[^0-9a-zA-Z ]/g, ''), card.set), // Lightning Bolt from M15
                                this.strings.formatString(this.strings.cardFrom, card.name.replace(/[^0-9a-zA-Z ]/g, ''), card.setName), // Lightning Bolt from Magic 2015
                                `${(index + 1)}` // List ordinal number
                                ]
                            }
                        }))
                }
            ]
        };

        responseBuilder
            .speak(speech)
            .reprompt(this.strings.noSelect)
            .withShouldEndSession(false)
            .addDirective(dynamicEntities);
        
        this.renderDisplay(responseBuilder, searchResultsUi, data);
        
        return responseBuilder;
    }
    
    renderDefaultDisplay(responseBuilder)
    {
        let data = Object.assign({}, defaultUiData);
        data.viewData.hintText = this.generateHintText();
        
        this.renderDisplay(responseBuilder, defaultUi, data);
        
        return responseBuilder;
    }
    
    renderDisplay(responseBuilder, ui, data)
    {
        if(this.aplAvaliable){
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: ui,
                datasources: data
            });
        }
        
        return responseBuilder;
    }

    
    /**
     * Creates a string that can be read that includes the the card rarity, name and text with spoken symbols like {R} = "Red"
     *
     * @param {Card} card The card object to read
     * @returns {string} Formatted string
     */
    speak(card){
        return this.filterMana(`${card.rarity}. ${card.manaCostAndType}. ${card.bodyText}`);
    }

    filterMana(text){
        
        return text
        .replace(/\*\*/g, '')
        .replace(/{W}/g, this.strings.white) 
        .replace(/{U}/g, this.strings.blue)
        .replace(/{B}/g, this.strings.black)
        .replace(/{R}/g, this.strings.red)
        .replace(/{G}/g, this.strings.green)
        .replace(/{C}/g, this.strings.colorless)
        .replace(/{S}/g, this.strings.snow)
        .replace(/{W\/P}/g, `{${this.strings.phyrexian} ${this.strings.white}}`)    
        .replace(/{U\/P}/g, `{${this.strings.phyrexian} ${this.strings.blue}}`)
        .replace(/{B\/P}/g, `{${this.strings.phyrexian} ${this.strings.black}}`)
        .replace(/{R\/P}/g, `{${this.strings.phyrexian} ${this.strings.red}}`)
        .replace(/{G\/P}/g, `{${this.strings.phyrexian} ${this.strings.green}}`)
        .replace(/\d/g, '{$&}')
        .replace(/{{(\d)}\/W}/g, `{${this.strings.hybrid} $1 ${this.strings.white}}`)
        .replace(/{{(\d)}\/U}/g, `{${this.strings.hybrid} $1 ${this.strings.blue}}`)
        .replace(/{{(\d)}\/B}/g, `{${this.strings.hybrid} $1 ${this.strings.black}}`)
        .replace(/{{(\d)}\/R}/g, `{${this.strings.hybrid} $1 ${this.strings.red}}`)
        .replace(/{{(\d)}\/G}/g, `{${this.strings.hybrid} $1 ${this.strings.green}}`)
        .replace(/{W\/U}/g, `{${this.strings.hybrid} ${this.strings.white} ${this.strings.blue}}`)
        .replace(/{W\/B}/g, `{${this.strings.hybrid} ${this.strings.white} ${this.strings.black}}`)
        .replace(/{U\/B}/g, `{${this.strings.hybrid} ${this.strings.blue} ${this.strings.black}}`)
        .replace(/{U\/R}/g, `{${this.strings.hybrid} ${this.strings.blue} ${this.strings.red}}`)
        .replace(/{B\/R}/g, `{${this.strings.hybrid} ${this.strings.black} ${this.strings.red}}`)
        .replace(/{B\/G}/g, `{${this.strings.hybrid} ${this.strings.black} ${this.strings.green}}`)
        .replace(/{R\/G}/g, `{${this.strings.hybrid} ${this.strings.red} ${this.strings.green}}`)
        .replace(/{R\/W}/g, `{${this.strings.hybrid} ${this.strings.red} ${this.strings.white}}`)
        .replace(/{G\/W}/g, `{${this.strings.hybrid} ${this.strings.green} ${this.strings.white}}`)
        .replace(/{G\/U}/g, `{${this.strings.hybrid} ${this.strings.green} ${this.strings.blue}}`)
        .replace(/{E}/g, this.strings.energy)
        .replace(/\*/g, this.strings.star)
        .replace(/\+\{1\}\/\+\{1\}/g, this.strings.plusone)
        .replace(/-\{1\}\/-\{1\}/g, this.strings.minusone)
        .replace(/{T}/g, this.strings.tap)
        .replace(/{Q}/g, this.strings.untap);
    }
    
    generateHintText(){
        
        let hintText = this.getRandomString(this.strings.hintTexts);
        let card = this.getRandomString(this.strings.exampleCards);
        
        return this.strings.formatString(hintText, card);
    }
    
    getRandomString(stringObject){
        let cards = stringObject;
        let max = Object.keys(stringObject).length;
        
        let random = Math.floor(Math.random() * Math.floor(max));
        
        return stringObject[Object.keys(stringObject)[random]];
    }

}
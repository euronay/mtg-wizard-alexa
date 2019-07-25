const Speaker = require('./speaker.js');
const singleCardUi = require('../ui/singlecard.json');
const cardViewData = require('../models/card-viewdata.json');
const searchResultsUi = require('../ui/searchresults.json');
const searchResultViewData = require('../models/searchresults-viewdata.json');


module.exports = class Renderer {

    static renderCard(responseBuilder, card, useApl){

        let data = Object.assign({}, cardViewData);

        data.viewData.imageUrl = card.getImage();
        data.viewData.name = card.getDisplayName();
        data.viewData.manaAndType = card.getManaCostAndType();
        data.viewData.set = card.set_name;
        data.viewData.rarity = card.rarity;
        data.viewData.body = card.getBodyText();
        data.viewData.usd = card.usd;
        data.viewData.usd_foil = card.usd;
        data.viewData.eur = card.eur;
        
        let speech = `I found ${card.name} from ${card.set_name}. ${Speaker.speak(card)}`;
        
        // clear dynamic entities once we find a card
        let dynamicEntities = {
            type: "Dialog.UpdateDynamicEntities",
            updateBehavior: "REPLACE",
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
            
        this.renderDisplay(responseBuilder, singleCardUi, data, useApl);
            
        return responseBuilder;
    }

    static renderCards(responseBuilder, cards, useApl)
    {
        const MAX_CARDS_TO_RENDER = 20;
        
        let data = Object.assign({}, searchResultViewData);

        let cardsToSpeak = "\n";

        data.viewData.results = cards.slice(0,MAX_CARDS_TO_RENDER).map(card => {

            cardsToSpeak += `${card.name} from ${card.set_name},\n`; 

            return {
                imageUrl: card.getImage(),
                name: card.getDisplayName(),
                id: card.id,
                set: card.set_name,
                manaAndType: card.getManaCostAndType()
            };
        });

        let speech = ((cards.length <= 5) ? `I found ${cardsToSpeak}. Which one are you interested in?` : `I found ${cards.length} cards. Can you be more specific?`  )

        let dynamicEntities = {
            type: "Dialog.UpdateDynamicEntities",
            updateBehavior: "REPLACE",
            types: [
                {
                    name: "PredefinedCard",
                    values: cards.slice(0,MAX_CARDS_TO_RENDER).map(card => ({
                        id: card.id,
                        name: {
                            value: card.name,
                            // Important - the maximum number of synonyms is 100 total. The number of cards returned must not exceed
                            // (100 / number of synonyms) = 25
                            synonyms: [card.name, `${card.name} from ${card.set}`, `${card.name} from ${card.set_name}`]
                            }
                        }))
                }
            ]
        };
        

        responseBuilder
            .speak(speech)
            .addDirective(dynamicEntities);
        
        this.renderDisplay(responseBuilder, searchResultsUi, data, useApl);
        
        return responseBuilder;
    }
    
    static renderDisplay(responseBuilder, ui, data, useApl)
    {
        if(useApl){
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: ui,
                datasources: data
            });
        }
        
        return responseBuilder;
    }

}
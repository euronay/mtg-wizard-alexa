const Speaker = require('./speaker.js');
const singleCardUi = require('../ui/singlecard.json');
const cardViewData = require('../models/card-viewdata.json');
const searchResultsUi = require('../ui/searchresults.json');
const searchResultViewData = require('../models/searchresults-viewdata.json');


module.exports = class Renderer {

    static renderCard(responseBuilder, card){

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

        responseBuilder
            .speak(`I found ${card.name} from ${card.set_name}. ${Speaker.speak(card)}`)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: singleCardUi,
                datasources: data
            });
        
        return responseBuilder;
    }

    static renderCards(responseBuilder, cards)
    {
        let data = Object.assign({}, searchResultViewData);

        let cardsToSpeak = "\n";

        data.viewData.results = cards.map(card => {

            cardsToSpeak += `${card.name} from ${card.set_name},\n`; 

            return {
                "imageUrl": card.getImage(),
                "name": card.getDisplayName(),
                "set": card.set_name,
                "manaAndType": card.getManaCostAndType()
            };
        });

        let speech = ((cards.length <= 5) ? `I found ${cardsToSpeak}. Which one are you interested in?` : `I found ${cards.length} cards. Can you be more specific?`  )


        responseBuilder
            .speak(speech)
            .reprompt('Which card do you want to know about?')
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: searchResultsUi,
                datasources: data
            });
        
        return responseBuilder;
    }

    // static renderListItem(app, card, showSet){
    //     var listItem = app.buildOptionItem(card.id,
    //     [card.name])
    //     .setTitle(card.name)
    //     .setDescription(`${card.getSetAndRarity()}  \n${card.getManaCostAndType()}`)
    //     .setImage(card.getThumbnail(), card.name);

    //     if(showSet)
    //         listItem.setTitle(`${card.name} (${card.set})`);

    //     return listItem;
    // }
}
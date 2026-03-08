// https://on.cypress.io/api

const f = `4 Cast Down (DOM) 81
4 Cleansing Wildfire (ZNR) 137
4 Drossforge Bridge (MH2) 246
2 Eviscerator's Insight (MH3) 93
4 Fanatical Offering (LCI) 105
2 Forest (EOE) 266 *F*
4 Ichor Wellspring (BRC) 143
3 Krark-Clan Shaman (MRD) 98
3 Lembas (LTR) 694 *F*
1 Makeshift Munitions (CMR) 191
1 Mountain (EOE) 265 *F*
3 Nihil Spellbomb (SOM) 187
1 Nyxborn Hydra (MH3) 164
2 Pulse of Murasa (M20) 189
4 Refurbished Familiar (MH3) 105
1 Sagu Wildling / Roost Seek (TDM) 306 *F*
4 Slagwoods Bridge (MH2) 256
3 Swamp (EOE) 264 *F*
4 Twisted Landscape (MH3) 232
2 Vault of Whispers (BRC) 211
4 Writhing Chrysalis (MH3) 208

SIDEBOARD:
2 Breath Weapon (CLB) 165
3 Duress (M21) 96
1 Heritage Reclamation (TDM) 145 *F*
3 Red Elemental Blast (4ED) 218
2 Toxin Analysis (MKM) 107
1 Troublemaker Ouphe (WOE) 194
3 Weather the Storm (H1R) 24 *E*`;
const s = `1 Blood Fountain (DBL) 362
4 Cast Down (DOM) 81
4 Cleansing Wildfire (ZNR) 137
4 Drossforge Bridge (MH2) 246
2 Eviscerator's Insight (MH3) 93
4 Fanatical Offering (LCI) 105
2 Forest (EOE) 266 *F*
4 Gixian Infiltrator (BRO) 98
4 Ichor Wellspring (BRC) 143
3 Krark-Clan Shaman (MRD) 98
3 Lembas (LTR) 694 *F*
1 Makeshift Munitions (CMR) 191
1 Mountain (EOE) 265 *F*
3 Nihil Spellbomb (SOM) 187
1 Nyxborn Hydra (MH3) 164
1 Pulse of Murasa (M20) 189
1 Sagu Wildling / Roost Seek (TDM) 306 *F*
4 Slagwoods Bridge (MH2) 256
3 Swamp (EOE) 264 *F*
4 Twisted Landscape (MH3) 232
2 Vault of Whispers (BRC) 211
4 Writhing Chrysalis (MH3) 208

SIDEBOARD:
3 Breath Weapon (CLB) 165
3 Duress (M21) 96
1 Heritage Reclamation (TDM) 145 *F*
1 Tithing Blade / Consuming Sepulcher (LCI) 128
2 Toxin Analysis (MKM) 107
1 Troublemaker Ouphe (WOE) 194
4 Weather the Storm (H1R) 24 *E*`;

describe('The trio page', () => {
  it('should load deck from text', () => {
    cy.intercept('GET', 'https://api.scryfall.com/cards/named?exact=*', {
      fixture: 'scryfall/card.json',
    });
    cy.visit('/trio');
    cy.get('[data-testid="button-open-upload-deck-dialog"]').click();
    cy.get('[data-testid="textarea-upload-deck-dialog"]').type(f);
    cy.get('[data-testid="submit-button-upload-deck-dialog"]').click();
    cy.get('div').contains('Deck 1').should('exist');
    cy.get('div').contains('Refurbished Familiar').should('exist');
    cy.get('[data-testid="textarea-upload-deck-dialog"]').type(s);
    cy.get('[data-testid="submit-button-upload-deck-dialog"]').click();
    cy.get('div').contains('Deck 2').should('exist');
    cy.get('div').contains('Gixian Infiltrator').should('exist');
    cy.get('[data-testid="close-button-upload-deck-dialog"]').click();
    cy.get('[ data-testid="check-deck-button"]').click();
    const getColor = (el: Element) => [...el.classList].find((c) => c.startsWith('bg-'));
    cy.get('[data-card-name="Cast Down"]').then(($el) => {
      const elements = $el.map((_, el) => el).get();
      // carta non duplicata
      if (elements.length === 1) {
        const c = getColor(elements[0]!)
        expect(c, `Cast Down should not have color`).equals(undefined);
        return;
      }

      // è un duplicato
      const firstColor = getColor(elements[0]!);
      elements.forEach((el) => {
        expect(getColor(el), `Color mismatch for Cast Down`).to.equal(firstColor);
      });
    });
  });
});

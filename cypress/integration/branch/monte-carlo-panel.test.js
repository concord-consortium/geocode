import RightPanel from "../../support/elements/RightPanel";
import Map from "../../support/elements/Map"
import BlocksTab from "../../support/elements/BlocksTab";
import MonteCarloTab from "../../support/elements/MonteCarloTab";
import ModelOptions from "../../support/elements/ModelOptionPanel";

const rightPanel = new RightPanel;
const map = new Map;
const blocksTab = new BlocksTab;
const monteCarloTab = new MonteCarloTab;
const modelOptions = new ModelOptions;

const runs=100;

before(() => {
    cy.visit("");
    modelOptions.getModelOptionsMenu().click();
    modelOptions.selectInitialCode('Monte Carlo (3 locs)');
    modelOptions.getShowSpeedControl().click();
    modelOptions.getModelOptionsMenu().click();
    blocksTab.setSpeedControl("fast")
    blocksTab.runProgram();
    cy.wait(15000)
    rightPanel.getMonteCarloTab().click();
  });
beforeEach(()=>{
    cy.fixture('locations.json').as('locations');
})  
context("Monte Carlo tab",()=>{
    describe('location tabs',()=>{
        it('verify tab for each location',()=>{
            cy.get('@locations').then((locations)=>{
                monteCarloTab.getTabList().each((location, index, locationList)=>{
                    cy.wrap(locationList).should('have.length',3)
                    cy.wrap(location).should('contain',locations.locations[index].name);
                })
            })
        })
        it('verify histogram for each location',()=>{
            cy.get('@locations').then((locations)=>{
                monteCarloTab.getTabList().each((location, index, locationList)=>{
                    cy.wrap(location).click();
                    monteCarloTab.getHistogramChartContainer().should('be.visible');
                    monteCarloTab.getDataPoints().should('have.length', runs)
                    monteCarloTab.getThresholdLine().should('be.visible')
                    monteCarloTab.getThresholdLineText().should('be.visible').and('contain', locations.locations[index].threshold)
                })
            })
        })
        it('verify stats for each location',()=>{
            cy.get('@locations').then((locations)=>{
                monteCarloTab.getTabList().each((location, index, locationList)=>{
                    cy.wrap(location).click();
                    monteCarloTab.getStatsContainer().should('be.visible');
                    monteCarloTab.getStatsContainer().should('contain',"Runs completed: "+runs);
                    monteCarloTab.getStatsContainer().should('contain',"Threshold = "+locations.locations[index].threshold+" mm");
                    monteCarloTab.getStatsContainer().should('contain',"Count below threshold: "); //Can't test the actual values since it varies 
                    monteCarloTab.getStatsContainer().should('contain',"Count above threshold: ");
                    monteCarloTab.getStatsContainer().should('contain',"Risk:")
                    monteCarloTab.getStatsContainer().should('contain',locations.locations[index].risk) //The actual text is in a separate span
                    monteCarloTab.getStatsContainer().find(monteCarloTab.riskDiamondEl()).should('be.visible')
                    monteCarloTab.getStatsContainer().should('contain',locations.locations[index].danger)
                })
            })
        })
    })
    describe('risks on map',()=>{
        it('verify risk diamonds on map',()=>{
            map.getDiamondMarker().should('be.visible').and('have.length',3)
            map.getDiamondMarker().find('.diamond-text').contains('!').should('be.visible')
        })
    })
})
context('histogram graph type',()=>{
    describe('Bar histogram',()=>{
        before(()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getShowBarHistogram().click();
        })
        it('verify bar histogram option checked',()=>{
            modelOptions.getShowBarHistogram().should('be.checked')
        })
        it('verify bar histogram is shown',()=>{
            monteCarloTab.getDataBars().should('be.visible');
            monteCarloTab.getDataPoints().should('not.exist');
        })
        it('verify revert back to data points when bar histogram option is unchecked',()=>{
            modelOptions.getShowBarHistogram().click();
            modelOptions.getShowBarHistogram().should('not.be.checked')
            monteCarloTab.getDataBars().should('not.exist');
            monteCarloTab.getDataPoints().should('be.visible');
        })
    })
})
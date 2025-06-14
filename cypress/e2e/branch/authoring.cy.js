import ModelOptions from "../../support/elements/ModelOptionPanel";
import LeftPanel from "../../support/elements/LeftPanel";
import RightPanel from "../../support/elements/RightPanel";
import ControlsTab from "../../support/elements/ControlsTab";
import Map from "../../support/elements/Map";
import BlocksTab from "../../support/elements/BlocksTab";
import ConditionsTab from "../../support/elements/ConditionsTab";


const modelOptions = new ModelOptions;
const leftPanel = new LeftPanel;
const rightPanel = new RightPanel;
const controlsTab = new ControlsTab;
const map = new Map;
const blocksTab = new BlocksTab;
const conditionsTab = new ConditionsTab;

const DataRegEx = /Data$/gm;        // regex to ignore "Data Samples"

//need to convert Blockly strings Bec they have &nbsp; in the DOM
//but when run thru Cypress, Cypress converts it so `contain` never matches
function removeNBSP(text){
    const re = new RegExp(String.fromCharCode(160), "g");
    return text.replace(re, " ");
}

beforeEach(()=>{
    cy.fixture('vei-mapping.json').as('veiMap');
    cy.fixture('volcanoes.json').as('volcanoes');
});
context ('Authoring Options',()=>{
    before(() => {
        cy.visit("");
        // show controls and code tabs
        modelOptions.getModelOptionsMenu().click();
        modelOptions.getShowControlsOption().click();
        modelOptions.getShowCodeOption().click();
        modelOptions.getModelOptionsMenu().click();
      });
    describe('Model Option panel visibility',()=>{
        it('verify Options Menu panel shows',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getRequireEruptionOption().should('exist');
        });
        it('verify Option Menu closes',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getModelOptionsList().should('have.length',1);
        });
    });
    describe('Require Eruption options',()=>{
        it('verify require eruption=false shows tephra without clicking on Erupt button',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getRequireEruptionOption().should('have.attr', 'checked');
            modelOptions.getRequireEruptionOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getRequireEruptionOption().should('not.have.attr', 'checked');
            leftPanel.getControlsTab().click();
            controlsTab.getEruptButton().click();
            //verify tephra is visible at a location south of volcano - brittle if the viewport size changes
            map.getTephra().last().invoke("attr", "d").should("contain", "M225 229L228 232L234 232L249 248L249 261L255 267L255 273L249 279L249 336L243 342L243 354L237 361L237 367L234 370L228 370L222 376L201 354L201 329L195 323L201 317L201 311L195 304L195 248L210 232L216 232L222 226z");

            //change conditions to see tephra change without having to erupt again
            const slider="wind-direction", windDirection = 190;
            controlsTab.setSliderValue(slider,windDirection);
            //verify is in new location north of volcano
            map.getTephra().last().invoke("attr", "d").should("contain", "M249 98L260 110L260 198L255 204L255 217L249 223L249 229L246 232L240 232L234 239L216 239L201 223L201 179L207 173L207 167L213 160L213 135L219 129L219 123L225 116L225 110L234 101L240 101L246 94z");

            //reset state for nexxt test
            controlsTab.resetModel();
            modelOptions.getModelOptionsMenu().click();
        });
        it ('verify require eruption=true shows tephra only when Erupt button is clicked',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getRequireEruptionOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getRequireEruptionOption().should('have.attr', 'checked');
            leftPanel.getControlsTab().click();
            controlsTab.getEruptButton().click();
            //verify tephra is visible at a location south of volcano
            map.getTephra().last().invoke("attr", "d").should("contain", "M249 98L260 110L260 198L255 204L255 217L249 223L249 229L246 232L240 232L234 239L216 239L201 223L201 179L207 173L207 167L213 160L213 135L219 129L219 123L225 116L225 110L234 101L240 101L246 94z");

            //change conditions to see tephra change without having to erupt again
            const slider="wind-direction", windDirection = 190;
            controlsTab.setSliderValue(slider,windDirection);
            //verify location has not changed north of volcano
            map.getTephra().last().invoke("attr", "d").should("contain", "M249 98L260 110L260 198L255 204L255 217L249 223L249 229L246 232L240 232L234 239L216 239L201 223L201 179L207 173L207 167L213 160L213 135L219 129L219 123L225 116L225 110L234 101L240 101L246 94z");

            controlsTab.resetModel();//clean up
         });
    });
    describe('Map Scenarios show the correct area',()=>{
        it('verify selected volcano is shown in the map',()=>{ //222px, 235px, 0px
            modelOptions.getModelOptionsMenu().click();

            cy.get('@volcanoes').then((volcanoes)=>{
                cy.wrap(volcanoes.volcanoes).each((volcano,index,volcano_list)=>{
                    cy.log(volcanoes.volcanoes[index].name);
                    modelOptions.getModelOptionsMenu().click();
                    modelOptions.selectMapScenario(volcanoes.volcanoes[index].name);
                    modelOptions.getModelOptionsMenu().click();
                    cy.wait(1000);
                    map.getRecenterButton().click(); //x,y,z, coordinates are identical if you recenter first
                    map.getVolcanoMarker().first().invoke("attr", "style").should("contain", 'translate3d(' + volcanoes.volcanoes[index].x + 'px, ' + volcanoes.volcanoes[index].y + 'px, ' + volcanoes.volcanoes[index].z + 'px);');
                });
            });
        });
    });
    describe('Code Toolbox authoring shows the correct options',()=>{
        before(()=>{
            leftPanel.getBlocksTab().click();
            modelOptions.getModelOptionsMenu().click();
        });
        it('verify selecting TephraFull shows correct toolboxes in Blocks',()=>{
            // Volcano, Wind data, Data Collections, Logic, Loops, Data, Variables, Functions
            modelOptions.selectCodeToolbox('TephraFull');
            cy.wait(1000);
            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Wind data').should('be.visible');
            blocksTab.getTag('Data Collections').should('be.visible');
            blocksTab.getTag(DataRegEx).should('be.visible');
            blocksTab.getTag('Logic').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');
            blocksTab.getTag('Functions').should('be.visible');
            //Volcano
            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 7);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 28);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(4).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(5).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(6).should('contain','VEI');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(7).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(8).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(9).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(10).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("column height (km)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(11).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(12).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(13).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(14).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("column height (km)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(15).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("ejected volume (km³)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(16).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(17).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("a random wind sample from");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(18).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(19).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("a random wind sample from");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(20).should('contain','VEI');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(21).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute tephra thickness");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(25).should('contain','VEI');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(24).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("a random wind sample from");
            });
            //Wind data
            blocksTab.getTag('Wind data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 6);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length',19);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Graph Wind Data");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Graph Wind Speed");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
              expect(removeNBSP(text)).to.containIgnoreCase("and direction");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Graph Wind Data");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(5).should('contain','against');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(7).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("All Wind Data");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(8).should('contain','Sample');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(10).should('contain','items');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(11).should('contain','from');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(12).should('contain','Filter');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(13).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Select from");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(14).should('contain','Day');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(15).should('contain','Month');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(16).should('contain','Year');
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(17).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Direction (º from North)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(18).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Speed (m/s)");
            });
            //Data Collections
            blocksTab.getTag('Data Collections').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length',16);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Create a location");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(9).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("and mark it on the map");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(10).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Create a data collection");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(11).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("named");
            });
            //Logic
            blocksTab.getTag('Logic').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 5);
            //Loops
            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 5);
            //Data
            blocksTab.getTag(DataRegEx).click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 4);
            //variables
            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
            //Functions
            blocksTab.getTag('Functions').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 3);
        });
        it('verify selecting Wind shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind block
            modelOptions.selectCodeToolbox('Wind');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 3);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
        });
        it('verify selecting Wind and VEI shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + VEI block
            modelOptions.selectCodeToolbox('Wind and VEI');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 4);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).should('contain','VEI');

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');

        });
        it('verify selecting Wind and height shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + column block
            modelOptions.selectCodeToolbox('Wind and Height');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 4);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("column height (km)");
            });

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
        });
        it('verify selecting Wind + 2 shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + height + ejected volumn block
            modelOptions.selectCodeToolbox('Wind + 2');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 5);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.contain("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.contain("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.contain("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).text().then((text)=>{
                expect(removeNBSP(text)).to.contain("column height (km)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(4).text().then((text)=>{
                expect(removeNBSP(text)).to.contain("ejected volume (km³)");
            });
            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
        });
        it('verify selecting A4 + 5 shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables.
            modelOptions.selectCodeToolbox('A4 + 5');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 3);

            //Wind data
            blocksTab.getTag('Wind data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 6);

            //Data Collections
            blocksTab.getTag('Data Collections').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag(DataRegEx).click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 3);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
        });
        it('verify selecting Monte Carlo shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables.
            modelOptions.selectCodeToolbox('Monte Carlo');
            cy.wait(1000);

            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 4);

            //Wind data
            blocksTab.getTag('Wind data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 6);

            //Data Collections
            blocksTab.getTag('Data Collections').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag(DataRegEx).click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 3);

            blocksTab.getTag('Variables').click();
            blocksTab.getFlyout().find(blocksTab.getFlyoutButtonEl()).should('have.length', 1).and('contain','Create variable...');
        });
        after(()=>{
            modelOptions.getModelOptionsMenu().click(); //close Toption Menu to clean up
        });
    });
    // describe('Initial Code authoring shows the correct blocks',()=>{

    // })
    describe('Left tabs options',()=>{
        it('verify Show blocks unchecked does not show Blocks tab',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getShowBlocksOption().should('have.attr', 'checked');
            modelOptions.getShowBlocksOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowBlocksOption().should('not.have.attr', 'checked');
            leftPanel.getBlocksTab().should('not.exist');
        });
        it('verify Show code unchecked does not show Code tab',()=>{
            modelOptions.getShowCodeOption().should('have.attr', 'checked');
            modelOptions.getShowCodeOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowCodeOption().should('not.have.attr', 'checked');
            leftPanel.getCodeTab().should('not.exist');
        });
        it('verify Show controls unchecked does not show Controls tab',()=>{
            modelOptions.getShowControlsOption().should('have.attr', 'checked');
            modelOptions.getShowControlsOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowControlsOption().should('not.have.attr', 'checked');
            leftPanel.getControlsTab().should('not.exist');
        });
        it('verify Show controls checked shows Controls tab',()=>{
            modelOptions.getShowControlsOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowControlsOption().should('have.attr', 'checked');
            leftPanel.getControlsTab().should('be.visible');
        });
        it('verify Show blocks checked shows Blocks tab',()=>{
            modelOptions.getShowBlocksOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowBlocksOption().should('have.attr', 'checked');
            leftPanel.getBlocksTab().should('be.visible');
        });
        it('verify Show code checked shows Codes tab',()=>{
            modelOptions.getShowCodeOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowCodeOption().should('have.attr', 'checked');
            leftPanel.getCodeTab().should('be.visible');
        });
        after(()=>{
            modelOptions.getModelOptionsMenu().click(); //close Toption Menu to clean up
        });
    });
    describe('Right tabs options',()=>{
        it('verify Show cross section checked shows Cross Section tab',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getShowCrossSectionOption().should('not.have.attr', 'checked');
            modelOptions.getShowCrossSectionOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowCrossSectionOption().should('have.attr', 'checked');
            rightPanel.getCrossSectionTab().should('be.visible');
        });
        it('verify Show conditions unchecked does not show Conditions tab',()=>{
            modelOptions.getShowConditionsOption().should('have.attr', 'checked');
            modelOptions.getShowConditionsOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowConditionsOption().should('not.have.attr', 'checked');
            rightPanel.getConditionsTab().should('not.exist');
        });
        it('verify Show data unchecked does not show Data tab',()=>{
            modelOptions.getShowDataOption().should('have.attr', 'checked');
            modelOptions.getShowDataOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowDataOption().should('not.have.attr', 'checked');
            rightPanel.getDataTab().should('not.exist');
        });
        it('verify Show conditions checked does not show Conditions tab',()=>{
            modelOptions.getShowConditionsOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowConditionsOption().should('have.attr', 'checked');
            rightPanel.getConditionsTab().should('be.visible');
        });
        it('verify Show data checked does not show Data tab',()=>{
            modelOptions.getShowDataOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowDataOption().should('have.attr', 'checked');
            rightPanel.getDataTab().should('be.visible');
        });
        it('verify Show cross section checked does not show Cross Section tab',()=>{
            modelOptions.getShowCrossSectionOption().click();
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened
            modelOptions.getModelOptionsMenu().click(); //re-open
            modelOptions.getShowCrossSectionOption().should('not.have.attr', 'checked');
            rightPanel.getCrossSectionTab().should('not.exist');
        });
    });
    describe('Controls options',()=>{
        describe('Controls Tab Options',()=>{
            before(()=>{
                modelOptions.getControlOptionFolderHeader().click();
            });
            it('verify Wind Speed slider hides',()=>{
                leftPanel.getControlsTab().click();
                modelOptions.getShowWindSpeedOption().should('be.checked');
                modelOptions.getShowWindSpeedOption().click();
                modelOptions.getShowWindSpeedOption().should('not.be.checked');
                controlsTab.getWindSpeedSlider().should('not.exist');
                controlsTab.getWindDirectionSlider().should('be.visible');
                controlsTab.getWindSpeedDirectionContainer().find('[data-test="info"]').should('be.visible');
                controlsTab.getWindSpeedDirectionContainer().find('[data-test="info"]>div>div').should('have.length',1);
                conditionsTab.getWindSpeedDirectionWidget().should('be.visible');
            });
            it('verify Wind Direction slider hides',()=>{
                modelOptions.getShowWindDirectionOption().should('be.checked');
                modelOptions.getShowWindDirectionOption().click();
                modelOptions.getShowWindDirectionOption().should('not.be.checked');
                controlsTab.getWindDirectionSlider().should('not.exist');
                controlsTab.getWindSpeedDirectionContainer().should('not.exist');
                conditionsTab.getWindSpeedDirectionWidget().should('not.exist');
            });
            it('verify Ejected Volume slider hides',()=>{
                modelOptions.getShowEjectedVolumeOption().should('be.checked');
                modelOptions.getShowEjectedVolumeOption().click();
                modelOptions.getShowEjectedVolumeOption().should('not.be.checked');
                controlsTab.getEjectedVolumeSlider().should('not.exist');
                controlsTab.getEjectedVolumeContainer().should('not.exist');
                conditionsTab.getEjectedVolumeWidget().should('not.exist');
            });
            it('verify Column Height slider hides',()=>{
                modelOptions.getShowColumnHeightOption().should('be.checked');
                modelOptions.getShowColumnHeightOption().click();
                modelOptions.getShowColumnHeightOption().should('not.be.checked');
                controlsTab.getColumnHeightSlider().should('not.exist');
                controlsTab.getColumnHeightContainer().should('not.exist');
                conditionsTab.getColumnHeightWidget().should('not.exist');
            });
            it('verify VEI slider hides',()=>{
                modelOptions.getShowVEIOption().should('be.checked');
                modelOptions.getShowVEIOption().click();
                modelOptions.getShowVEIOption().should('not.be.checked');
                controlsTab.getVEISlider().should('not.exist');
                controlsTab.getVEIContainer().should('not.exist');
                conditionsTab.getVEIWidget().should('not.exist');
            });
            it('verify Wind speed and direction sliders show again',()=>{
                modelOptions.getShowWindSpeedOption().click();
                modelOptions.getShowWindSpeedOption().should('be.checked');
                controlsTab.getWindSpeedSlider().should('be.visible');
                controlsTab.getWindSpeedDirectionContainer().find('[data-test="info"]').should('be.visible');
                modelOptions.getShowWindDirectionOption().click();
                modelOptions.getShowWindDirectionOption().should('be.checked');
                controlsTab.getWindDirectionSlider().should('be.visible');
                controlsTab.getWindSpeedDirectionContainer().find('[data-test="info"]>div>div').should('have.length',3);
                conditionsTab.getWindSpeedDirectionWidget().should('be.visible');
            });
            it('verify ejected volume slider shows again',()=>{
                modelOptions.getShowEjectedVolumeOption().click();
                modelOptions.getShowEjectedVolumeOption().should('be.checked');
                controlsTab.getEjectedVolumeSlider().should('be.visible');
                controlsTab.getEjectedVolumeContainer().should('be.visible');
                controlsTab.getEjectedVolumeContainer().find('[data-test="info"]').should('be.visible');
                conditionsTab.getEjectedVolumeWidget().should('be.visible');
            });
            it('verify VEI slider shows again',()=>{
                modelOptions.getShowVEIOption().click();
                modelOptions.getShowVEIOption().should('be.checked');
                controlsTab.getVEISlider().should('be.visible');
                controlsTab.getVEIContainer().should('be.visible');
                controlsTab.getVEIContainer().find('[data-test="info"]').should('be.visible');
                conditionsTab.getVEIWidget().should('be.visible');
            });
            it('verify column height slider shows again',()=>{
                modelOptions.getShowColumnHeightOption().click();
                modelOptions.getShowColumnHeightOption().should('be.checked');
                controlsTab.getColumnHeightSlider().should('be.visible');
                controlsTab.getColumnHeightContainer().should('be.visible');
                controlsTab.getColumnHeightContainer().find('[data-test="info"]').should('be.visible');
                conditionsTab.getColumnHeightWidget().should('be.visible');
            });
        });

        it.skip('verify Show log checked shows log area', ()=>{
            // TODO don't know what it is supposed to do
        });
        it.skip('verify Show Demo Charts checked shows demo charts',()=>{
            // TODO don't know what it is supposed to do
        });
        it.skip('verify Show log umchecked hides log area', ()=>{
            // TODO don't know what it is supposed to do
        });
        it.skip('verify Show Demo Charts unchecked does not show demo charts',()=>{
            // TODO don't know what it is supposed to do
        });
        after(()=>{
            modelOptions.getModelOptionsMenu().click(); //Close Option Panel
        });
    });
    describe('authoring save and restore state',()=>{
        before(()=>{
            modelOptions.getModelOptionsMenu().click(); //Open Option Panel
            //Eruption off, painting on, scenarion Mount Pinatubo, Toolbox Wind and VEI
            modelOptions.getRequireEruptionOption().click();
            modelOptions.selectMapScenario('Mount Pinatubo');
            modelOptions.selectCodeToolbox('Wind and VEI');
            //Initial Code Basic, show blocks, & controls, hide code
            modelOptions.selectInitialCode('Basic');
            modelOptions.getShowCodeOption().click();
            //Show monte carlo, conditions, hide data, cross section
            modelOptions.getShowDataOption().click();
            //Show wind direction and VEI, hide all other sliders
            modelOptions.getControlOptionFolderHeader().click();
            modelOptions.getShowWindSpeedOption().click();
            modelOptions.getShowEjectedVolumeOption().click();
            modelOptions.getShowColumnHeightOption().click();
            //show bar histogram
            modelOptions.getShowBarHistogram().click();
        });
        it('verify selected options',()=>{
            modelOptions.getRequireEruptionOption().should('not.be.checked');
            modelOptions.getRequirePaintingOption().should('be.checked');
            //can't verify dropdown selections
            leftPanel.getBlocksTab().click();
            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 4);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).should('contain','VEI');

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);
            leftPanel.getBlocksTab().should('be.visible');
            leftPanel.getCodeTab().should('not.exist');
            leftPanel.getControlsTab().should('be.visible');
            rightPanel.getConditionsTab().should('be.visible');
            rightPanel.getMonteCarloTab().should('be.visible');
            rightPanel.getCrossSectionTab().should('not.exist');
            rightPanel.getDataTab().should('not.exist');
            leftPanel.getControlsTab().click();
            controlsTab.getWindSpeedSlider().should('not.exist');
            controlsTab.getWindDirectionSlider().should('be.visible');
            controlsTab.getEjectedVolumeContainer().should('not.exist');
            controlsTab.getColumnHeightContainer().should('not.exist');
            controlsTab.getVEIContainer().should('be.visible');
            modelOptions.getShowBarHistogram().should('be.checked');
            modelOptions.getShowSpeedControl().should('not.be.checked');
        });
        it('verify save and restore of selections',()=>{
            modelOptions.saveCurrentState().scrollIntoView().click({force:true});

            //Change options to verify restore
            modelOptions.getShowCrossSectionOption().click();
            rightPanel.getCrossSectionTab().should('be.visible');
            modelOptions.getShowEjectedVolumeOption().click();
            controlsTab.getEjectedVolumeContainer().should('be.visible');

            //restore
            modelOptions.restoreSavedState().scrollIntoView().click({force:true});

            modelOptions.getRequireEruptionOption().should('not.be.checked');
            modelOptions.getRequirePaintingOption().should('be.checked');
            //can't verify dropdown selections
            leftPanel.getBlocksTab().click();
            blocksTab.getTag('Volcano').should('be.visible');
            blocksTab.getTag('Data').should('be.visible');
            blocksTab.getTag('Loops').should('be.visible');
            blocksTab.getTag('Variables').should('be.visible');

            blocksTab.getTag('Volcano').click();
            cy.wait(500);
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 1);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).should('have.length', 4);
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(0).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("Compute and visualize tephra with");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(1).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind speed (m/s)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(2).text().then((text)=>{
                expect(removeNBSP(text)).to.containIgnoreCase("wind direction (degrees)");
            });
            blocksTab.getFlyout().find(blocksTab.getBlockTextEl()).eq(3).should('contain','VEI');

            blocksTab.getTag('Loops').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);

            blocksTab.getTag('Data').click();
            blocksTab.getFlyout().find(blocksTab.getBlockEl()).should('have.length', 2);
            leftPanel.getBlocksTab().should('be.visible');
            leftPanel.getCodeTab().should('not.exist');
            leftPanel.getControlsTab().should('be.visible');
            rightPanel.getConditionsTab().should('be.visible');
            rightPanel.getMonteCarloTab().should('be.visible');
            rightPanel.getCrossSectionTab().should('not.exist');
            rightPanel.getDataTab().should('not.exist');
            leftPanel.getControlsTab().click();
            controlsTab.getWindSpeedSlider().should('not.exist');
            controlsTab.getWindDirectionSlider().should('be.visible');
            controlsTab.getEjectedVolumeContainer().should('not.exist');
            controlsTab.getColumnHeightContainer().should('not.exist');
            controlsTab.getVEIContainer().should('be.visible');
            modelOptions.getShowBarHistogram().should('be.checked');
            modelOptions.getShowSpeedControl().should('not.be.checked');
        });
    });
});

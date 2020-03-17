import ModelOptions from "../../support/elements/ModelOptionPanel";
import LeftPanel from "../../support/elements/LeftPanel";
import RightPanel from "../../support/elements/RightPanel";
import ControlsTab from "../../support/elements/ControlsTab";
import Map from "../../support/elements/Map"

const modelOptions = new ModelOptions;
const leftPanel = new LeftPanel;
const rightPanel = new RightPanel;
const controlsTab = new ControlsTab;
const map = new Map;

beforeEach(()=>{
    cy.fixture('vei-mapping.json').as('veiMap');
    cy.fixture('volcanoes.json').as('volcanoes');
})
context ('Authoring Options',()=>{
    before(() => {
        cy.visit("");
      });
    describe('Model Option panel visibility',()=>{
        it('verify Options Menu panel shows',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getRequireEruptionOption().should('exist');
        })
        it('verify Option Menu closes',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getModelOptionsList().should('have.length',1);
        })
    })
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
            //verify tephra is visible at a location south of volcano
            map.getTephra().last().attribute('d').should('contain',"M326 407L331 412L339 412L352 428L352 461L343 471L343 525L331 541L313 541L301 525L301 471L292 461L292 428L305 412L313 412L322 401z")

            //change conditions to see tephra change without having to erupt again
            var slider="wind-direction", windDirection = 190;
            controlsTab.setSliderValue(slider,windDirection);
            //verify is in new location north of volcano
            map.getTephra().last().attribute('d').should('contain', "M361 277L361 374L339 401L313 401L301 385L301 353L309 342L309 320L318 309L318 299L326 288L326 277L331 272L356 272z")

            //reset state for nexxt test
            controlsTab.resetModel();
            modelOptions.getModelOptionsMenu().click();
        })
        it ('verify require eruption=true shows tephra only when Erupt button is clicked',()=>{
            modelOptions.getModelOptionsMenu().click();
            modelOptions.getRequireEruptionOption().click();            
            modelOptions.getModelOptionsMenu().click(); //'checked' state attr doesn't update until menu is closed and re-opened 
            modelOptions.getModelOptionsMenu().click(); //re-open           
            modelOptions.getRequireEruptionOption().should('have.attr', 'checked');
            leftPanel.getControlsTab().click();
            controlsTab.getEruptButton().click();
            //verify tephra is visible at a location south of volcano
            map.getTephra().last().attribute('d').should('contain',"M326 407L331 412L339 412L352 428L352 461L343 471L343 525L331 541L313 541L301 525L301 471L292 461L292 428L305 412L313 412L322 401z")

            //change conditions to see tephra change without having to erupt again
            var slider="wind-direction", windDirection = 190;
            controlsTab.setSliderValue(slider,windDirection);
            //verify location has not changed north of volcano
            map.getTephra().last().attribute('d').should('contain',"M326 407L331 412L339 412L352 428L352 461L343 471L343 525L331 541L313 541L301 525L301 471L292 461L292 428L305 412L313 412L322 401z")

            controlsTab.resetModel();//clean up
         })
    })
    describe('Map Scenarios show the correct area',()=>{
        it('verify selected volcano is shown in the map',()=>{
            modelOptions.getModelOptionsMenu().click();

            cy.get('@volcanoes').then((volcanoes)=>{
                cy.wrap(volcanoes.volcanoes).each((volcano,index,volcano_list)=>{
                    cy.log(volcanoes.volcanoes[index].name)
                    modelOptions.getModelOptionsMenu().click();
                    modelOptions.selectMapScenario(volcanoes.volcanoes[index].name)
                    modelOptions.getModelOptionsMenu().click();
                    cy.wait(1000)
                    map.getRecenterButton().click(); //x,y,z, coordinates are identical if you recenter first
                    map.getVolcanoMarker().first().attribute('style').should('contain', 'translate3d('+volcanoes.volcanoes[index].x+'px, '+ volcanoes.volcanoes[index].y+'px, '+ volcanoes.volcanoes[index].z+'px);');
                })
            })
        })
    })
    describe('Code Toolbox authoring shows the correct options',()=>{
        it('verify selecting First shows correct toolboxes in Blocks',()=>{
            // Volcano, Data
        })
        it('verify selecting Everything shows correct toolboxes in Blocks',()=>{
            // Volcano, Logic, Loops, Data, Variables, Functions
        })
        it('verify selecting Wind shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind block
        })
        it('verify selecting Wind and VEI shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + VEI block
        })
        it('verify selecting Wind and height shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + column block            
        })
        it('verify selecting Wind + 2 shows correct toolboxes in Blocks',()=>{
            // Volcano, Loops, Data, Variables. Volcano only has Create town and Wind + height + ejected volumn block            
        })
    })
    describe('Initial Code authoring shows the correct blocks',()=>{

    })
    describe('Left tabs options',()=>{
        it('verify Show blocks unchecked does not show Blocks tab',()=>{

        })
        it('verify Show code unchecked does not show Code tab',()=>{

        })
        it('verify Show controls unchecked does not show Controls tab',()=>{

        })
        it('verify Show controls checked does not show Constrols tab',()=>{

        })
        it('verify Show blocks checked does not show Blocks tab',()=>{

        })
        it('verify Show code checked does not show Codes tab',()=>{

        })
    })
    describe('Right tabs options',()=>{
        it('verify Show cross section unchecked does not show Cross Section tab',()=>{

        })
        it('verify Show conditions unchecked does not show Conditions tab',()=>{

        })
        it('verify Show data unchecked does not show Data tab',()=>{

        })
        it('verify Show conditions checked does not show Conditions tab',()=>{

        })
        it('verify Show data checked does not show Data tab',()=>{

        })
        it('verify Show cross section checked does not show Cross Section tab',()=>{

        })
    })
    describe('Controls options',()=>{
        it('verify Show log checked shows log area', ()=>{

        })
        it('verify Show Demo Charts checked shows demo charts',()=>{
            // TODO don't know what it is supposed to do
        })
        it('verify Show log umchecked hides log area', ()=>{

        })
        it('verify Show Demo Charts unchecked does not show demo charts',()=>{
            // TODO don't know what it is supposed to do
        })
    })
    describe('Require painting options',()=>{
        it('verify require eruption state matches events',()=>{
            //Need to have nested loop option on
        })
    })
    describe.skip('authoring save and restore state',()=>{
        //before(()=>{
            //Eruption off, painting on, scenarion Mount Pinatubo, Toolbox Wind and VEI
            //Initial Code Basic, show bloxks, & Code, hids controls
            //Show cross-section, data, hide condtions
            //Show log, hide demo charts
        //})
        it('verify save and restore of selections',()=>{

        })
    })
})
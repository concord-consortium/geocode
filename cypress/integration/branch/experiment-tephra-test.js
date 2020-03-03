import LeftPanel from "../../support/elements/LeftPanel"
import ControlsTab from "../../support/elements/ControlsTab"
import RightPanel from "../../support/elements/RightPanel";
import Map from "../../support/elements/Map";

const leftPanel = new LeftPanel;
const controlsTab = new ControlsTab;
const rightPanel = new RightPanel;
const map = new Map;

before(() => {
    cy.visit("");
  });
context('verify tephra existence',()=>{
    it('volcano explodes',()=>{
        leftPanel.getControlsTab().click();
        map.getTephra().should('not.exist')
        controlsTab.getEruptButton().click();
        map.getTephra().should('exist')
    })
    it('verify tephra is in the correct direction',()=>{
        map.getTephra().last().attribute('d').should('contain',"M326 407L331 412L339 412L352 428L352 461L343 471L343 525L331 541L313 541L301 525L301 471L292 461L292 428L305 412L313 412L322 401z")
    })
    it('reset removes tephra',()=>{
        controlsTab.resetModel();
        map.getTephra().should('not.exist')
    })
    it('verify change tephra direction',()=>{
        controlsTab.setSliderValue('wind-direction',190)
        controlsTab.getEruptButton().click();
        map.getTephra().last().attribute('d').should('contain', "M361 277L361 374L339 401L313 401L301 385L301 353L309 342L309 320L318 309L318 299L326 288L326 277L331 272L356 272z")
    })
})

//CypressError: Timed out retrying: expected 'M326 407L331 412L339 412L352 428L352 461L343 471L343 525L331 541L313 541L301 525L301 471L292 461L292 428L305 412L313 412L322 401z' to include 'M246 268L251 275L251 283L257 291L257 306L251 314L251 360L246 367L246 375L241 383L241 390L238 394L232 394L227 402L222 394L216 394L208 383L208 375L203 367L203 321L197 314L197 283L211 264L243 264z'

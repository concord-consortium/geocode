// Need to make an initial code  block set for testing Seismic
// Min lat= 34.47 long= -120.12
// Max lat= 34.94 long= -119.71

context ('Seismic module tests',()=>{
  describe('Blocks Tab should have correct blocks',()=>{
    it('verify correct menu items are visible', ()=>{
      //should have Seismic, Logic, Loops, Data, Variables, Functions
    });
    it('verify shows Seismic blocks in Seismic menu item',()=>{
      //should have 5 blocks
      //should have Show GPS stations
      //Should have All GPS stations
      //Should have filter by
    });
  });
  describe('Right tab',()=>{
    it('verify Show GPS stations shows GPS startions on the map',()=>{

    });
    it('verify velocity vectors toggle on and off',()=>{

    });
    it('verify GPS station info appears correctly',()=>{
      // Station Id
      // lat/long
      // Installed
      // Last Record
      // Speed
      // Direction
    });
    it('verify selecting a different station changes the info panel data',()=>{
      //need a fixture with GPS stations info to verify against
    });
    describe('Data tab',()=>{
      // would be helpful to use the initial code block set for testing Seismic to test this feature
      it('verify GPS movement info is graphed correctly',()=>{

      });
      it('verify graph key is visible',()=>{

      })
    })
  })
})
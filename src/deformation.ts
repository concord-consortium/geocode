
// Calculate the max shear deformation between three gps points
// Saul Amster 06/2020
// Translated from GPS deformation calculator--gps_deformation_calculator_excel.v3.xls by Vince Cronin
import * as math from "mathjs";
import { area } from "d3";

// The following are constants and should not be changed (except for maybe the excessively large value of PI)
// Do understand though, that many of these values are being scaled by tremendous factors, so innacuracy in PI
// will cause changes in calculated values
// tslint:disable-next-line
const PI: number = 3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019893809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151557485724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009946576407895126946839835259570982582262052248940772671947826848260147699090264013639443745530506820349625245174939965143142980919065925093722169646151570985838741059788595977297549893016175392846813826868386894277415599185592524595395943104997252468084598727364469584865383673622262609912460805124388439045124413654976278079771569143599770012961608944169486855584840635342207222582848864815845602850601684273945226746767889525213852254995466672782398645659611635488623057745649803559363456817432411251507606947945109659609402522887971089314566913686722874894056010150330861792868092087476091782493858900971490967598526136554978189312978482168299894872265880485756401427047755513237964145152374623436454285844479526586782105114135473573952311342716610213596953623144295248493718711014576540359027993440374200731057853906219838744780847848968332144571386875194350643021845319104848100537061468067491927819119793995206141966342875444064374512371819217999839101591956181467514269123974894090718649423196156794520809514655022523160388193014209376213785595663893778708303906979207734672218256259966150142150306803844773454920260541466592520149744285073251866600213243408819071048633173464965145390579626856100550810665879699816357473638405257145910289706414011097120628043903975951567715770042033786993600723055876317635942187312514712053292819182618612586732157919841484882916447060957527069572209175671167229109816909152801735067127485832228718352093539657251210835791513698820914442100675103346711031412671113699086585163983150197016515116851714376576183515565088490998985998238734552833163550764791853589322618548963213293308985706420467525907091548141654985946163718027098199430992448895757128289059232332609729971208443357326548938239119325974636673058360414281388303203824903758985243744170291327656180937734440307074692112019130203303801976211011004492932151608424448596376698389522868478312355265821314495768572624334418930396864262434107732269780280731891544110104468232527162010526522721116603966655730925471105578537634668206531098965269186205647693125705863566201855810072936065987648611791045334885034611365768675324944166803962657978771855608455296541266540853061434443185867697514566140680070023787765913440171274947042056223053899456131407112700040785473326993908145466464588079727082668306343285878569830523580893306575740679545716377525420211495576158140025012622859413021647155097925923099079654737612551765675135751782966645477917450112996148903046399471329621073404375189573596145890193897131117904297828564750320319869151402870808599048010941214722131794764777262241425485454033215718530614228813758504306332175182979866223717215916077166925474873898665494945011465406284336639379003976926567214638530673609657120918076383271664162748888007869256029022;
const a = 6378137;
const b = 6356752.3142;
const k0 = 0.9996;
const e = 0.081819191;
const e2 = 0.006739497;
const n = 0.00167922;

// Input interfaces for typing the data
export interface DeformationInput {
    data: StationData[];
}

export interface StationData {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    eastVelocity: number;                   // m/yr
    eastVelocityUncertainty: number;
    northVelocity: number;                  // m/yr
    northVelocityUncertainty: number;
    speed: number;                          // mm/yr
    direction: number;                      // º from N
}

// This is all of the outputs of the algorithm. Currently only maxShearDeformation is returned
// This interface is unused
export interface DeformationOutput {
    secondInvariant: number;
}

// This is an interface containing all of the data that is calculated for a single GPS station
interface StationDataComputedValues {
    latRad: number;
    lngRad: number;
    utmZone: number;
    zoneCentralMeridian: number;
    pseudoZone: number;
    utmPseudoZone: number;
    rho: number;
    nu: number;
    p: number;
    pseudo_p: number;
    m1: number;
    m2: number;
    m3: number;
    m4: number;
    M: number;
    K1: number;
    K2: number;
    K3: number;
    K4: number;
    K5: number;
    trueNorthing: number;
    trueEasting: number;
    pseudoNorthing: number;
    pseudoEasting: number;
}

// returns Max Shear Deformation for the three data GPS stations inputed
const deformationCalc = (inputData: DeformationInput): DeformationOutput => {
    const stationData: StationDataComputedValues[] = [];
    inputData.data.forEach(element => {
        stationData.push(calcStationData(element));
    });
    const deformationOutput = calculateDeformationOutputData(inputData, stationData);
    return deformationOutput;
};

// returns populated StationDataComputedValues interface based on a single GPS station
function calcStationData(data: StationData): StationDataComputedValues {
    const latRad: number = data.latitude * (PI / 180.0);
    const lngRad = data.longitude * (PI / 180.0);
    const lngRad1 = (data.longitude + 180.0) / 6.0;
    const utmZone = lngRad1 - Math.round(lngRad1) > 0 ? Math.round(lngRad1) + 1 : Math.round(lngRad1);
    const zoneCentralMeridian = -183 + (6 * utmZone);
    const zoneCentralMeridian1 = zoneCentralMeridian * (PI / 180.0);
    const pseudoZone = zoneCentralMeridian === -177 ? 177 : zoneCentralMeridian - 6;
    const pseudoZone1 = pseudoZone * (PI / 180.0);
    const pseudoZone2 = (pseudoZone + 180.0) / 6.0;
    const utmPseudoZone = pseudoZone2 - Math.round(pseudoZone2) > 0 ?
                            Math.round(pseudoZone2) + 1 :
                            Math.round(pseudoZone2);

    const rho = (a * (1 - (Math.pow(e, 2))) / (Math.pow(1 - ((Math.pow(e, 2) *
                Math.pow((Math.sin(latRad)), 2))), (3 / 2))));
    const nu = a / Math.sqrt(1 - ((Math.pow(e, 2)) * ((Math.pow(Math.sin(latRad), 2)))));
    const p = lngRad - zoneCentralMeridian1;
    const pseudoP = pseudoZone === 177 ? (Math.abs(lngRad) - pseudoZone1) : (lngRad - pseudoZone1);

    const m1 = latRad * (1 - (Math.pow(e, 2) / 4.0) - ((3 * Math.pow(e, 4) / 64) - ((5 * Math.pow(e, 6)) / 256)));
    const m2 = Math.sin(2.0 * latRad) * (((3 * Math.pow(e, 2)) / 8) +
                        ((3 * Math.pow(e, 4)) / 32) + ((45 * Math.pow(e, 6)) / 1024));
    const m3 = Math.sin(4 * latRad) * (((15 * Math.pow(e, 4)) / 256) + ((45 * Math.pow(e, 6)) / 1024));
    const m4 = Math.sin(6 * latRad) * ((35 * Math.pow(e, 6)) / 3072);
    const M = a * (m1 - m2 + m3 - m4);

    const K1 = M * k0;
    const K2 = k0 * nu * Math.sin(2 * latRad) / 4;
    const K3 = (k0 * nu * Math.sin(latRad) * (Math.pow(Math.cos(latRad), 3) / 24) *
                (5 - (Math.pow(Math.tan(latRad), 2)) + (9 * e2 * (Math.pow(Math.cos(latRad), 2)) +
                (4 * Math.pow(e2, 2) * Math.pow(Math.cos(latRad), 4)))));
    const K4 = k0 * nu * Math.cos(latRad);
    const K5 = (k0 * nu * Math.pow(Math.cos(latRad), 3) / 6) * (1 - Math.pow(Math.tan(latRad), 2) +
                (e2 * Math.pow(Math.cos(latRad), 2)));

    const trueNorthing = K1 + (K2 * Math.pow(p, 2)) + (K3 * Math.pow(p, 4));
    const trueEasting = 500000 + (K4 * p) + (K5 * Math.pow(p, 3));
    const pseudoNorthing = K1 + (K2 * Math.pow(pseudoP, 2)) + (K3 * (Math.pow(pseudoP, 4)));
    const pseudoEasting = 500000 + (K4 * pseudoP) + (K5 * Math.pow(pseudoP, 3));

    /* tslint:disable */
    const output: StationDataComputedValues = {
        latRad: latRad,
        lngRad: lngRad,
        utmZone: utmZone,
        zoneCentralMeridian: zoneCentralMeridian,
        pseudoZone: pseudoZone,
        utmPseudoZone: utmPseudoZone,
        rho: rho,
        nu: nu,
        p: p,
        pseudo_p: pseudoP,
        m1: m1,
        m2: m2,
        m3: m3,
        m4: m4,
        M: M,
        K1: K1,
        K2: K2,
        K3: K3,
        K4: K4,
        K5: K5,
        trueNorthing: trueNorthing,
        trueEasting: trueEasting,
        pseudoNorthing: pseudoNorthing,
        pseudoEasting: pseudoEasting
    };
    /* tslint:enable */

    return output;
}

// returns calculated Max Shear Deformation within the three GPS stations
// Uses mathjs for matrix manipulation
function calculateDeformationOutputData(inputData: DeformationInput, calculatedData: StationDataComputedValues[]): DeformationOutput {
    const utmZones: number[] = [];
    calculatedData.forEach((element: StationDataComputedValues) => {
        utmZones.push(element.utmZone);
    });
    const S3WesternmostZone = standardDeviation(utmZones);
    const S2WesternmostZone = average(utmZones);
    const S1WesternmostZone = S3WesternmostZone > 5 ? 60 : Math.floor(S2WesternmostZone);

    const eastingCoords: number[] = [];
    const northingCoords: number[] = [];
    const gpsLats: number[] = [];
    const gpsLngs: number[] = [];
    for (let i = 0; i < inputData.data.length; i++) {
        northingCoords.push(calculatedData[i].utmZone === S1WesternmostZone
            ? calculatedData[i].trueNorthing
            : calculatedData[i].pseudoNorthing);
        eastingCoords.push(calculatedData[i].utmZone === S1WesternmostZone
            ? calculatedData[i].trueEasting
            : calculatedData[i].pseudoEasting);
        gpsLats.push(inputData.data[i].latitude);
        gpsLngs.push(inputData.data[i].longitude);
    }

    const meanEasting = average(eastingCoords);
    const meanNorthing = average(northingCoords);

    // const meanLatitude = average(gpsLats);
    // const meanLongitude = average(gpsLngs);

    const revisedData: number[][] = [];
    for (let i = 0; i < eastingCoords.length; i++) {
        revisedData.push([
            eastingCoords[i] - meanEasting,
            northingCoords[i] - meanNorthing,
            inputData.data[i].eastVelocity,
            inputData.data[i].eastVelocityUncertainty,
            inputData.data[i].northVelocity,
            inputData.data[i].northVelocityUncertainty,
        ]);
    }

    const m1 = [[revisedData[0][0], revisedData[0][1]],
                [revisedData[1][0], revisedData[1][1]],
                [revisedData[2][0], revisedData[2][1]]];

    const m2 = [[1, 0, -1 * m1[0][1], m1[0][0], m1[0][1],         0],
                [0, 1,      m1[0][0],        0, m1[0][0],  m1[0][1]],
                [1, 0, -1 * m1[1][1], m1[1][0], m1[1][1],         0],
                [0, 1,      m1[1][0],        0, m1[1][0],  m1[1][1]],
                [1, 0, -1 * m1[2][1], m1[2][0], m1[2][1],         0],
                [0, 1,      m1[2][0],        0, m1[2][0],  m1[2][1]]];

    const m3 = math.inv(math.matrix(m2));

    const m4 = [revisedData[0][2],
                revisedData[0][4],
                revisedData[1][2],
                revisedData[1][4],
                revisedData[2][2],
                revisedData[2][4],
                ];

    const m5 = math.multiply(m3, math.matrix(m4));

    // const northUnitVector = [0, 1];
    const translationVector = [m5.get([0]), m5.get([1])];
    const magnitudeOfTranslationVector = Math.sqrt(Math.pow(translationVector[0], 2) +
                                         Math.pow(translationVector[1], 2));
    const unitTranslationVector = [translationVector[0] / magnitudeOfTranslationVector,
                                   translationVector[1] / magnitudeOfTranslationVector];

    // const angleBetweenNorthAndUnitVector = Math.acos((unitTranslationVector[0] * northUnitVector[0]) +
    //                                                  (unitTranslationVector[1] * northUnitVector[1])) * (180 / PI);
    // const azimutOfTranslationVector = translationVector[0] < 0 ?
    //                                         360 - angleBetweenNorthAndUnitVector :
    //                                         angleBetweenNorthAndUnitVector;

    const m6 = [[m5.get([3]), m5.get([4])],
                [m5.get([4]), m5.get([5])]];

    // Eigenvalue A is in [1] and B is in [0]
    // @ts-ignore
    const eigenValues = (math.eigs(math.matrix(m6)) as {values: math.Matrix, vectors: math.Matrix}).values;
    const correctedValues = eigenValues.get([1]) > eigenValues.get([0]) ?
                                [eigenValues.get([0]), eigenValues.get([1])] :
                                [eigenValues.get([1]), eigenValues.get([0])];

    // const maximumIninitesimalShearDeformation = 2 * Math.sqrt(Math.pow((m6[0][0] - m6[1][1]) / 2, 2) +
    //                                         Math.pow(m6[1][1], 2));
    // const areaDeformation = correctedValues[0] + correctedValues[1];

    // This returns values from 0 - 2e-6. We scale by 1e9 below, resulting in values 0-2000.
    const deformationSecondInvariant = Math.sqrt(correctedValues[0] ** 2 +  correctedValues[1] ** 2);

    const output: DeformationOutput = {
        secondInvariant: deformationSecondInvariant * Math.pow(10, 9),

        // these were old calculations that were included but are not currently
        // being used.

        // triangleCenter: {
        //     latitude: meanLatitude,
        //     longitude: meanLongitude
        // },
        // translationVector: {
        //     eastComponent: m5.get([0]),
        //     northComponent: m5.get([1]),
        //     azimuth_degrees: azimutOfTranslationVector,
        //     speed: magnitudeOfTranslationVector
        // },
        // rotation_degrees: m5.get([2]) * (180 / PI),
        // rotation_nanoRad: m5.get([2]) * Math.pow(10, 9),
        // directionOfRotation: m5.get([2]) < 0 ? "clockwise" : "anit-clockwise",
        // maxHorizontalExtension: correctedValues[0],
        // minHorizontalExtension: correctedValues[1],
        // maxShearDeformation: maximumIninitesimalShearDeformation * Math.pow(10, 9),
        // areaDeformation: areaDeformation * Math.pow(10, 9),
    };

    return output;
}

// Helper standard deviation and averaging functions
// Taken from:
// https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function standardDeviation(values: number[]){
    const avg = average(values);

    const squareDiffs = values.map((value) => {
      const diff = value - avg;
      const sqrDiff = diff * diff;
      return sqrDiff;
    });

    const avgSquareDiff = average(squareDiffs);

    const stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data: number[]){
    // tslint:disable-next-line
    const sum = data.reduce((sum: number, value: number) => {
        return sum + value;
    }, 0);

    const avg = sum / data.length;
    return avg;
}

export default deformationCalc;

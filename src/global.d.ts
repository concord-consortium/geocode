declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.csv";
declare module "*.kml";
declare module "*.png";
declare module "*.vel";
declare module "*.xml";

declare module "js-interpreter";

// used by libraries like React and MST to control runtime behavior
declare namespace process {
  const env: {
    NODE_ENV: string; // e.g. "development" or "production"
    [index: string]: string
  };
}

declare global {
  interface Window {
    Cesium: typeof import("cesium");
  }
}

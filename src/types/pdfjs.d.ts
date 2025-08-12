declare module "pdfjs-dist/legacy/build/pdf.js" {
  const pdfjs: any; // we’re using the CJS build; types are noisy in RN
  export = pdfjs;
}
declare module "pdfjs-dist/legacy/build/pdf.worker.entry" {
  const workerEntry: any;
  export = workerEntry;
}

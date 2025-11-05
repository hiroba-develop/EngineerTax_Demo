declare module 'pdfjs-dist/legacy/build/pdf' {
  export * from 'pdfjs-dist/types/src/pdf';
  export { GlobalWorkerOptions } from 'pdfjs-dist/types/src/pdf';
}

declare module 'pdfjs-dist/legacy/build/pdf.worker?worker&url' {
  const workerSrc: string;
  export default workerSrc;
}


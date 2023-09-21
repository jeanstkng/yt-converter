// stream-to-blob.d.ts
declare module "stream-to-blob" {
  interface ModuleFunction {
    (stream: any, mimeType?: string): ReturnType;
  }

  const moduleFunction: ModuleFunction;
  export default moduleFunction;
}

// Allow CSS imports in TypeScript
declare module "*.css" {
  const content: string;
  export default content;
}

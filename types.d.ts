declare module "*.json" {
  const value: unknown;
  export default value;
}

type ConfigValue = string | number | boolean | null;

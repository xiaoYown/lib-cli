export interface CommandArgs {
  options: {
    [key: string]: boolean;
  };
  args: string[];
}

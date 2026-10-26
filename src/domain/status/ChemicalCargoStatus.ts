export const ChemicalCargoStatus = {
  registered: "Registered",
  underAnalyses: "Under Analyses",
  underInspection: "Under inspection",
  released: "Released",
  blocked: "Blocked",
  moving: "Moving",
  done: "Done",
  canceled: "Canceled",
};

export type ChemicalCargoStatusKey = keyof typeof ChemicalCargoStatus;

export default ChemicalCargoStatus;

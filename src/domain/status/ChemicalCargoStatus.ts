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

export function getStatusKey(description: string) {
  return (Object.keys(ChemicalCargoStatus) as ChemicalCargoStatusKey[]).find(
    (key) => ChemicalCargoStatus[key] === description,
  );
}

export default ChemicalCargoStatus;

import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [ChemicalCargoStatus.registered]: [
    ChemicalCargoStatus.underAnalyses,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.underAnalyses]: [
    ChemicalCargoStatus.underInspection,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.underInspection]: [
    ChemicalCargoStatus.released,
    ChemicalCargoStatus.blocked,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.released]: [
    ChemicalCargoStatus.moving,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.blocked]: [ChemicalCargoStatus.canceled],
  [ChemicalCargoStatus.moving]: [ChemicalCargoStatus.done],
  [ChemicalCargoStatus.done]: [],
  [ChemicalCargoStatus.canceled]: [],
};

export function canTransition(from: string, to: string) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

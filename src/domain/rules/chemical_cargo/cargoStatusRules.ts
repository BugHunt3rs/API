import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_CANCELED: "Cargo status is canceled",
  TRANSITION_NOT_ALLOWED: "Status transition not allowed",
};

const ALLOWED_CHEMICAL_CARGO_MOVEMENTS: Record<string, string[]> = {
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

export function canMoveChemicalCargo(from: string, to: string) {
  if (ALLOWED_CHEMICAL_CARGO_MOVEMENTS[from]?.includes(to)) {
    return { canMove: true, cannotMoveReasons: [] as string[] };
  }

  const cannotMoveReasons: string[] = [];

  if (from === ChemicalCargoStatus.blocked) {
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
  } else if (from === ChemicalCargoStatus.canceled) {
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_CANCELED);
  } else {
    cannotMoveReasons.push(CANNOT_MOVE_REASON.TRANSITION_NOT_ALLOWED);
  }

  return { canMove: false, cannotMoveReasons };
}

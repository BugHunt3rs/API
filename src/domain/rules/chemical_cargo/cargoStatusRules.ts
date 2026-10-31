import ChemicalCargoStatus, {
  type ChemicalCargoStatusKey,
} from "@/domain/status/ChemicalCargoStatus";

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_CANCELED: "Cargo status is canceled",
  TRANSITION_NOT_ALLOWED: "Status transition not allowed",
  DOCUMENTATION_NOT_DELIVERED: "Documentation not delivered",
};

const TRANSITIONS_REQUIRING_DOCUMENTATION: [
  ChemicalCargoStatusKey,
  ChemicalCargoStatusKey,
][] = [
  ["underAnalyses", "underInspection"],
  ["underInspection", "released"],
];

const ALLOWED_CHEMICAL_CARGO_MOVEMENTS: Record<
  ChemicalCargoStatusKey,
  string[]
> = {
  registered: [ChemicalCargoStatus.underAnalyses, ChemicalCargoStatus.canceled],
  underAnalyses: [
    ChemicalCargoStatus.underInspection,
    ChemicalCargoStatus.canceled,
  ],
  underInspection: [
    ChemicalCargoStatus.released,
    ChemicalCargoStatus.blocked,
    ChemicalCargoStatus.canceled,
  ],
  released: [ChemicalCargoStatus.moving, ChemicalCargoStatus.canceled],
  blocked: [ChemicalCargoStatus.canceled],
  moving: [ChemicalCargoStatus.done],
  done: [],
  canceled: [],
};

export function canMoveChemicalCargo(
  from: ChemicalCargoStatusKey,
  to: ChemicalCargoStatusKey,
  documentationDelivered: boolean,
) {
  const possibleCargoStatusMovements = ALLOWED_CHEMICAL_CARGO_MOVEMENTS[from];
  const currentStatus = ChemicalCargoStatus[from];
  const desiredMovement = ChemicalCargoStatus[to];
  const cannotMoveReasons: string[] = [];
  let canMove = false;

  switch (currentStatus) {
    case ChemicalCargoStatus.canceled:
      cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_CANCELED);
      break;
    case ChemicalCargoStatus.blocked:
      canMove = desiredMovement === ChemicalCargoStatus.canceled;
      if (!canMove) cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
      break;
    default:
      canMove = possibleCargoStatusMovements.includes(desiredMovement);
      if (!canMove) {
        cannotMoveReasons.push(CANNOT_MOVE_REASON.TRANSITION_NOT_ALLOWED);
      }
  }

  const requiresDocumentation = TRANSITIONS_REQUIRING_DOCUMENTATION.some(
    ([requiredFrom, requiredTo]) => requiredFrom === from && requiredTo === to,
  );

  if (canMove && requiresDocumentation && !documentationDelivered) {
    canMove = false;
    cannotMoveReasons.push(CANNOT_MOVE_REASON.DOCUMENTATION_NOT_DELIVERED);
  }

  return { canMove, cannotMoveReasons };
}

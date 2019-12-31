import { GameStore } from "./GameStore";
import { GhostStore } from "./GhostStore";
import { action } from "mobx";
import { PacManStore } from "./PacManStore";
import { SPEED, Direction } from "../components/Types";
import { Coordinates } from "./Coordinates";
import { waysMatrix, WAY_FREE_ID } from "./MazeData";
import {
  screenFromTileCoordinate,
  tileFromScreen,
  TILE_SIZE,
} from "./Coordinates";

export const onTimeElapsed = action(
  ({ store, timestamp }: { store: GameStore; timestamp: number }) => {
    store.previousTimestamp = store.timestamp;
    store.timestamp = timestamp;
    updatePacMan({ pacManStore: store.pacMan, timestamp });
    for (const ghost of store.ghosts) {
      updateGhost({ ghostStore: ghost, timestamp });
    }
  }
);

export const isWayFreeAt = (tx: number, ty: number): boolean => {
  return waysMatrix[ty][tx] === WAY_FREE_ID;
};

export const getPacManMinX = (currentSX: number, currentSY: number) => {
  const [tx, ty] = tileFromScreen(currentSX, currentSY);
  if (isWayFreeAt(tx, ty)) {
    return screenFromTileCoordinate(0);
  }
  // The way is blocked. Can't continue beyond current tx.
  const sx = screenFromTileCoordinate(tx);
  return sx;
};

const TILE_CENTER_OFFSET = TILE_SIZE / 2;

export const isTileCenter = (sx: number, sy: number): boolean => {
  return (
    (sx - TILE_CENTER_OFFSET) % TILE_SIZE === 0 &&
    (sy - TILE_CENTER_OFFSET) % TILE_SIZE === 0
  );
};

const DIRECTION_TO_TILE_OFFSET = {
  RIGHT: [1, 0],
  LEFT: [-1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
};

const DIRECTION_TO_VELOCITY = {
  RIGHT: [SPEED, 0],
  LEFT: [-SPEED, 0],
  UP: [0, -SPEED],
  DOWN: [0, SPEED],
};

const nextTile = (
  tx: number,
  ty: number,
  direction: Direction
): Coordinates => {
  const [dx, dy] = DIRECTION_TO_TILE_OFFSET[direction];
  const nextTx = tx + dx;
  const nextTy = ty + dy;
  return [nextTx, nextTy];
};

const movePacMan = (pacManStore: PacManStore): void => {
  const [vx, vy] = DIRECTION_TO_VELOCITY[pacManStore.direction];
  pacManStore.x += vx;
  pacManStore.y += vy;
};

export const updatePacMan = ({
  pacManStore,
  timestamp,
}: {
  pacManStore: PacManStore;
  timestamp: number;
}): void => {
  pacManStore.timestamp = timestamp;

  if (isTileCenter(pacManStore.x, pacManStore.y)) {
    const [tx, ty] = tileFromScreen(pacManStore.x, pacManStore.y);
    // Change direction if necessary
    if (pacManStore.direction !== pacManStore.nextDirection) {
      pacManStore.direction = pacManStore.nextDirection;
    }

    // Move
    const [nextTileX, nextTileY] = nextTile(tx, ty, pacManStore.direction);
    if (isWayFreeAt(nextTileX, nextTileY)) {
      movePacMan(pacManStore);
    }
  } else {
    movePacMan(pacManStore);
  }
};

export const updateGhost = ({
  ghostStore,
  timestamp,
}: {
  ghostStore: GhostStore;
  timestamp: number;
}) => {
  ghostStore.timestamp = timestamp;

  ghostStore.x += ghostStore.vx;
  if (ghostStore.x > ghostStore.maxX) {
    ghostStore.x = ghostStore.maxX;
    ghostStore.vx = -1 * ghostStore.vx;
  }
  if (ghostStore.x <= ghostStore.minX) {
    ghostStore.x = ghostStore.minX;
    ghostStore.vx = -1 * ghostStore.vx;
  }

  ghostStore.y += ghostStore.vy;
  if (ghostStore.y > ghostStore.maxY) {
    ghostStore.y = ghostStore.maxY;
    ghostStore.vy = -1 * ghostStore.vy;
  }
  if (ghostStore.y <= ghostStore.minY) {
    ghostStore.y = ghostStore.minY;
    ghostStore.vy = -1 * ghostStore.vy;
  }
};

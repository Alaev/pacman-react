/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Board } from '../../components/Board';
import { FPS } from '../../components/FPS';
import { GhostsView } from '../../components/GhostsView';
import { MazeView } from '../../components/MazeView';
import { PacManView } from '../../components/PacMacView';
import { PillsView } from '../../components/PillView';
import { Score } from '../../components/Score';
import { Game } from '../../lib/Game';
import { StoreProvider } from '../../lib/StoreContext';
import { useGameLoop } from '../../lib/useGameLoop';
import { Controls } from './Controls';

const useKeyboard = (store: Game) => {
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    store.pacMan.setPressedKey(event.key);
  }, []);

  const onKeyUp = useCallback(() => {
    store.pacMan.setPressedKey('');
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  });
};

export const AnimationTestPage: React.FC = observer(() => {
  const store = useMemo(() => {
    const newStore = new Game();
    newStore.pacMan.setTileCoordinates({ x: 1, y: 1 });
    newStore.ghosts[0].ghostPaused = false;
    return newStore;
  }, []);

  useGameLoop(store);
  useKeyboard(store);

  return (
    <StoreProvider value={store}>
      <div className="Game">
        <Board>
          <MazeView />
          <PillsView />
          <PacManView />
          <GhostsView />
        </Board>
        <br />
        <br />
        <div className="Footer">
          <FPS className="mr-10" />
          <Score className="mr-10" />
          <Controls />
        </div>
      </div>
    </StoreProvider>
  );
});

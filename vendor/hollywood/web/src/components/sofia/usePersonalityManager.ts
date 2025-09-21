
import { useContext } from 'react';
import { PersonalityManagerContext } from './sofiaContexts';

export const usePersonalityManager = () => {
  const manager = useContext(PersonalityManagerContext);
  return manager;
};
